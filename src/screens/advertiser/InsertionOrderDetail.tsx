import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs, StatusDot, FilterBar, Pagination, Dropdown, IconButton, Button } from '../../components/ui/primitives'
import { MetricCard, FormRow, RadioRow, TextField, FormActionBar } from '../../components/ui/parts'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Icon } from '../../lib/icons'
import { useStore, type LIRecord, type IORecord } from '../../store'
import { EntityHistory } from '../../components/EntityHistory'

const liCols: Column<LIRecord>[] = [
  { key: 'name', header: 'Line items', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'status', header: 'Status', render: (r) => <span className="capitalize text-gtext-secondary">{r.status}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right' },
  { key: 'goal', header: 'Goal', align: 'right' },
]

export default function InsertionOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateIO } = useStore()
  const io = state.ios.find((i) => i.id === id) ?? state.ios[0]
  const rawIo = state.raw.ios.find((i) => i.id === id)
  const ioLineItems = state.lineItems.filter((li) => li.ioId === id)
  const ioName = io?.name ?? 'Insertion order'
  useBreadcrumb([
    { label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' },
    { label: 'Campaign', name: io?.campaignId ? (state.campaigns.find((c) => c.id === io.campaignId)?.name ?? 'Campaign') : 'Campaign', to: io?.campaignId ? `/advertiser/campaigns/${io.campaignId}` : '/advertiser/campaigns' },
    { label: 'Insertion order', name: ioName },
  ])
  const [tab, setTab] = useState('Line items')

  return (
    <div className="pb-8">
      <div className="px-6 pt-4">
        <button onClick={() => navigate(-1)} className="text-12 text-gblue-700 hover:underline">
          ‹ Overview
        </button>
        <div className="mt-1 flex items-center">
          <h1 className="font-gsans text-22 text-gtext-primary">{ioName}</h1>
          <span className="ml-3 rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary">Limited Access</span>
        </div>
      </div>

      <Tabs tabs={['Line items', 'Insertion order details', 'History']} active={tab} onChange={setTab} />

      {tab === 'Line items' && <LineItemsTab navigate={navigate} ioId={id ?? ''} lineItems={ioLineItems} />}
      {tab === 'Insertion order details' && <DetailsTab raw={rawIo} ioId={id ?? ''} updateIO={updateIO} />}
      {tab === 'History' && <EntityHistory type="io" id={id ?? ''} />}
    </div>
  )
}

function LineItemsTab({
  navigate,
  ioId,
  lineItems,
}: {
  navigate: ReturnType<typeof useNavigate>
  ioId: string
  lineItems: LIRecord[]
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 pt-4">
        <Button variant="filled" size="sm" onClick={() => navigate(`/advertiser/line-items/new?ioId=${ioId}`)}>
          New line item
        </Button>
        <span className="text-12 text-gtext-secondary">{lineItems.length} line item(s)</span>
      </div>

      <div className="mt-3">
        {lineItems.length === 0 ? (
          <div className="px-6 py-8 text-13 text-gtext-secondary">No line items yet. Click “New line item” to add one.</div>
        ) : (
          <DataTable columns={liCols} rows={lineItems} leading={(r) => <StatusDot status={r.status} />} onRowClick={(r) => navigate(`/advertiser/line-items/${r.id}`)} />
        )}
      </div>
      <Pagination total={lineItems.length} />
    </>
  )
}

// KPI options exactly as DV360 labels them.
const kpiTypes = [
  'Cost per thousand impressions (CPM)',
  'Cost per click (CPC)',
  'Cost per action (CPA)',
  'Click-through rate (CTR)',
  'Cost per completed view (CPCV)',
  'Viewable %',
  'CPIAVC',
  'Other / None',
]
const freqPeriods = ['Day', 'Week', 'Month', 'Flight']

