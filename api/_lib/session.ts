/**
 * Shared serverless helpers for the Kraftshala Hub SSO model.
 *
 * Files under api/_lib are NOT routed by Vercel (underscore prefix) — this is a
 * plain module imported by the api/* functions.
 *
 * Flow:
 *  - The hub sends users to /sso?token=<RS256 JWT>.
 *  - verifyHubToken() validates that JWT against the hub's JWKS.
 *  - We then mint our OWN short-lived HS256 session JWT and store it in an
 *    httpOnly cookie. We never persist the raw hub token.
 *  - readSession() reads that cookie on every subsequent /api call.
 *  - All DB access uses the service-role key (server-only) and is scoped to the
 *    session's `sub` in code.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'

export const SESSION_COOKIE = 'dv360_session'
export const AUDIENCE = 'dv360'

export interface HubClaims {
  sub: string
  email: string
  name: string
  role: 'admin' | 'expert' | 'student'
  batch?: string
  course?: string
}

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

// ── Hub token verification ───────────────────────────────────────────────────

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL('/.well-known/jwks.json', env('HUB_URL')))
  }
  return jwks
}

export async function verifyHubToken(token: string): Promise<HubClaims> {
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: env('HUB_URL'),
    audience: AUDIENCE,
    algorithms: ['RS256'],
  })
  return {
    sub: String(payload.sub),
    email: String(payload.email ?? ''),
    name: String(payload.name ?? ''),
    role: (payload.role as HubClaims['role']) ?? 'student',
    batch: payload.batch ? String(payload.batch) : undefined,
    course: payload.course ? String(payload.course) : undefined,
  }
}

// ── Our own session cookie (HS256) ──────────────────────────────────────────

function sessionSecret(): Uint8Array {
  return new TextEncoder().encode(env('SESSION_SECRET'))
}

export async function createSession(claims: HubClaims): Promise<string> {
  return await new SignJWT({
    email: claims.email,
    name: claims.name,
    role: claims.role,
    batch: claims.batch,
    course: claims.course,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(sessionSecret())
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export async function readSession(req: any): Promise<HubClaims | null> {
  const token = parseCookies(req.headers?.cookie)[SESSION_COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] })
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      role: (payload.role as HubClaims['role']) ?? 'student',
      batch: payload.batch ? String(payload.batch) : undefined,
      course: payload.course ? String(payload.course) : undefined,
    }
  } catch {
    return null
  }
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production'
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=86400',
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

export function clearCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
}

// ── Service-role Supabase client (bypasses RLS; server-only) ─────────────────

let _admin: SupabaseClient | null = null
export function admin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      env('SUPABASE_URL', process.env.VITE_SUPABASE_URL),
      env('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } },
    )
  }
  return _admin
}

/** Read session or send 401 with the hub-launch hint. Returns null if unauthorized. */
export async function requireSession(req: any, res: any): Promise<HubClaims | null> {
  const claims = await readSession(req)
  if (!claims) {
    res.status(401).json({ error: 'Not authenticated. Please launch this simulation from the Kraftshala Hub.' })
    return null
  }
  return claims
}

export const isStaff = (c: HubClaims) => c.role === 'admin' || c.role === 'expert'
