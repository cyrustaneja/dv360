import { verifyHubToken, createSession, sessionCookie } from './_lib/session.js'

/**
 * GET /sso?token=<hub RS256 JWT>  (the hub's default SSO_PATH; routed here via vercel.json)
 * Verifies the hub token, mints our session cookie, and redirects into the app.
 * On failure: 401 with the "launch from the hub" message — never a login form.
 */
export default async function handler(req: any, res: any) {
  const token = (req.query?.token as string) || ''
  if (!token) {
    res.status(401).send(launchPage())
    return
  }
  try {
    const claims = await verifyHubToken(token)
    const session = await createSession(claims)
    res.setHeader('Set-Cookie', sessionCookie(session))
    // Redirect into the SPA (HashRouter → home/advertiser picker).
    res.statusCode = 302
    res.setHeader('Location', '/')
    res.end()
  } catch {
    res.status(401).send(launchPage())
  }
}

function launchPage(): string {
  const hub = process.env.HUB_URL || '#'
  return `<!doctype html><html><head><meta charset="utf-8"><title>Launch from Kraftshala Hub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body{font-family:Roboto,Arial,sans-serif;background:#f1f3f4;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{background:#fff;border:1px solid #dadce0;border-radius:8px;padding:40px;max-width:420px;text-align:center}
  h1{font-size:20px;color:#202124}p{color:#5f6368;font-size:14px}a{display:inline-block;margin-top:16px;background:#1a73e8;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-size:14px}</style></head>
  <body><div class="card"><h1>Please launch from the Kraftshala Hub</h1>
  <p>This simulation can only be opened from the Kraftshala Simulation Hub, which signs you in automatically.</p>
  <a href="${hub}">Go to the Hub</a></div></body></html>`
}