/**
 * In-place editor for Insertion Order settings — sections and labels mirror the
 * real DV360 IO details page (Objective → Budget → Pacing → KPI → Optimization →
 * Frequency cap → Additional settings → Integration Code). Persists via updateIO.
 */
function DetailsTab({ raw, ioId, updateIO }: {
  raw: any
  ioId: string
  updateIO: (id: string, input: any) => Promise<boolean>
}) {
  const s = raw?.settings ?? {}
  const [name, setName] = useState(raw?.name ?? '')
  const [budget, setBudget] = useState((raw?.budget ?? '').replace(/[^0-9.]/g, ''))
  const [desc, setDesc] = useState(s.budget_description ?? '')
  const [startDate, setStartDate] = useState(raw?.start_date ?? 'Apr 10, 2026')
  const [endDate, setEndDate] = useState(raw?.end_date ?? 'May 10, 2026')
  const [pacing, setPacing] = useState<'Flight' | 'Even'>(raw?.pacing === 'Even' ? 'Even' : 'Flight')
  const [kpiType, setKpiType] = useState(raw?.kpi_type ?? kpiTypes[0])
  const [kpiValue, setKpiValue] = useState(raw?.kpi_value ?? '')
  const [optimize, setOptimize] = useState<'auto' | 'line_item'>(s.optimize === 'line_item' ? 'line_item' : 'auto')
  const [freqMode, setFreqMode] = useState<'none' | 'limited'>(s.freq_mode === 'limited' ? 'limited' : 'none')
  const [freqCount, setFreqCount] = useState(s.freq_count ?? '1')
  const [freqPeriod, setFreqPeriod] = useState(s.freq_period ?? 'Month')
  const [integration, setIntegration] = useState(s.integration_code ?? '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!raw) return <div className="px-6 py-8 text-14 text-gtext-secondary">Insertion order not found.</div>

  const save = async () => {
    setBusy(true); setSaved(false)
    const ok = await updateIO(ioId, {
      campaign_id: raw.campaign_id,
      name: name.trim() || raw.name,
      budget: budget ? `₹${budget}` : '₹0.00',
      pacing,
      kpi_type: kpiType,
      kpi_value: kpiValue,
      start_date: startDate,
      end_date: endDate,
      status: raw.status ?? 'draft',
      settings: {
        ...s,
        budget_description: desc,
        optimize,
        freq_mode: freqMode,
        freq_count: freqCount,
        freq_period: freqPeriod,
        integration_code: integration,
      },
    })
    setBusy(false); setSaved(ok)
  }

  return (
    <div className="px-6 pb-24">
      {/* Info banner: targeting moved to line item level */}
      <div className="mt-4 flex items-start gap-2 rounded-g border border-gblue-50 bg-gblue-50 px-4 py-3 text-13 text-gtext-strong">
        <Icon name="info" size={18} className="mt-0.5 text-gblue-600" />
        <span>
          <b>Inventory source</b> and <b>Targeting</b> settings are now managed at the line item level. Use{' '}
          <a className="text-glink hover:underline" href="#/advertiser/targeting-templates">targeting templates</a> for easy reuse.
        </span>
      </div>

      <Section title="Insertion order name">
        <TextField value={name} onChange={setName} width="w-[520px]" label="Name" />
        <div className="mt-1 text-12 text-gtext-secondary">Text is {name.length} characters out of 240</div>
      </Section>

      <Section title="Objective" hint="Choose any KPI and bid strategy for this objective">
        <div className="flex items-center gap-3">
          <span className="text-14 text-gtext-primary">{s.objective ?? 'Insertion order without objective'}</span>
          <a className="text-13 text-glink hover:underline" href="#">Review options</a>
        </div>
      </Section>

      <Section title="Budget" hint="Budget and pacing depend on both insertion order and line item settings.">
        <div className="mb-3 flex items-center gap-2 text-12 text-gtext-secondary">
          Budget type <span className="rounded-gsm bg-gbg-page px-1.5 py-0.5 font-medium text-gtext-strong">INR</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <TextField label="Budget (₹)" value={budget} onChange={setBudget} />
          <TextField label="Description" value={desc} onChange={setDesc} />
          <TextField label="Spent" defaultValue="₹0.00" readOnly />
          <TextField label="Remaining" defaultValue={raw.budget ?? '₹0.00'} readOnly />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TextField label="Start date" value={startDate} onChange={setStartDate} />
          <TextField label="End date" value={endDate} onChange={setEndDate} />
        </div>
        <div className="mt-2 flex gap-4 text-13">
          <button className="text-glink hover:underline">+ Add segments</button>
          <label className="flex items-center gap-1 text-gtext-secondary"><input type="checkbox" className="accent-gblue-600" /> Show actualized</label>
        </div>
      </Section>

      <Section title="Pacing" hint="How do you want to spend the flight budget?">
        <RadioRow label="Flight (Recommended)" checked={pacing === 'Flight'} hint="Spend your entire budget over the entire flight, without underpacing." onChange={() => setPacing('Flight')} />
        <RadioRow label="Even" checked={pacing === 'Even'} hint="Spend evenly each day." onChange={() => setPacing('Even')} />
      </Section>

      <Section title="KPI" hint="Your KPI options are now tailored to the insertion order objective.">
        <div className="flex items-end gap-3">
          <label className="relative block w-[360px]">
            <span className="pointer-events-none absolute left-3 top-1.5 text-11 text-gtext-secondary">KPI</span>
            <select value={kpiType} onChange={(e) => setKpiType(e.target.value)} className="h-12 w-full appearance-none rounded border border-gborder bg-white px-3 pt-4 text-14 text-gtext-primary focus:border-gblue-600 focus:outline-none">
              {kpiTypes.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <TextField label="Target value" value={kpiValue} onChange={setKpiValue} width="w-36" />
        </div>
      </Section>

      <Section title="Optimization" hint="How would you like to optimize?">
        <RadioRow
          label="Automate bid & budget at insertion order level"
          checked={optimize === 'auto'}
          onChange={() => setOptimize('auto')}
        />
        {optimize === 'auto' && (
          <div className="mb-2 ml-8 rounded-g border border-gborder-light bg-gbg-hover px-3 py-2 text-13 text-gtext-strong">
            Optimized towards <b>Maximize viewable impressions</b> while prioritizing spending my full budget (recommended)
          </div>
        )}
        <RadioRow
          label="Control bid and budget at the line item level"
          checked={optimize === 'line_item'}
          hint="Automatically optimize your budget allocation"
          onChange={() => setOptimize('line_item')}
        />
        <div className="mt-1 flex items-center gap-2 text-13 text-gtext-disabled">
          YouTube reach and frequency optimization
          <span className="rounded-gpill bg-gdata-purpleBg px-2 py-0.5 text-[10px] font-medium text-gdata-purple">Alpha</span>
        </div>
      </Section>

      <Section title="Frequency cap" hint="Manage how often the same person sees your ads.">
        <RadioRow label="No limit" checked={freqMode === 'none'} onChange={() => setFreqMode('none')} />
        <label className="flex items-center gap-2 py-2" onClick={() => setFreqMode('limited')}>
          <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${freqMode === 'limited' ? 'border-gblue-600' : 'border-gtext-secondary'}`}>
            {freqMode === 'limited' && <span className="h-2.5 w-2.5 rounded-full bg-gblue-600" />}
          </span>
          <span className="text-14 text-gtext-primary">Limit frequency to</span>
          <input value={freqCount} onChange={(e) => { setFreqMode('limited'); setFreqCount(e.target.value.replace(/[^0-9]/g, '')) }} className="h-9 w-16 rounded border border-gborder px-2 text-center text-14 focus:border-gblue-600 focus:outline-none" />
          <span className="text-14 text-gtext-primary">exposures per</span>
          <select value={freqPeriod} onChange={(e) => { setFreqMode('limited'); setFreqPeriod(e.target.value) }} className="h-9 rounded border border-gborder px-2 text-14 focus:border-gblue-600 focus:outline-none">
            {freqPeriods.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </Section>

      <div className="border-b border-gborder-light py-4">
        <button onClick={() => setShowAdvanced((v) => !v)} className="flex items-center gap-1 text-14 font-medium text-glink">
          <Icon name={showAdvanced ? 'expand_less' : 'expand_more'} size={20} /> Additional settings
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-4">
            <FeeTable
              title="Partner costs · CPM Fees"
              cols={['Name', 'Amount', 'Type', 'Invoiced']}
              rows={[['CPM fee 1', '—', 'Default', 'Invoiced'], ['CPM fee 2', '—', 'Default', 'Invoiced']]}
            />
            <FeeTable
              title="Media Fees"
              cols={['Name', 'Percentage', 'Type', '']}
              rows={[['Media fee 1', '—', 'Automated cost', ''], ['Display & Video 360 Fee 🔒', '—', 'Automated cost', '']]}
            />
            <div>
              <label className="mb-1 block text-12 text-gtext-secondary">Integration Code</label>
              <TextField value={integration} onChange={setIntegration} width="w-[360px]" placeholder="Integration Code:" />
            </div>
          </div>
        )}
      </div>

      <FormActionBar onSave={save} saved={saved && !busy} />
    </div>
  )
}

/** DV360-style settings section: bold title + optional hint, content below. */
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gborder-light py-5">
      <div className="text-14 font-medium text-gtext-primary">{title}</div>
      {hint && <div className="mb-3 mt-0.5 text-13 text-gtext-secondary">{hint}</div>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  )
}

/** Read-only fee table matching the DV360 "Additional settings" panel. */
function FeeTable({ title, cols, rows }: { title: string; cols: string[]; rows: string[][] }) {
  return (
    <div className="max-w-2xl rounded-g border border-gborder">
      <div className="border-b border-gborder bg-gbg-hover px-3 py-2 text-13 font-medium text-gtext-strong">{title}</div>
      <table className="w-full text-13">
        <thead>
          <tr className="text-gtext-secondary">
            {cols.map((c, i) => <th key={i} className="px-3 py-2 text-left font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gborder-light text-gtext-primary">
              {r.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HistoryTab({ name }: { name: string }) {
  const entries = [
    { who: 'product@kraftshala.com', what: `Created insertion order "${name}"`, when: 'May 9, 2026 11:24 AM' },
    { who: 'product@kraftshala.com', what: 'Edited budget and pacing', when: 'May 10, 2026 9:02 AM' },
  ]
  return (
    <div className="px-6 py-4">
      {entries.map((e, i) => (
        <div key={i} className="flex gap-3 border-b border-gborder-light py-3">
          <Icon name="history" size={18} className="text-gtext-secondary" />
          <div>
            <div className="text-13 text-gtext-primary">{e.what}</div>
            <div className="text-12 text-gtext-secondary">{e.who} · {e.when}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Impressions-lost donut breakdown. */
function Donut() {
  const segments = [
    { label: 'No eligible creatives', pct: 0, color: '#1a73e8' },
    { label: 'Frequency limited', pct: 0, color: '#34a853' },
    { label: 'Budget or pacing', pct: 0, color: '#fbbc04' },
    { label: 'Below minimum bid', pct: 0, color: '#ea4335' },
    { label: 'Auctions lost', pct: 0, color: '#9aa0a6' },
  ]
  return (
    <div className="mt-2 flex items-center gap-3">
      <svg width="56" height="56" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e8eaed" strokeWidth="5" />
      </svg>
      <div className="space-y-0.5 text-11">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-gtext-secondary">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="flex-1">{s.label}</span>
            <span>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
