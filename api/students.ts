import { requireSession, admin, isStaff } from './_lib/session.js'

/**
 * GET /api/students  → list of student profiles (id, email, name, batch) with an
 * advertiser count. Staff (admin/expert) only — this powers the Expert
 * "view any student" search.
 */
export default async function handler(req: any, res: any) {
  const claims = await requireSession(req, res)
  if (!claims) return
  if (!isStaff(claims)) { res.status(403).json({ error: 'Staff only.' }); return }
  const db = admin()

  const { data: profiles, error } = await db
    .from('profiles')
    .select('id,email,full_name,role,batch_id')
    .eq('role', 'student')
    .order('email')
  if (error) { res.status(500).json({ error: error.message }); return }

  // Advertiser counts per student.
  const { data: advs } = await db.from('dv360_advertisers').select('user_id')
  const counts: Record<string, number> = {}
  for (const a of advs ?? []) counts[a.user_id] = (counts[a.user_id] ?? 0) + 1

  const students = (profiles ?? []).map((p: any) => ({
    id: p.id, email: p.email, name: p.full_name, batch: p.batch_id ?? null,
    advertisers: counts[p.id] ?? 0,
  }))
  res.status(200).json({ students })
}
