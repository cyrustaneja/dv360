import { requireSession, admin, isStaff } from './_lib/session.js'

/**
 * GET  /api/advertisers          → advertisers the user can see (own; staff see all)
 * POST /api/advertisers {name,batch} → create one owned by the current user
 */
export default async function handler(req: any, res: any) {
  const claims = await requireSession(req, res)
  if (!claims) return
  const db = admin()

  if (req.method === 'GET') {
    let q = db.from('dv360_advertisers').select('id,name,batch,user_id').order('created_at')
    if (!isStaff(claims)) q = q.eq('user_id', claims.sub)
    const { data, error } = await q
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(200).json({ advertisers: data ?? [] })
    return
  }

  if (req.method === 'POST') {
    const body = parseBody(req)
    if (!body.name) { res.status(400).json({ error: 'Name is required.' }); return }
    const { data, error } = await db
      .from('dv360_advertisers')
      .insert({ name: body.name, batch: body.batch || claims.batch || null, user_id: claims.sub })
      .select('id,name,batch,user_id')
      .single()
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(200).json({ advertiser: data })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

function parseBody(req: any) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}
