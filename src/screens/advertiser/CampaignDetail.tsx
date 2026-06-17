import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs, StatusDot, FilterBar, Pagination, Dropdown, IconButton, Button } from '../../components/ui/primitives'
import { MetricCard } from '../../components/ui/parts'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Icon } from '../../lib/icons'
import { useStore, type IORecord, type LIRecord } from '../../store'

const ioCols: Column<IORecord>[] = [
  { key: 'name', header: 'Insertion orders', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'id', header: 'ID', render: (r) => <span className="text-gtext-secondary">{r.id}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right', group: 'Settings' },
  { key: 'goal', header: 'Goal', align: 'right', group: 'Goal' },
  { key: 'delivery', header: 'Delivery', align: 'right', group: 'Delivery' },
  { key: 'impressions', header: 'Impr.', align: 'right', group: 'Delivery' },
  { key: 'revenue', header: 'Revenue', align: 'right', group: 'Delivery' },
  { key: 'conversions', header: 'Conv.', align: 'right', group: 'Conversions' },
]

const liCols: Column<LIRecord>[] = [
  { key: 'name', header: 'Line items', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'id', header: 'ID', render: (r) => <span className="text-gtext-secondary">{r.id}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right', group: 'Settings' },
  { key: 'goal', header: 'Goal', align: 'right', group: 'Goal' },
  { key: 'impressions', header: 'Impr.', align: 'right', group: 'Delivery' },
  { key: 'revenue', header: 'Revenue', align: 'right', group: 'Delivery' },
]

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()

  const campaign = state.campaigns.find((c) => c.id === id) ?? state.campaigns[0]
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
        <h1 className="font-gsans text-22 text-gtext-primary">Campaign</h1>
        <span className="ml-3 rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary">Limited Access</span>
      </div>
      <Tabs tabs={['Combined', 'Insertion orders', 'Line items']} active={tab} onChange={setTab} />

      <div className="grid grid-cols-2 gap-4 px-6 py-4 lg:grid-cols-5">
        <MetricCard title="Total cost" value="₹0.00" sub="0% of ₹0.00 allocated" />
        <MetricCard title="Avg. CPM" value="₹0.00" sub="vs ₹260.00 goal" />
        <MetricCard title="Impressions lost">
          <div className="mt-2 text-12 text-gtext-secondary">To see impressions lost, check the box next to an insertion order.</div>
        </MetricCard>
        <MetricCard title="Added reach">
          <div className="mt-2 text-12 text-gtext-secondary">Activate the frequency cap to see this metric.</div>
        </MetricCard>
        <MetricCard title="Explore budget options">
          <div className="mt-2 text-12 text-gtext-secondary">No data available</div>
        </MetricCard>
      </div>

      <div className="px-6 text-12 text-gtext-secondary">
        Displaying data for {tab === 'Line items' ? lineItems.length : ios.length} entities
      </div>

      <div className="flex items-center gap-3 px-6 pt-3">
        <Button variant="filled" size="sm" onClick={handleNew}>
          {tab === 'Line items' ? 'New line item' : 'New insertion order'}
        </Button>
        <Dropdown label={<span className="text-13">Performance</span>} items={['Performance', 'Pacing', 'Reach']} />
        <Dropdown
          label={<span className="flex items-center gap-1 text-13"><Icon name="calendar_today" size={16} className="text-gtext-secondary" />Jun 1, 2026</span>}
          items={['Today', 'Last 7 days', 'Last 30 days', 'Custom']}
        />
        <Dropdown label={<span className="text-13">Segment by</span>} items={['None', 'Day', 'Week', 'Month']} />
        <div className="ml-auto flex items-center gap-1">
          <IconButton name="download" label="Download" />
          <IconButton name="fullscreen" label="Fullscreen" />
          <IconButton name="more_vert" label="More" />
        </div>
      </div>

      <FilterBar count={0} chip="" placeholder="Enter a search term or select filters" />

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
    </div>
  )
}
