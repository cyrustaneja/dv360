import { useState } from 'react'
import { Icon } from '../lib/icons'

/**
 * DV360-style targeting builder — matches the real "New targeting template" UI:
 * an Inventory source card + a Targeting card made of rows (summary + pencil that
 * opens a picker modal), plus an "Add targeting" menu. Reused by line items and
 * targeting templates. Options are realistic India-context demo data.
 */
export interface Targeting {
  quality?: string
  exchanges?: string[]
  deals?: string[]
  deal_groups?: string[]
  categories?: string[]
  environment?: string[]
  position?: string[]
  viewability?: string
  language?: string[]
  audiences?: string[]
  geography?: string[]
  days?: string[]
  age?: string[]
  gender?: string[]
  devices?: string[]
  browsers?: string[]
  optimized?: boolean
}

export const SAMPLE = {
  quality: ['Authorized Direct', 'Authorized and Non-Participating Publishers', 'Authorized Direct and Reseller'],
  exchanges: ['Google Ad Manager', 'OpenX', 'PubMatic', 'Magnite', 'Index Exchange', 'Xandr', 'Smaato', 'Verve', 'Sharethrough', 'TripleLift'],
  deals: ['Times Internet — Premium Display', 'HT Media — News ROS', 'Hotstar — CTV Prime', 'ZEE5 — Video', 'Jio Ads — Sports'],
  deal_groups: ['Festive Premium Group', 'News Publishers Group', 'CTV Streaming Group'],
  categories: ['Arts & Entertainment', 'Autos & Vehicles', 'Business & Industrial', 'Finance', 'Food & Drink', 'Health', 'News', 'Shopping', 'Sports', 'Technology', 'Travel', 'Education'],
  environment: ['Web', 'Web optimized for mobile', 'Mobile app'],
  position: ['Above the fold', 'Below the fold', 'Unknown'],
  viewability: ['Any', '10% or greater', '20% or greater', '30% or greater', '40% or greater', '50% or greater', '60% or greater', '70% or greater'],
  language: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi'],
  audiences: ['Affinity · Outdoor Enthusiasts', 'Affinity · Sports Fans', 'Affinity · Foodies', 'Affinity · Technophiles', 'Affinity · Travel Buffs', 'In-market · Consumer Electronics', 'In-market · Apparel & Accessories', 'In-market · Real Estate', 'In-market · Education', 'Your data · Site visitors', 'Your data · Cart abandoners'],
  geography: ['Mumbai, Maharashtra', 'Delhi', 'Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'India (all)'],
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  age: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Unknown'],
  gender: ['Female', 'Male', 'Unknown'],
  devices: ['Computer', 'Smartphone', 'Tablet', 'Connected TV'],
  browsers: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Samsung Internet'],
}

export function emptyTargeting(): Targeting {
  return { quality: SAMPLE.quality[1], viewability: 'Any', exchanges: [], deals: [], deal_groups: [], categories: [], environment: [], position: [], language: [], audiences: [], geography: [], days: [], age: [], gender: [], devices: [], browsers: [], optimized: false }
}

interface Dim { key: keyof Targeting; label: string; kind: 'multi' | 'single'; options: string[] }
const DIMS: Dim[] = [
  { key: 'audiences', label: 'Audience lists', kind: 'multi', options: SAMPLE.audiences },
  { key: 'geography', label: 'Geography', kind: 'multi', options: SAMPLE.geography },
  { key: 'categories', label: 'Categories', kind: 'multi', options: SAMPLE.categories },
  { key: 'devices', label: 'Device & operating system', kind: 'multi', options: SAMPLE.devices },
  { key: 'language', label: 'Language', kind: 'multi', options: SAMPLE.language },
  { key: 'days', label: 'Day & time', kind: 'multi', options: SAMPLE.days },
  { key: 'age', label: 'Demographics · Age', kind: 'multi', options: SAMPLE.age },
  { key: 'gender', label: 'Demographics · Gender', kind: 'multi', options: SAMPLE.gender },
  { key: 'environment', label: 'Environment', kind: 'multi', options: SAMPLE.environment },
  { key: 'position', label: 'On-screen position', kind: 'multi', options: SAMPLE.position },
  { key: 'browsers', label: 'Browser', kind: 'multi', options: SAMPLE.browsers },
  { key: 'viewability', label: 'Viewability', kind: 'single', options: SAMPLE.viewability },
]

export function TargetingBuilder({ value, onChange, audienceOptions }: {
  value: Targeting
  onChange: (t: Targeting) => void
  /** Extra audience names (the student's own created audiences) shown atop the list. */
  audienceOptions?: string[]
}) {
  const v = { ...emptyTargeting(), ...value }
  const set = (patch: Partial<Targeting>) => onChange({ ...v, ...patch })
  // Merge the student's created audiences with the demo Google audiences.
  const dims: Dim[] = audienceOptions?.length
    ? DIMS.map((d) => d.key === 'audiences' ? { ...d, options: [...audienceOptions, ...SAMPLE.audiences] } : d)
    : DIMS

  // which dimension modal is open, and the inventory modal
  const [modal, setModal] = useState<{ kind: 'dim' | 'inv'; key: string; label: string; options: string[]; single?: boolean } | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // dimensions currently shown as rows: those with a value, plus explicitly added
  const hasVal = (d: Dim) => d.kind === 'single' ? (v.viewability && v.viewability !== 'Any') : ((v[d.key] as string[])?.length ?? 0) > 0
  const [added, setAdded] = useState<string[]>(() => DIMS.filter(hasVal).map((d) => d.key as string))
  const shownDims = dims.filter((d) => added.includes(d.key as string))
  const available = dims.filter((d) => !added.includes(d.key as string))

  const summaryFor = (d: Dim) => {
    if (d.kind === 'single') return v.viewability && v.viewability !== 'Any' ? v.viewability : 'Any'
    const arr = (v[d.key] as string[]) ?? []
    return arr.length ? (arr.length <= 2 ? arr.join(', ') : `${arr.length} selected`) : 'None selected'
  }

  const openDim = (d: Dim) => setModal({ kind: 'dim', key: d.key as string, label: d.label, options: d.options, single: d.kind === 'single' })

  return (
    <div className="space-y-5">
      {/* ── Inventory source ─────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-15 text-gtext-primary">Inventory source</h3>
        <div className="rounded-lg border border-gborder bg-white">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-52 shrink-0 text-14 text-gtext-primary">Quality</div>
            <select value={v.quality} onChange={(e) => set({ quality: e.target.value })} className="h-9 w-80 rounded border border-gborder px-2 text-14">
              {SAMPLE.quality.map((o) => <option key={o}>{o}</option>)}
            </select>
            <div className="hidden flex-1 text-12 text-gtext-secondary lg:block">Select who you want to buy web and app inventory from.</div>
          </div>
          <InvRow label="Public inventory"
            summary={(v.exchanges?.length ?? 0) > 0 ? `${v.exchanges!.length} exchanges selected · Targeting new exchanges` : 'No exchanges selected'}
            checked={(v.exchanges?.length ?? 0) > 0}
            onEdit={() => setModal({ kind: 'inv', key: 'exchanges', label: 'Public inventory', options: SAMPLE.exchanges })} />
          <InvRow label="Deals and packages"
            summary={(v.deals?.length ?? 0) > 0 ? `${v.deals!.length} deals and packages selected` : '0 deals and packages selected'}
            checked={(v.deals?.length ?? 0) > 0}
            onEdit={() => setModal({ kind: 'inv', key: 'deals', label: 'Deals and packages', options: SAMPLE.deals })} />
          <InvRow label="Deal groups and preferred deal groups"
            summary={(v.deal_groups?.length ?? 0) > 0 ? `${v.deal_groups!.length} inventory groups selected` : 'No inventory groups selected'}
            checked={(v.deal_groups?.length ?? 0) > 0}
            last onEdit={() => setModal({ kind: 'inv', key: 'deal_groups', label: 'Deal groups and preferred deal groups', options: SAMPLE.deal_groups })} />
        </div>
      </div>

      {/* ── Targeting ────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-15 text-gtext-primary">Targeting</h3>
        <div className="rounded-lg border border-gborder bg-white">
          {shownDims.length === 0 && (
            <div className="px-5 py-4 text-14 text-gtext-secondary">No targeting added yet. Use “Add targeting” to narrow who sees this.</div>
          )}
          {shownDims.map((d, i) => (
            <div key={d.key as string} className={`flex items-center gap-4 px-5 py-4 ${i < shownDims.length - 1 ? 'border-b border-gborder-light' : ''}`}>
              <div className="w-52 shrink-0 text-14 text-gtext-primary">{d.label}</div>
              <div className="flex flex-1 items-center gap-2 text-14 text-gtext-secondary">
                {summaryFor(d) !== 'None selected' && summaryFor(d) !== 'Any' && <Icon name="check" size={16} className="text-gstatus-green" />}
                {summaryFor(d)}
              </div>
              <button onClick={() => openDim(d)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page">
                <Icon name="edit" size={18} />
              </button>
              <button onClick={() => setAdded((a) => a.filter((k) => k !== d.key)) } title="Remove" className="flex h-8 w-8 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page">
                <Icon name="close" size={18} />
              </button>
            </div>
          ))}

          {/* Optimized targeting */}
          <label className="flex items-start gap-2 border-t border-gborder-light px-5 py-4 text-14 text-gtext-primary">
            <input type="checkbox" checked={!!v.optimized} onChange={(e) => set({ optimized: e.target.checked })} className="mt-0.5" />
            <span>
              Use optimized targeting
              <span className="mt-0.5 block text-12 text-gtext-secondary">Reach additional relevant audiences likely to convert, beyond your manual targeting.</span>
            </span>
          </label>
        </div>

        {/* Add targeting menu */}
        <div className="relative mt-2">
          <button onClick={() => setAddOpen((o) => !o)} className="flex items-center gap-1 text-14 font-medium text-gblue-700 hover:underline">
            <Icon name="add" size={18} /> Add targeting
          </button>
          {addOpen && available.length > 0 && (
            <div className="absolute z-30 mt-1 max-h-72 w-64 overflow-auto rounded-lg border border-gborder bg-white py-1 shadow-gmenu">
              {available.map((d) => (
                <button key={d.key as string}
                  onClick={() => { setAdded((a) => [...a, d.key as string]); setAddOpen(false); openDim(d) }}
                  className="block w-full px-4 py-2 text-left text-14 text-gtext-primary hover:bg-gbg-page">
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <PickerModal
          title={modal.label}
          options={modal.options}
          single={modal.single}
          selected={modal.single ? [v.viewability ?? 'Any'] : ((v[modal.key as keyof Targeting] as string[]) ?? [])}
          onCancel={() => setModal(null)}
          onApply={(sel) => {
            if (modal.single) set({ viewability: sel[0] ?? 'Any' })
            else set({ [modal.key]: sel } as Partial<Targeting>)
            setModal(null)
          }}
        />
      )}
    </div>
  )
}

function InvRow({ label, summary, checked, onEdit, last }: { label: string; summary: string; checked: boolean; onEdit: () => void; last?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-t border-gborder-light ${last ? '' : ''}`}>
      <div className="w-52 shrink-0 text-14 text-gtext-primary">{label}</div>
      <div className="flex flex-1 items-center gap-2 text-14 text-gtext-secondary">
        {checked && <Icon name="check" size={16} className="text-gstatus-green" />}
        {summary}
      </div>
      <button onClick={onEdit} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page">
        <Icon name="edit" size={18} />
      </button>
    </div>
  )
}

function PickerModal({ title, options, selected, single, onApply, onCancel }: {
  title: string; options: string[]; selected: string[]; single?: boolean
  onApply: (sel: string[]) => void; onCancel: () => void
}) {
  const [sel, setSel] = useState<string[]>(selected)
  const [q, setQ] = useState('')
  const toggle = (o: string) => single ? setSel([o]) : setSel((s) => s.includes(o) ? s.filter((x) => x !== o) : [...s, o])
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="flex max-h-[80vh] w-[560px] max-w-full flex-col rounded-lg bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-gborder px-5 py-3">
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gbg-page"><Icon name="close" size={20} className="text-gtext-secondary" /></button>
          <h3 className="text-15 text-gtext-primary">{title}</h3>
          <span className="ml-auto text-12 text-gtext-secondary">{single ? (sel[0] ?? '') : `${sel.length} selected`}</span>
        </div>
        <div className="border-b border-gborder-light px-5 py-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter a search term or select from the list"
            className="h-9 w-full rounded border border-gborder px-3 text-14 focus:border-gblue-600 focus:outline-none" />
        </div>
        <div className="flex-1 overflow-auto px-2 py-1">
          {filtered.map((o) => {
            const on = sel.includes(o)
            return (
              <label key={o} className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-14 text-gtext-primary hover:bg-gbg-page">
                <input type={single ? 'radio' : 'checkbox'} checked={on} onChange={() => toggle(o)} />
                {o}
              </label>
            )
          })}
          {filtered.length === 0 && <div className="px-3 py-4 text-12 text-gtext-secondary">No matches.</div>}
        </div>
        <div className="flex items-center gap-4 border-t border-gborder px-5 py-3">
          <button onClick={() => onApply(sel)} className="rounded bg-gblue-600 px-4 py-1.5 text-14 font-medium text-white hover:bg-gblue-700">Apply</button>
          <button onClick={onCancel} className="text-14 font-medium text-gblue-700 hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  )
}

/** Compact read-only summary of a targeting object (for detail views). */
export function TargetingSummary({ t }: { t: Targeting }) {
  const rows: [string, string[] | undefined][] = [
    ['Audiences', t.audiences], ['Geography', t.geography], ['Categories', t.categories],
    ['Devices', t.devices], ['Languages', t.language], ['Days', t.days],
    ['Age', t.age], ['Gender', t.gender], ['Environment', t.environment],
    ['Position', t.position], ['Browsers', t.browsers],
  ]
  return (
    <dl className="divide-y divide-gborder-light">
      <Row k="Inventory quality" v={t.quality ?? '—'} />
      <Row k="Exchanges" v={(t.exchanges ?? []).join(', ') || '—'} />
      <Row k="Deals" v={(t.deals ?? []).join(', ') || '—'} />
      {rows.map(([k, arr]) => <Row key={k} k={k} v={(arr ?? []).join(', ') || '—'} />)}
      <Row k="Viewability" v={t.viewability ?? 'Any'} />
      <Row k="Optimized targeting" v={t.optimized ? 'On' : 'Off'} />
    </dl>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex px-1 py-2 text-14">
      <dt className="w-40 shrink-0 text-gtext-secondary">{k}</dt>
      <dd className="text-gtext-primary">{v}</dd>
    </div>
  )
}
