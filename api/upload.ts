import { requireSession, admin } from './_lib/session.js'

/**
 * POST /api/upload { filename, contentType, dataBase64 }
 * Uploads an image to the public dv360-creatives bucket and returns its URL.
 * Auth required (any signed-in user). Used by the creative builder for real images.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const claims = await requireSession(req, res)
  if (!claims) return

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const { filename, contentType, dataBase64 } = body
  if (!dataBase64) { res.status(400).json({ error: 'No file data.' }); return }

  const buffer = Buffer.from(String(dataBase64), 'base64')
  if (buffer.length > 5 * 1024 * 1024) { res.status(400).json({ error: 'Image too large (max 5 MB).' }); return }

  const safe = String(filename || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${claims.sub}/${Date.now()}-${safe}`
  const db = admin()
  const { error } = await db.storage.from('dv360-creatives').upload(path, buffer, {
    contentType: contentType || 'image/png',
    upsert: true,
  })
  if (error) { res.status(500).json({ error: error.message }); return }

  const { data } = db.storage.from('dv360-creatives').getPublicUrl(path)
  res.status(200).json({ url: data.publicUrl })
}
