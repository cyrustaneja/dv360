import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useAuth } from '../auth/AuthContext'
import { Icon, DV360Logo } from '../lib/icons'
import { GuidedTour } from '../components/GuidedTour'

/**
 * Landing screen after the hub signs you in.
 *  - Students: their own advertisers, can create more.
 *  - Staff (admin/expert): see all advertisers, can search a student to scope to
 *    just their work, and can open/edit/delete anyone's.
 */
export default function Home() {
  const navigate = useNavigate()
  const { state, selectAdvertiser, reloadAdvertisers, createAdvertiser, loadStudents, setViewingStudent, deleteAdvertiser } = useStore()
  const { me, role, isStaff, signOut } = useAuth()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [studentQuery, setStudentQuery] = useState('')

  useEffect(() => { reloadAdvertisers() }, [reloadAdvertisers])
  useEffect(() => { if (isStaff) loadStudents() }, [isStaff, loadStudents])

  const open = (id: string) => {
    selectAdvertiser(id)
    navigate('/advertiser/campaigns')
  }
  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const id = await createAdvertiser(name.trim(), me?.batch ?? undefined)
    setBusy(false)
    if (id) { setName(''); setCreating(false); open(id) }
  }
  const remove = async (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation()
    if (!confirm(`Delete advertiser “${label}” and everything inside it? This cannot be undone.`)) return
    await deleteAdvertiser(id)
  }

  const viewing = state.students.find((s) => s.id === state.viewingStudentId)
  const filteredStudents = state.students.filter((s) =>
    [s.email, s.name, s.batch].filter(Boolean).join(' ').toLowerCase().includes(studentQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gbg-page">
      <GuidedTour />
      <header className="flex h-14 items-center justify-between border-b border-gborder bg-white px-6">
        <div className="flex items-center gap-2">
          <DV360Logo size={26} />
          <span className="text-15 text-gtext-secondary">Display &amp; Video 360 — Training</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-12 text-gtext-secondary">
            {me?.name || me?.email} · <span className="capitalize">{role}</span>{me?.batch ? ` · ${me.batch}` : ''}
          </span>
          <button onClick={() => signOut()} className="text-14 font-medium text-gblue-700 hover:underline">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Expert / Admin: view any student */}
        {isStaff && (
          <div className="mb-6 rounded-lg border border-gborder bg-white p-4">
            <div className="flex items-center gap-2 text-14 font-medium text-gtext-primary">
              <Icon name="supervisor_account" size={18} className="text-gblue-700" />
              View student work
            </div>
            <p className="mt-1 text-12 text-gtext-secondary">
              Search a student to see and manage only their advertisers. You can edit and delete anything.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search by email, name or batch…"
                  className="h-9 w-72 rounded border border-gborder px-3 text-14 focus:border-gblue-600 focus:outline-none"
                />
              </div>
              <button
                onClick={() => { setViewingStudent(null); setStudentQuery('') }}
                className={`rounded-full border px-3 py-1 text-12 ${!state.viewingStudentId ? 'border-gblue-600 bg-gblue-50 text-gblue-700' : 'border-gborder text-gtext-primary hover:bg-gbg-page'}`}
              >
                All students
              </button>
              {viewing && (
                <span className="rounded-full bg-gblue-50 px-3 py-1 text-12 text-gblue-700">
                  Viewing: {viewing.email}
                </span>
              )}
            </div>
            {studentQuery && (
              <div className="mt-2 max-h-56 overflow-auto rounded border border-gborder-light">
                {filteredStudents.length === 0 ? (
                  <div className="px-3 py-2 text-12 text-gtext-secondary">No students match.</div>
                ) : filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setViewingStudent(s.id); setStudentQuery('') }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-14 hover:bg-gbg-page"
                  >
                    <span><span className="text-gtext-primary">{s.email}</span>{s.name ? <span className="text-gtext-secondary"> · {s.name}</span> : null}</span>
                    <span className="text-11 text-gtext-secondary">{s.advertisers} advertiser{s.advertisers === 1 ? '' : 's'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-gsans text-22 text-gtext-primary">Choose an advertiser</h1>
            <p className="mt-1 text-14 text-gtext-secondary">
              {isStaff
                ? (viewing ? `Showing ${viewing.email}’s advertisers.` : 'Showing all advertisers across students.')
                : 'Open one of your advertisers, or create a new one to start building campaigns.'}
            </p>
          </div>
          {!creating && (
            <button onClick={() => setCreating(true)} className="flex items-center gap-1 rounded bg-gblue-600 px-4 py-2 text-14 font-medium text-white hover:bg-gblue-700">
              <Icon name="add" size={18} /> New advertiser
            </button>
          )}
        </div>

        {creating && (
          <form onSubmit={submitCreate} className="mt-5 flex items-end gap-3 rounded-lg border border-gborder bg-white p-4">
            <label className="flex-1">
              <span className="mb-1 block text-12 text-gtext-secondary">Advertiser name</span>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Practice Brand"
                className="h-10 w-full rounded border border-gborder px-3 text-14 focus:border-gblue-600 focus:outline-none" />
            </label>
            <button disabled={busy} className="h-10 rounded bg-gblue-600 px-4 text-14 font-medium text-white hover:bg-gblue-700 disabled:opacity-60">
              {busy ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => { setCreating(false); setName('') }} className="h-10 rounded px-3 text-14 text-gtext-secondary hover:bg-gbg-page">Cancel</button>
          </form>
        )}

        {state.advertisers.length === 0 && !creating ? (
          <div className="mt-8 rounded-lg border border-dashed border-gborder bg-white p-10 text-center">
            <Icon name="business" size={40} className="text-gtext-disabled" />
            <div className="mt-3 text-15 font-medium text-gtext-primary">No advertisers {viewing ? 'for this student' : 'yet'}</div>
            <div className="mt-1 text-14 text-gtext-secondary">Create your first advertiser to get started.</div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.advertisers.map((a) => (
              <div key={a.id} className="group relative flex flex-col items-start gap-2 rounded-lg border border-gborder bg-white p-5 hover:border-gblue-600 hover:shadow-sm">
                {isStaff && (
                  <button
                    onClick={(e) => remove(e, a.id, a.name)}
                    title="Delete advertiser"
                    className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full text-gtext-secondary hover:bg-gstatus-red/10 hover:text-gstatus-red group-hover:flex"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                )}
                <button className="flex w-full flex-col items-start gap-2 text-left" onClick={() => open(a.id)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gblue-50">
                    <Icon name="business" size={22} className="text-gblue-700" />
                  </div>
                  <div className="text-15 font-medium text-gtext-primary">{a.name}</div>
                  {a.batch && <div className="text-12 text-gtext-secondary">Batch: {a.batch}</div>}
                  {isStaff && a.owner_email && <div className="text-11 text-gtext-secondary">Owner: {a.owner_email}</div>}
                  <div className="mt-1 flex items-center gap-1 text-12 font-medium text-gblue-700">Open <Icon name="arrow_forward" size={14} /></div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
