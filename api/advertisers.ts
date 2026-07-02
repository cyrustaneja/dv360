import { requireSession, admin, isStaff } from './_lib/session.js'

/**
 * GET    /api/advertisers[?user_id=]  → advertisers the user can see.
 *        Students: only their own. Staff (admin/expert): all, with owner info;
 *        optional ?user_id filters to one student.
 * POST   /api/advertisers {name,batch} → create one owned by the current user
 * DELETE /api/advertisers?id=...       → delete (owner or staff). Cascades to all children.
 */
export default async function handler(req: any, res: any) {
  const claims = await requireSession(req, res)
  if (!claims) return
  const db = admin()

  if (req.method === 'GET') {
    let q = db
      .from('dv360_advertisers')
      .select('id,name,batch,user_id,owner:profiles!dv360_advertisers_user_id_fkey(email,full_name)')
      .order('created_at')
    if (!isStaff(claims)) q = q.eq('user_id', claims.sub)
    else if (req.query?.user_id) q = q.eq('user_id', String(req.query.user_id))
    const { data, error } = await q
    if (error) { res.status(500).json({ error: error.message }); return }
    const advertisers = (data ?? []).map((a: any) => ({
      id: a.id, name: a.name, batch: a.batch, user_id: a.user_id,
      owner_email: a.owner?.email ?? null, owner_name: a.owner?.full_name ?? null,
    }))
    res.status(200).json({ advertisers })
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
    res.status(200).json({ advertiser: { ...data, owner_email: claims.email, owner_name: claims.name } })
    return
  }

  if (req.method === 'DELETE') {
    const id = String(req.query?.id || '')
    if (!id) { res.status(400).json({ error: 'id is required.' }); return }
    const { data: existing } = await db.from('dv360_advertisers').select('user_id').eq('id', id).single()
    if (!existing) { res.status(404).json({ error: 'Not found.' }); return }
    if (!isStaff(claims) && existing.user_id !== claims.sub) {
      res.status(403).json({ error: 'No access.' }); return
    }
    const { error } = await db.from('dv360_advertisers').delete().eq('id', id)
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

function parseBody(req: any) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}
