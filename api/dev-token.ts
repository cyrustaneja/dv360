import { createSession, sessionCookie, admin, type HubClaims } from './_lib/session.js'

/**
 * TEST-ONLY login ("backstage pass"). Lets us sign in as a fake student WITHOUT
 * the real Kraftshala Hub, so we can verify create/save flows during development.
 *
 * Hard-disabled unless the env var DEV_LOGIN_SECRET is set, and the caller must
 * pass the same value as ?key=. NEVER set DEV_LOGIN_SECRET in production.
 *
 * Usage:  /api/dev-token?key=YOUR_SECRET[&role=student|expert|admin][&email=...][&name=...]
 */
export default async function handler(req: any, res: any) {
  // Allowed when running locally (host = localhost), OR when DEV_LOGIN_SECRET is
  // set and the matching ?key= is provided. On Vercel prod the host is never
  // localhost and DEV_LOGIN_SECRET is unset, so this stays fully disabled (404).
  const host = String(req.headers?.host || '')
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  const secret = process.env.DEV_LOGIN_SECRET
  if (!isLocal) {
    if (!secret) {
      res.status(404).json({ error: 'Disabled. Set DEV_LOGIN_SECRET to enable test login.' })
      return
    }
    if ((req.query?.key as string) !== secret) {
      res.status(401).json({ error: 'Bad key.' })
      return
    }
  }

  const role = (['student', 'expert', 'admin'].includes(req.query?.role)
    ? req.query.role
    : 'student') as HubClaims['role']

  const email = (req.query?.email as string) || 'test.student@kraftshala.dev'
  const name = (req.query?.name as string) || 'Test Student'

  // The dv360_ tables reference profiles(id) → auth.users(id), so the test user
  // must be a REAL auth user with a profile. Find-or-create one, then use its id.
  const db = admin()
  let userId: string
  try {
    const { data: list } = await db.auth.admin.listUsers()
    const existing = list?.users?.find((u) => u.email === email)
    if (existing) {
      userId = existing.id
    } else {
      const { data: created, error } = await db.auth.admin.createUser({
        email, email_confirm: true, user_metadata: { full_name: name },
      })
      if (error || !created.user) throw new Error(error?.message || 'createUser failed')
      userId = created.user.id
    }
    // Ensure a profile row exists (hub has no auto-create trigger).
    await db.from('profiles').upsert(
      { id: userId, email, full_name: name, role },
      { onConflict: 'id' },
    )
  } catch (e) {
    res.status(500).json({ error: `Test user provisioning failed: ${(e as Error).message}` })
    return
  }

  const claims: HubClaims = {
    sub: userId,
    email,
    name,
    role,
    batch: (req.query?.batch as string) || 'test-batch',
    course: 'marketing_launchpad',
  }

  const session = await createSession(claims)
  res.setHeader('Set-Cookie', sessionCookie(session))
  res.statusCode = 302
  res.setHeader('Location', '/')
  res.end()
}
