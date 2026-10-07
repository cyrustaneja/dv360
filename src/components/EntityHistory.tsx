import { useEffect, useState } from 'react'
import { api, type HistoryEvent } from '../lib/api'
import { Icon } from '../lib/icons'

/** Change-log timeline for an entity, read from the events log. */
export function EntityHistory({ type, id }: { type: string; id: string }) {
  const [events, setEvents] = useState<HistoryEvent[] | null>(null)
  useEffect(() => {
    let active = true
    api.history(type, id).then((r) => { if (active) setEvents(r.events) }).catch(() => { if (active) setEvents([]) })
    return () => { active = false }
  }, [type, id])

  if (events === null) return <div className="px-6 py-6 text-14 text-gtext-secondary">Loading history…</div>
  if (events.length === 0) return <div className="px-6 py-6 text-14 text-gtext-secondary">No changes recorded yet.</div>

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) }
    catch { return iso }
  }

  return (
    <div className="px-6 py-4">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 border-b border-gborder-light py-3">
          <Icon name={e.action === 'Deleted' ? 'delete' : e.action === 'Created' ? 'add_circle' : 'edit'} size={18} className="mt-0.5 text-gtext-secondary" />
          <div className="min-w-0">
            <div className="text-14 text-gtext-primary">{e.action}{e.note ? ` — ${e.note}` : ''}</div>
            <div className="text-12 text-gtext-secondary">{e.actor} · {fmt(e.at)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
