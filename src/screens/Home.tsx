import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useAuth } from '../auth/AuthContext'
import { Icon, DV360Logo } from '../lib/icons'

/**
 * Landing screen after the hub signs you in: pick an advertiser, or create one.
 * Advertisers are private to each student (staff see all). Selecting one scopes
 * the whole app to that advertiser.
 */
export default function Home() {
  const navigate = useNavigate()
  const { state, selectAdvertiser, reloadAdvertisers, createAdvertiser } = useStore()
  const { me, role, signOut } = useAuth()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { reloadAdvertisers() }, [reloadAdvertisers])

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

  return (
    <div className="min-h-screen bg-gbg-page">
      <header className="flex h-14 items-center justify-between border-b border-gborder bg-white px-6">
        <div className="flex items-center gap-2">
          <DV360Logo size={26} />
          <span className="text-15 text-gtext-secondary">Display &amp; Video 360 — Training</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-12 text-gtext-secondary">
            {me?.name || me?.email} · <span className="capitalize">{role}</span>
            {me?.batch ? ` · ${me.batch}` : ''}
          </span>
          <button onClick={() => signOut()} className="text-13 font-medium text-gblue-700 hover:underline">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-gsans text-22 text-gtext-primary">Choose an advertiser</h1>
            <p className="mt-1 text-13 text-gtext-secondary">
              Open one of your advertisers, or create a new one to start building campaigns.
            </p>
          </div>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 rounded bg-gblue-600 px-4 py-2 text-13 font-medium text-white hover:bg-gblue-700"
            >
              <Icon name="add" size={18} /> New advertiser
            </button>
          )}
        </div>

        {creating && (
          <form onSubmit={submitCreate} className="mt-5 flex items-end gap-3 rounded-lg border border-gborder bg-white p-4">
            <label className="flex-1">
              <span className="mb-1 block text-12 text-gtext-secondary">Advertiser name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Practice Brand"
                className="h-10 w-full rounded border border-gborder px-3 text-13 focus:border-gblue-600 focus:outline-none"
              />
            </label>
            <button disabled={busy} className="h-10 rounded bg-gblue-600 px-4 text-13 font-medium text-white hover:bg-gblue-700 disabled:opacity-60">
              {busy ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => { setCreating(false); setName('') }} className="h-10 rounded px-3 text-13 text-gtext-secondary hover:bg-gbg-page">
              Cancel
            </button>
          </form>
        )}

        {state.advertisers.length === 0 && !creating ? (
          <div className="mt-8 rounded-lg border border-dashed border-gborder bg-white p-10 text-center">
            <Icon name="business" size={40} className="text-gtext-disabled" />
            <div className="mt-3 text-15 font-medium text-gtext-primary">No advertisers yet</div>
            <div className="mt-1 text-13 text-gtext-secondary">Create your first advertiser to get started.</div>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 inline-block rounded bg-gblue-600 px-4 py-2 text-13 font-medium text-white hover:bg-gblue-700"
            >
              New advertiser
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.advertisers.map((a) => (
              <button
                key={a.id}
                onClick={() => open(a.id)}
                className="flex flex-col items-start gap-2 rounded-lg border border-gborder bg-white p-5 text-left hover:border-gblue-600 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gblue-50">
                  <Icon name="business" size={22} className="text-gblue-700" />
                </div>
                <div className="text-15 font-medium text-gtext-primary">{a.name}</div>
                {a.batch && <div className="text-12 text-gtext-secondary">Batch: {a.batch}</div>}
                <div className="mt-1 flex items-center gap-1 text-12 font-medium text-gblue-700">
                  Open <Icon name="arrow_forward" size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
