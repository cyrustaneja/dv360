import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs, StatusDot, FilterBar, Pagination, Dropdown, IconButton, Button } from '../../components/ui/primitives'
import { MetricCard } from '../../components/ui/parts'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Icon } from '../../lib/icons'
import { useStore, type IORecord, type LIRecord } from '../../store'
import { EntityHistory } from '../../components/EntityHistory'

const ioCols: Column<IORecord>[] = [
  { key: 'name', header: 'Insertion orders', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'status', header: 'Status', render: (r) => <span className="capitalize text-gtext-secondary">{r.status}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right' },
  { key: 'goal', header: 'Goal', align: 'right' },
]

const liCols: Column<LIRecord>[] = [
  { key: 'name', header: 'Line items', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'status', header: 'Status', render: (r) => <span className="capitalize text-gtext-secondary">{r.status}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right' },
]

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()

  const campaign = state.campaigns.find((c) => c.id === id) ?? state.campaigns[0]
  const row = state.raw.campaigns.find((c) => c.id === id)
  const ios = state.ios.filter((io) => io.campaignId === id)
  const lineItems = state.lineItems.filter((li) =>
    ios.some((io) => io.id === li.ioId)
  )

  useBreadcrumb([
    { label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' },
    { label: 'Campaign', name: campaign?.name ?? 'Campaign' },
  ])
  const [tab, setTab] = useState('Insertion orders')

  const handleNew = () => {
    if (tab === 'Line items') {
      navigate(`/advertiser/line-items/new?campaignId=${id}`)
    } else {
      navigate(`/advertiser/insertion-orders/new?campaignId=${id}`)
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center px-6 pt-4">
        <h1 className="font-gsans text-22 text-gtext-primary">{campaign?.name ?? 'Campaign'}</h1>
        <span className="ml-3 rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary capitalize">{campaign?.status ?? 'active'}</span>
        <Button variant="outlined" size="sm" className="ml-auto" onClick={() => navigate(`/advertiser/campaigns/${id}/edit`)}>
          Edit campaign
        </Button>
      </div>
      <Tabs tabs={['Combined', 'Insertion orders', 'Line items', 'Settings', 'History']} active={tab} onChange={setTab} />

      {tab === 'History' ? (
        <EntityHistory type="campaign" id={id ?? ''} />
      ) : tab === 'Settings' ? (
        <SettingsPanel row={row} onEdit={() => navigate(`/advertiser/campaigns/${id}/edit`)} />
      ) : (
      <>
      <div className="flex items-center gap-3 px-6 pt-4">
        <Button variant="filled" size="sm" onClick={handleNew}>
          {tab === 'Line items' ? 'New line item' : 'New insertion order'}
        </Button>
        <span className="text-12 text-gtext-secondary">
          {tab === 'Line items' ? lineItems.length : ios.length} {tab === 'Line items' ? 'line item(s)' : 'insertion order(s)'}
        </span>
      </div>

      <div className="mt-3">
        {tab === 'Line items' ? (
          <DataTable
            columns={liCols}
            rows={lineItems}
            leading={(r) => <StatusDot status={r.status} />}
            onRowClick={(r) => navigate(`/advertiser/line-items/${r.id}`)}
          />
        ) : (
          <DataTable
            columns={ioCols}
            rows={ios}
            leading={(r) => <StatusDot status={r.status} />}
            onRowClick={(r) => navigate(`/advertiser/insertion-orders/${r.id}`)}
          />
        )}
      </div>
      <Pagination total={tab === 'Line items' ? lineItems.length : ios.length} />
      </>
      )}
    </div>
  )
}

function SettingsPanel({ row, onEdit }: { row: any; onEdit: () => void }) {
  if (!row) return <div className="px-6 py-8 text-14 text-gtext-secondary">No settings found.</div>
  const s = row.settings ?? {}
  const freq = s.freq_mode === 'limited'
    ? `${s.freq_count ?? '?'} per ${s.freq_period ?? 'day'}`
    : 'No cap'
  const items: [string, string][] = [
    ['Campaign name', row.name ?? '—'],
    ['Status', row.status ?? 'active'],
    ['Goal', row.goal ?? '—'],
    ['KPI', row.kpi_goal ?? '—'],
    ['Planned spend', row.budget ?? '—'],
    ['Flight dates', `${row.start_date ?? '—'} → ${row.end_date ?? '—'}`],
    ['Frequency cap', freq],
  ]
  return (
    <div className="px-6 py-5">
      <div className="max-w-2xl rounded-lg border border-gborder bg-white">
        <div className="flex items-center justify-between border-b border-gborder px-5 py-3">
          <span className="text-14 font-medium text-gtext-primary">Campaign settings</span>
          <Button variant="outlined" size="sm" onClick={onEdit}>Edit</Button>
        </div>
        <dl className="divide-y divide-gborder-light">
          {items.map(([k, v]) => (
            <div key={k} className="flex px-5 py-3 text-14">
              <dt className="w-44 shrink-0 text-gtext-secondary">{k}</dt>
              <dd className="text-gtext-primary capitalize">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
