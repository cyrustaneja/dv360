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
  { key: 'name', header: 'Display line items', render: (r) => (
    <span className="flex items-center gap-2 text-gblue-700">
      {r.name}
    </span>
  ) },
  { key: 'id', header: 'ID', render: (r) => <span className="text-gtext-secondary">{r.id}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right', group: 'Settings' },
  { key: 'goal', header: 'Goal', align: 'right', group: 'Goal' },
  { key: 'impressions', header: 'Impr.', align: 'right', group: 'Delivery' },
  { key: 'clicks', header: 'Clicks', align: 'right', group: 'Delivery' },
  { key: 'conversions', header: 'Convs.', align: 'right', group: 'Conversions' },
  { key: 'cpm', header: 'CPM', align: 'right', group: 'Custom Bidding' },
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
  const [showBanner, setShowBanner] = useState(true)
  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-6 py-4 lg:grid-cols-5">
        <MetricCard title="Total cost" value="₹0.00" sub="0% of budget allocated" />
        <MetricCard title="Avg. CPM" value="₹0.00" sub="vs ₹260.00 goal" />
        <MetricCard title="Impressions lost" value="0">
          <Donut />
        </MetricCard>
        <MetricCard title="Added reach">
          <div className="mt-2 text-12 text-gtext-secondary">Activate the frequency cap to see this metric.</div>
        </MetricCard>
        <MetricCard title="Explore budget options">
          <div className="mt-2 text-12 text-gtext-secondary">No data available</div>
        </MetricCard>
      </div>

      <div className="px-6 text-12 text-gtext-secondary">Displaying data for {lineItems.length} entities</div>

      {showBanner && (
        <div className="mx-6 mt-3 flex items-center gap-2 rounded bg-gblue-50 px-3 py-2 text-12 text-gtext-primary">
          <Icon name="info" size={16} className="text-gblue-700" />
          Quick access to edit Budget, Pacing, Bid Strategy and Frequency Cap can now be found in expanded Settings columns.
          <button className="ml-auto font-medium text-gblue-700" onClick={() => setShowBanner(false)}>Dismiss</button>
        </div>
      )}

      <div className="flex items-center gap-3 px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate(`/advertiser/line-items/new?ioId=${ioId}`)}>
          New line item
        </Button>
        <Dropdown label={<span className="text-13">Performance</span>} items={['Performance', 'Pacing']} />
        <Dropdown label={<span className="flex items-center gap-1 text-13"><Icon name="calendar_today" size={16} className="text-gtext-secondary" />Jun 1, 2026</span>} items={['Today', 'Last 7 days']} />
        <Dropdown label={<span className="text-13">Segment by</span>} items={['None', 'Day']} />
        <div className="ml-auto flex items-center gap-1">
          <IconButton name="download" label="Download" />
          <IconButton name="fullscreen" label="Fullscreen" />
          <IconButton name="more_vert" label="More" />
        </div>
      </div>

      <FilterBar count={0} chip="" />
      <div className="mt-3">
        <DataTable columns={liCols} rows={lineItems} leading={(r) => <StatusDot status={r.status} />} onRowClick={(r) => navigate(`/advertiser/line-items/${r.id}`)} />
      </div>
      <div className="px-6 py-2 text-13 font-medium text-gtext-primary">Total: Display</div>
      <Pagination total={lineItems.length} />
    </>
  )
}

const kpiTypes = ['CPM', 'CPC', 'CPA', 'CTR', 'CPV', '% Viewable', 'CPIAVC', 'None']

/** In-place editor for IO settings — persists to the database via updateIO. */
function DetailsTab({ raw, ioId, updateIO }: {
  raw: any
  ioId: string
  updateIO: (id: string, input: any) => Promise<boolean>
}) {
  const s = raw?.settings ?? {}
  const [name, setName] = useState(raw?.name ?? '')
  const [budget, setBudget] = useState((raw?.budget ?? '').replace(/[^0-9.]/g, ''))
  const [desc, setDesc] = useState(s.budget_description ?? '')
  const [startDate, setStartDate] = useState(raw?.start_date ?? 'Jun 1, 2026')
  const [endDate, setEndDate] = useState(raw?.end_date ?? 'Jun 30, 2026')
  const [pacing, setPacing] = useState<'Flight' | 'Even'>(raw?.pacing === 'Even' ? 'Even' : 'Flight')
  const [kpiType, setKpiType] = useState(raw?.kpi_type ?? 'CPM')
  const [kpiValue, setKpiValue] = useState(raw?.kpi_value ?? '')
  const [status, setStatus] = useState(raw?.status ?? 'active')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!raw) return <div className="px-6 py-8 text-13 text-gtext-secondary">Insertion order not found.</div>

  const save = async () => {
    setBusy(true)
    const ok = await updateIO(ioId, {
      campaign_id: raw.campaign_id,
      name: name.trim() || raw.name,
      budget: budget ? `₹${budget}` : '₹0.00',
      pacing,
      kpi_type: kpiType,
      kpi_value: kpiValue,
      start_date: startDate,
      end_date: endDate,
      status,
      settings: { ...s, budget_description: desc },
    })
    setBusy(false)
    setSaved(ok)
  }

  return (
    <div className="px-6">
      <div className="flex items-center gap-2 py-4 text-13 text-gtext-primary">
        <Icon name="check_circle" size={18} className="text-gstatus-green" />
        Budget and pacing depend on both insertion order and line item settings.
      </div>
      <FormRow label="Insertion order name">
        <TextField value={name} onChange={setName} width="w-96" />
      </FormRow>
      <FormRow label="Budget" hint="Budget type: INR">
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
      </FormRow>
      <FormRow label="Pacing" hint="How do you want to spend the flight budget?">
        <RadioRow label="Flight (Recommended)" checked={pacing === 'Flight'} hint="Spend your entire budget over the entire flight, without underpacing." onChange={() => setPacing('Flight')} />
        <RadioRow label="Even" checked={pacing === 'Even'} hint="Spend evenly each day." onChange={() => setPacing('Even')} />
      </FormRow>
      <FormRow label="KPI" hint="What KPI do you want to use for your insertion order?">
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-12 text-gtext-secondary">KPI type</label>
            <select value={kpiType} onChange={(e) => setKpiType(e.target.value)} className="h-9 w-44 rounded border border-gborder px-2 text-13">
              {kpiTypes.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <TextField label="Target value" value={kpiValue} onChange={setKpiValue} width="w-36" />
        </div>
      </FormRow>
      <FormRow label="Status">
        <div className="flex gap-4">
          <RadioRow label="Active" checked={status === 'active'} onChange={() => setStatus('active')} />
          <RadioRow label="Paused" checked={status === 'paused'} onChange={() => setStatus('paused')} />
          <RadioRow label="Draft" checked={status === 'draft'} onChange={() => setStatus('draft')} />
        </div>
      </FormRow>
      <FormActionBar onSave={save} saved={saved && !busy} />
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
