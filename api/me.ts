import { readSession } from './_lib/session'

/** GET /api/me → the current user's identity from the session cookie, or 401. */
export default async function handler(req: any, res: any) {
  const claims = await readSession(req)
  if (!claims) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }
  res.status(200).json({
    sub: claims.sub,
    email: claims.email,
    name: claims.name,
    role: claims.role,
    batch: claims.batch ?? null,
    course: claims.course ?? null,
  })
}
