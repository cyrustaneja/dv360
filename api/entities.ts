import { requireSession, admin, isStaff, type HubClaims } from './_lib/session.js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * GET   /api/entities?advertiser_id=...  → { campaigns, ios, lineItems, creatives }
 * POST  /api/entities { type, ...fields } → create one entity, returns { row }
 * PATCH /api/entities { type, id, ...fields } → update one entity, returns { row }
 *   type ∈ campaign | io | line_item | creative
 *
 * Everything is scoped to the current user (staff may act on any advertiser).
 */
const TABLES = {
  campaign: 'dv360_campaigns',
  io: 'dv360_insertion_orders',
  line_item: 'dv360_line_items',
  creative: 'dv360_creatives',
  targeting_template: 'dv360_targeting_templates',
  audience: 'dv360_audiences',
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
    const [c, i, l, cr, tt, au] = await Promise.all([
      db.from(TABLES.campaign).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.io).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.line_item).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.creative).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.targeting_template).select('*').eq('advertiser_id', advertiserId).order('created_at'),
      db.from(TABLES.audience).select('*').eq('advertiser_id', advertiserId).order('created_at'),
    ])
    res.status(200).json({
      campaigns: c.data ?? [],
      ios: i.data ?? [],
      lineItems: l.data ?? [],
      creatives: cr.data ?? [],
      templates: tt.data ?? [],
      audiences: au.data ?? [],
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

    // Activity log (awaited so it's durable on serverless).
    try {
      await db.from('dv360_events').insert({
        user_id: claims.sub,
        event_type: `${type}_created`,
        payload: { entity_id: data.id, entity_type: type, advertiser_id, name: fields.name ?? null, actor: claims.email, action: 'Created' },
      })
    } catch { /* non-fatal */ }

    res.status(200).json({ row: data })
    return
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req)
    const type = body.type as keyof typeof TABLES
    if (!type || !TABLES[type]) { res.status(400).json({ error: 'Unknown entity type.' }); return }
    const { type: _t, id, advertiser_id: _a, user_id: _u, created_at: _c, note: bodyNote, ...fields } = body
    if (!id) { res.status(400).json({ error: 'id is required.' }); return }

    // Verify the row exists and the caller can access its advertiser.
    const { data: existing } = await db.from(TABLES[type]).select('advertiser_id').eq('id', id).single()
    if (!existing) { res.status(404).json({ error: 'Not found.' }); return }
    if (!(await canAccessAdvertiser(db, claims, existing.advertiser_id))) {
      res.status(403).json({ error: 'No access to this entity.' }); return
    }

    const { data, error } = await db
      .from(TABLES[type])
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) { res.status(500).json({ error: error.message }); return }

    const note = (fields.settings && fields.settings.last_note) || bodyNote || null
    try {
      await db.from('dv360_events').insert({
        user_id: claims.sub,
        event_type: `${type}_updated`,
        payload: { entity_id: id, entity_type: type, name: data.name ?? null, actor: claims.email, action: 'Edited', note },
      })
    } catch { /* non-fatal */ }

    res.status(200).json({ row: data })
    return
  }

  if (req.method === 'DELETE') {
    const type = String(req.query?.type || '') as keyof typeof TABLES
    const id = String(req.query?.id || '')
    if (!type || !TABLES[type]) { res.status(400).json({ error: 'Unknown entity type.' }); return }
    if (!id) { res.status(400).json({ error: 'id is required.' }); return }
    const { data: existing } = await db.from(TABLES[type]).select('advertiser_id').eq('id', id).single()
    if (!existing) { res.status(404).json({ error: 'Not found.' }); return }
    if (!(await canAccessAdvertiser(db, claims, existing.advertiser_id))) {
      res.status(403).json({ error: 'No access to this entity.' }); return
    }
    const { error } = await db.from(TABLES[type]).delete().eq('id', id)
    if (error) { res.status(500).json({ error: error.message }); return }
    try { await db.from('dv360_events').insert({ user_id: claims.sub, event_type: `${type}_deleted`, payload: { entity_id: id, entity_type: type, actor: claims.email, action: 'Deleted' } }) } catch { /* non-fatal */ }
    res.status(200).json({ ok: true })
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
