import { clearCookie } from './_lib/session'

/** POST /api/logout → clear the local session cookie. */
export default async function handler(_req: any, res: any) {
  res.setHeader('Set-Cookie', clearCookie())
  res.status(200).json({ ok: true })
}
