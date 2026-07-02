import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'
import { TargetingBuilder, type Targeting } from '../../components/TargetingBuilder'
import { isYouTubeType } from '../../components/TypePicker'
import { EntityHistory } from '../../components/EntityHistory'

/**
 * DV360-style line item detail — inline editable (Save / Reset / note bar), with
 * the layout adapting to the line item type: Video/Connected TV → YouTube layout
 * (media type, objective, ad format, ad groups…); Display/Audio → display layout
 * (inventory source + creatives). Targeting uses the same builder as templates.
 */
export default function LineItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateLineItem, deleteEntity } = useStore()
  const li = state.lineItems.find((l) => l.id === id) ?? state.lineItems[0]
  const raw = state.raw.lineItems.find((l) => l.id === id)
  const parentIO = state.ios.find((io) => io.id === li?.ioId)
  const parentCampaign = state.campaigns.find((c) => c.id === parentIO?.campaignId)
  useBreadcrumb([
    { label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' },
    ...(parentCampaign ? [{ label: 'Campaign', name: parentCampaign.name, to: `/advertiser/campaigns/${parentCampaign.id}` }] : []),
    ...(parentIO ? [{ label: 'Insertion order', name: parentIO.name, to: `/advertiser/insertion-orders/${parentIO.id}` }] : []),
    { label: 'Line item', name: li?.name ?? 'Line item' },
  ])
  const [tab, setTab] = useState('Line item details')

  const isVideo = isYouTubeType(raw?.li_type)

  // ── editable form state, seeded from the saved row ──────────────────────────
  const initial = useMemo(() => buildForm(raw), [raw])
  const [form, setForm] = useState(initial)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  // Re-seed when the row changes (e.g. after save reload)
  const [seed, setSeed] = useState(id)
  if (seed !== id) { setSeed(id); setForm(buildForm(raw)) }

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const setF = (patch: Partial<typeof form>) => { setForm((f) => ({ ...f, ...patch })); setSaved(false) }

  if (!raw) return <div className="px-6 py-10 text-13 text-gtext-secondary">Line item not found.</div>

  const save = async () => {
    setBusy(true)
    const ok = await updateLineItem(id!, {
      io_id: raw.io_id,
      name: form.name.trim() || raw.name,
      li_type: raw.li_type,
      budget_type: form.budgetType,
      budget: form.budgetType === 'limited' ? (form.budget ? `₹${form.budget}` : '₹0.00') : (null as unknown as string),
      pacing: form.pacingRate,
      bid_strategy: form.bidStrategy,
      bid_amount: form.bidAmount,
      freq_cap: form.expMode,
      targeting: form.targeting as unknown as Record<string, unknown>,
      status: form.status,
      settings: {
        objective: form.objective, subtype: form.subtype,
        ad_formats: form.adFormats,
        pacing_period: form.pacingPeriod,
        flight_start: form.flightStart, flight_end: form.flightEnd,
        exp_freq: { mode: form.expMode, count: form.expCount, period: form.expPeriod },
        view_freq: { mode: form.viewMode, count: form.viewCount, period: form.viewPeriod },
        eu_political: form.euPolitical,
        creative_ids: form.creativeIds,
        last_note: note,
      },
    })
    setBusy(false)
    setSaved(ok)
    if (ok) setNote('')
  }
  const reset = () => { setForm(initial); setNote(''); setSaved(false) }
  const remove = async () => {
    if (!confirm('Delete this line item?')) return
    if (await deleteEntity('line_item', id!)) navigate(`/advertiser/insertion-orders/${raw.io_id}`)
  }

  const audienceOptions = state.raw.audiences.map((a: any) => `Your list · ${a.name}`)
  const assignedCreatives = state.creatives.filter((c) => form.creativeIds.includes(c.id))

  return (
    <div className="pb-28">
      <div className="px-6 pt-4">
        <button onClick={() => navigate(-1)} className="text-12 text-gblue-700 hover:underline">‹ Overview</button>
        <div className="mt-1 flex items-center">
          <h1 className="font-gsans text-22 text-gtext-primary">{li?.name ?? 'Line item'}</h1>
          <span className="ml-3 rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary">Limited Access</span>
        </div>
      </div>
      <Tabs tabs={['Line item details', 'Troubleshooter', 'History']} active={tab} onChange={setTab} />

      {tab === 'Line item details' && (
        <div className="px-6 py-4">
          {isVideo && (
            <div className="mb-3 flex items-center justify-between text-13">
              <span className="text-gtext-secondary">No targeting template applied</span>
              <span className="cursor-not-allowed text-gtext-disabled" title="Launching soon">Select a YouTube &amp; partners video targeting template</span>
            </div>
          )}

          <Section title="Line item details">
            <Row label="Line item name">
              <input value={form.name} onChange={(e) => setF({ name: e.target.value })}
                className="h-9 w-full max-w-xl rounded border border-gborder px-3 text-13 focus:border-gblue-600 focus:outline-none" />
            </Row>
            <Row label="Status">
              <select value={form.status} onChange={(e) => setF({ status: e.target.value })} className="h-9 w-40 rounded border border-gborder px-2 text-13">
                <option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option>
              </select>
            </Row>
            {isVideo ? (
              <>
                <ReadRow label="Media type" value="Video" sub="Run video ads across YouTube & partners" />
                <Row label="Objective">
                  <select value={form.objective} onChange={(e) => setF({ objective: e.target.value })} className="h-9 w-80 rounded border border-gborder px-2 text-13">
                    <option>Brand awareness and reach</option><option>Product and brand consideration</option><option>Online sales</option><option>Leads</option>
                  </select>
                </Row>
                <ReadRow label="Line item subtype" value={form.subtype} sub="Reach people using bumper, skippable, in-feed, or Shorts ads." />
                <Row label="Ad format" hint="Your ad shows across the formats you keep checked.">
                  <Check label="In-stream ads (skippable, bumper)" checked={form.adFormats.instream} onChange={(v) => setF({ adFormats: { ...form.adFormats, instream: v } })} />
                  <Check label="In-feed ads" checked={form.adFormats.infeed} onChange={(v) => setF({ adFormats: { ...form.adFormats, infeed: v } })} />
                  <Check label="Shorts ads" checked={form.adFormats.shorts} onChange={(v) => setF({ adFormats: { ...form.adFormats, shorts: v } })} />
                </Row>
              </>
            ) : (
              <ReadRow label="Line item type" value={raw.li_type} sub="Image and HTML5 ads across the web and apps." />
            )}
          </Section>

          <Section title="Budget & pacing">
            <Row label="Flight dates">
              <div className="flex items-center gap-3">
                <input value={form.flightStart} onChange={(e) => setF({ flightStart: e.target.value })} className="h-9 w-40 rounded border border-gborder px-3 text-13" />
                <span className="text-gtext-secondary">→</span>
                <input value={form.flightEnd} onChange={(e) => setF({ flightEnd: e.target.value })} className="h-9 w-40 rounded border border-gborder px-3 text-13" />
              </div>
            </Row>
            <Row label="Budget and pacing">
              <div className="flex flex-wrap items-center gap-2">
                <select value={form.pacingPeriod} onChange={(e) => setF({ pacingPeriod: e.target.value })} className="h-9 w-28 rounded border border-gborder px-2 text-13">
                  <option>Daily</option><option>Flight</option>
                </select>
                <select value={form.pacingRate} onChange={(e) => setF({ pacingRate: e.target.value })} className="h-9 w-28 rounded border border-gborder px-2 text-13">
                  <option value="even">Even</option><option value="ahead">Ahead</option><option value="asap">ASAP</option>
                </select>
                <input value={form.budget} onChange={(e) => setF({ budget: e.target.value, budgetType: 'limited' })} placeholder="₹1" className="h-9 w-28 rounded border border-gborder px-3 text-13" />
                <span className="text-12 text-gtext-secondary">INR · actual spend on a given day may vary.</span>
              </div>
            </Row>
            <Row label="Bid strategy">
              {isVideo ? (
                <div className="flex items-center gap-2 text-13 text-gtext-primary">
                  <Icon name="lock" size={16} className="text-gtext-secondary" /> Target CPM
                  <span className="text-12 text-gtext-secondary">— can't be changed after creation.</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <select value={form.bidStrategy} onChange={(e) => setF({ bidStrategy: e.target.value })} className="h-9 w-64 rounded border border-gborder px-2 text-13">
                    {['Fixed bid', 'Maximize conversions', 'Maximize viewable impressions', 'Target CPA', 'Target ROAS', 'Target CPM'].map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <input value={form.bidAmount} onChange={(e) => setF({ bidAmount: e.target.value })} placeholder="Bid ₹" className="h-9 w-28 rounded border border-gborder px-3 text-13" />
                </div>
              )}
            </Row>
            <Row label="Frequency cap">
              <div className="space-y-3">
                <FreqBlock title={isVideo ? 'Exposure frequency' : 'Frequency'} unit="exposures"
                  mode={form.expMode} count={form.expCount} period={form.expPeriod}
                  onMode={(m) => setF({ expMode: m })} onCount={(c) => setF({ expCount: c })} onPeriod={(p) => setF({ expPeriod: p })} />
                {isVideo && (
                  <FreqBlock title="View frequency" unit="views"
                    mode={form.viewMode} count={form.viewCount} period={form.viewPeriod}
                    onMode={(m) => setF({ viewMode: m })} onCount={(c) => setF({ viewCount: c })} onPeriod={(p) => setF({ viewPeriod: p })} />
                )}
              </div>
            </Row>
          </Section>

          {/* Targeting — same builder & options as a targeting template */}
          <div className="mt-5">
            <h3 className="mb-2 text-15 text-gtext-primary">Targeting</h3>
            <TargetingBuilder value={form.targeting} onChange={(t: Targeting) => setF({ targeting: t })} audienceOptions={audienceOptions} />
          </div>

          {/* Creatives / Ads */}
          <Section title={isVideo ? 'Ads' : 'Creatives'}>
            <div className="px-5 py-4">
              {state.creatives.length === 0 ? (
                <div className="text-13 text-gtext-secondary">No creatives yet for this advertiser. Add some under <span className="font-medium">Creative → Creatives</span>.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {state.creatives.map((c) => {
                    const on = form.creativeIds.includes(c.id)
                    return (
                      <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${on ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-page'}`}>
                        <input type="checkbox" checked={on} onChange={() => setF({ creativeIds: on ? form.creativeIds.filter((x) => x !== c.id) : [...form.creativeIds, c.id] })} />
                        {c.image_url ? <img src={c.image_url} alt="" className="h-8 w-12 shrink-0 rounded object-cover" /> : <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded text-[9px] font-medium text-white" style={{ background: c.accent }}>{c.dimensions}</span>}
                        <span className="min-w-0"><span className="block truncate text-13 text-gtext-primary">{c.name}</span><span className="text-11 text-gtext-secondary">{c.dimensions} · {c.type}</span></span>
                      </label>
                    )
                  })}
                </div>
              )}
              {assignedCreatives.length > 0 && <div className="mt-2 text-12 text-gtext-secondary">{assignedCreatives.length} assigned</div>}
            </div>
          </Section>

          {/* Disclosures */}
          <Section title="Disclosures">
            <Row label="EU political ads" hint="Does this line item run EU political ads?">
              <label className="flex items-center gap-2 text-13"><input type="radio" checked={form.euPolitical} onChange={() => setF({ euPolitical: true })} /> Yes</label>
              <label className="flex items-center gap-2 text-13"><input type="radio" checked={!form.euPolitical} onChange={() => setF({ euPolitical: false })} /> No, this line item doesn't have EU political ads</label>
            </Row>
          </Section>

          {/* Advanced — launching soon */}
          <Section title="Advanced">
            <SoonRow label="Conversions" text="Conversion tracking, counting & attribution" />
            <SoonRow label="Product feed" text="Google Merchant Center product feed" />
            {isVideo && <SoonRow label="Related videos" text="Add related videos to boost engagement" />}
            {isVideo && <SoonRow label="Ad groups" text="Manage ad groups & individual ads" />}
          </Section>

          <div className="mt-4">
            <button onClick={remove} className="flex items-center gap-1 text-13 font-medium text-gstatus-red hover:underline">
              <Icon name="delete" size={18} /> Delete line item
            </button>
          </div>
        </div>
      )}

      {tab === 'Troubleshooter' && (
        <div className="px-6 py-6 text-13 text-gtext-secondary">
          <div className="flex items-center gap-2 text-gtext-primary"><Icon name="check_circle" size={18} className="text-gstatus-green" /> This line item is eligible to serve.</div>
        </div>
      )}
      {tab === 'History' && <EntityHistory type="line_item" id={id!} />}

      {/* Sticky Save / Reset / note bar */}
      {tab === 'Line item details' && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-gborder bg-white px-6 py-3" style={{ left: 0 }}>
          <button onClick={save} disabled={!dirty || busy}
            className={`rounded px-4 py-1.5 text-13 font-medium text-white ${!dirty || busy ? 'bg-gtext-disabled' : 'bg-gblue-600 hover:bg-gblue-700'}`}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button onClick={reset} disabled={!dirty} className="text-13 font-medium text-gblue-700 hover:underline disabled:text-gtext-disabled">Reset</button>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional: Enter a note about this change"
            className="h-9 w-80 rounded border border-gborder px-3 text-12 focus:border-gblue-600 focus:outline-none" />
          {saved && <span className="text-12 text-gstatus-green">Saved ✓</span>}
        </div>
      )}
    </div>
  )
}

function buildForm(raw: any) {
  const s = raw?.settings ?? {}
  return {
    name: raw?.name ?? '',
    status: raw?.status ?? 'draft',
    objective: s.objective ?? 'Brand awareness and reach',
    subtype: s.subtype ?? 'Efficient reach',
    adFormats: s.ad_formats ?? { instream: true, infeed: false, shorts: true },
    flightStart: s.flight_start ?? 'Jun 1, 2026',
    flightEnd: s.flight_end ?? 'Jun 30, 2026',
    pacingPeriod: s.pacing_period ?? 'Daily',
    pacingRate: raw?.pacing ?? 'even',
    budget: (raw?.budget ?? '').replace(/[^0-9.]/g, ''),
    budgetType: (raw?.budget_type ?? 'unlimited') as 'unlimited' | 'limited',
    bidStrategy: raw?.bid_strategy ?? 'Target CPM',
    bidAmount: raw?.bid_amount ?? '',
    expMode: (s.exp_freq?.mode ?? raw?.freq_cap ?? 'no_cap') as 'no_cap' | 'limited',
    expCount: s.exp_freq?.count ?? '3',
    expPeriod: s.exp_freq?.period ?? 'day',
    viewMode: (s.view_freq?.mode ?? 'no_cap') as 'no_cap' | 'limited',
    viewCount: s.view_freq?.count ?? '3',
    viewPeriod: s.view_freq?.period ?? 'day',
    euPolitical: Boolean(s.eu_political),
    creativeIds: (s.creative_ids ?? []) as string[],
    targeting: (raw?.targeting && Object.keys(raw.targeting).length ? raw.targeting : {}) as Targeting,
  }
}

/* ── local UI helpers ─────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="mb-2 text-15 text-gtext-primary">{title}</h3>
      <div className="divide-y divide-gborder-light rounded-lg border border-gborder bg-white">{children}</div>
    </div>
  )
}
function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-56 shrink-0"><div className="text-13 text-gtext-primary">{label}</div>{hint && <div className="text-11 text-gtext-secondary">{hint}</div>}</div>
      <div className="flex-1 space-y-1">{children}</div>
    </div>
  )
}
function ReadRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-56 shrink-0 text-13 text-gtext-primary">{label}</div>
      <div className="flex-1"><div className="text-13 text-gtext-primary">{value}</div>{sub && <div className="text-12 text-gtext-secondary">{sub}</div>}</div>
    </div>
  )
}
function SoonRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-56 shrink-0 text-13 text-gtext-primary">{label}</div>
      <div className="flex flex-1 items-center gap-2 text-13 text-gtext-secondary">{text}</div>
      <span className="rounded-full bg-gbg-page px-2 py-0.5 text-[10px] font-medium text-gtext-secondary">Launching soon</span>
    </div>
  )
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-13 text-gtext-primary"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
}
function FreqBlock({ title, unit, mode, count, period, onMode, onCount, onPeriod }: {
  title: string; unit: string; mode: 'no_cap' | 'limited'; count: string; period: string
  onMode: (m: 'no_cap' | 'limited') => void; onCount: (c: string) => void; onPeriod: (p: string) => void
}) {
  return (
    <div>
      <div className="mb-1 text-12 font-medium text-gtext-secondary">{title}</div>
      <label className="flex items-center gap-2 text-13"><input type="radio" checked={mode === 'no_cap'} onChange={() => onMode('no_cap')} /> No limit</label>
      <label className="mt-1 flex items-center gap-2 text-13">
        <input type="radio" checked={mode === 'limited'} onChange={() => onMode('limited')} /> Limit frequency to
        <input value={count} onChange={(e) => onCount(e.target.value)} disabled={mode !== 'limited'} className="h-8 w-16 rounded border border-gborder px-2 text-13 disabled:bg-gbg-page" />
        {unit} per
        <select value={period} onChange={(e) => onPeriod(e.target.value)} disabled={mode !== 'limited'} className="h-8 rounded border border-gborder px-1 text-13 disabled:bg-gbg-page">
          <option value="day">Day</option><option value="week">Week</option><option value="month">Month</option>
        </select>
      </label>
    </div>
  )
}
