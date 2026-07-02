import { requireSession, admin, isStaff } from './_lib/session.js'

const TABLES: Record<string, string> = {
  campaign: 'dv360_campaigns', io: 'dv360_insertion_orders', line_item: 'dv360_line_items',
  creative: 'dv360_creatives', targeting_template: 'dv360_targeting_templates', audience: 'dv360_audiences',
}

/**
 * GET /api/history?type=<entity>&id=<id> → change log for one entity, newest first.
 * Reads dv360_events filtered by payload.entity_id. Access: the caller must be
 * able to reach the entity's advertiser (staff see all).
 */
export default async function handler(req: any, res: any) {
  const claims = await requireSession(req, res)
  if (!claims) return
  const db = admin()
  const type = String(req.query?.type || '')
  const id = String(req.query?.id || '')
  if (!id) { res.status(400).json({ error: 'id is required.' }); return }

  // Access check via the entity's advertiser (if it still exists).
  if (TABLES[type]) {
    const { data: row } = await db.from(TABLES[type]).select('advertiser_id').eq('id', id).single()
    if (row) {
      let ok = isStaff(claims)
      if (!ok) {
        const { data: adv } = await db.from('dv360_advertisers').select('user_id').eq('id', row.advertiser_id).single()
        ok = adv?.user_id === claims.sub
      }
      if (!ok) { res.status(403).json({ error: 'No access.' }); return }
    } else if (!isStaff(claims)) {
      res.status(403).json({ error: 'No access.' }); return
    }
  }

  const { data, error } = await db
    .from('dv360_events')
    .select('event_type,payload,created_at')
    .eq('payload->>entity_id', id)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) { res.status(500).json({ error: error.message }); return }

  const events = (data ?? []).map((e: any) => ({
    action: e.payload?.action ?? e.event_type,
    actor: e.payload?.actor ?? 'Unknown',
    note: e.payload?.note ?? null,
    at: e.created_at,
  }))
  res.status(200).json({ events })
}
