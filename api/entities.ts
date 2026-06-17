import { requireSession, admin, isStaff, type HubClaims } from './_lib/session'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * GET  /api/entities?advertiser_id=...  → { campaigns, ios, lineItems, creatives }
 * POST /api/entities { type, ...fields } → create one entity, returns { row }
 *   type ∈ campaign | io | line_item | creative
 *
 * Everything is scoped to the current user (staff may act on any advertiser).
 */
const TABLES = {
  campaign: 'dv360_campaigns',
  io: 'dv360_insertion_orders',
  line_item: 'dv360_line_items',
  creative: 'dv360_creatives',
} as const

export default async function handler(req: any, res: any) {
  const claims = await requireSession(req, res)
  if (!claims) return
  const db = admin()

  if (req.method === 'GET') {
    const advertiserId = String(req.query?.advertiser_id || '')
    if (!advertiserId) { res.status(400).json({ error: 'advertiser_id is required.' }); return }
    if (!(await canAccessAdvertiser(db, claims, advertiserId))) {
      res.status(403).json({ error: 'No access to this advertiser.' }); return
    }
    const [c, i, l, cr] = await Promise.all([
      db.from(TABLES.campaign).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.io).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.line_item).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.creative).select('*').eq('advertiser_id', advertiserId).order('created_at'),
    ])
    res.status(200).json({
      campaigns: c.data ?? [],
      ios: i.data ?? [],
      lineItems: l.data ?? [],
      creatives: cr.data ?? [],
    })
    return
  }

  if (req.method === 'POST') {
    const body = parseBody(req)
    const type = body.type as keyof typeof TABLES
    if (!type || !TABLES[type]) { res.status(400).json({ error: 'Unknown entity type.' }); return }
    const { type: _t, advertiser_id, ...fields } = body
    if (!advertiser_id) { res.status(400).json({ error: 'advertiser_id is required.' }); return }
    if (!(await canAccessAdvertiser(db, claims, advertiser_id))) {
      res.status(403).json({ error: 'No access to this advertiser.' }); return
    }
    const { data, error } = await db
      .from(TABLES[type])
      .insert({ ...fields, advertiser_id, user_id: claims.sub })
      .select('*')
      .single()
    if (error) { res.status(500).json({ error: error.message }); return }

    // Best-effort activity log.
    db.from('dv360_events').insert({
      user_id: claims.sub,
      event_type: `${type}_created`,
      payload: { advertiser_id, name: fields.name ?? null },
    }).then(() => {}, () => {})

    res.status(200).json({ row: data })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

async function canAccessAdvertiser(db: SupabaseClient, claims: HubClaims, advertiserId: string): Promise<boolean> {
  if (isStaff(claims)) return true
  const { data } = await db.from('dv360_advertisers').select('user_id').eq('id', advertiserId).single()
  return data?.user_id === claims.sub
}

function parseBody(req: any) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}
