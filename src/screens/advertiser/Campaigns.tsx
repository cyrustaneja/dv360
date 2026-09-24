import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, Tabs, StatusDot, FilterBar, Pagination } from '../../components/ui/primitives'
import { TableToolbar } from '../../components/ui/parts'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Icon } from '../../lib/icons'
import { type Campaign } from '../../data/mock'
import { useStore, type IORecord } from '../../store'

// Columns mirror the real DV360 campaigns table.
const campaignCols: Column<Campaign>[] = [
  { key: 'status', header: 'Delivery', render: (r) => <span className="capitalize text-gtext-secondary">{r.status === 'active' ? 'Eligible' : r.status}</span> },
  { key: 'name', header: 'Name', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'budget', header: 'Budget', align: 'right' },
  { key: 'spent', header: 'Spent', align: 'right', render: (r) => <span className="text-gtext-secondary">{r.spent || '₹0.00'}</span> },
  { key: 'kpiGoal', header: 'KPI Goal', align: 'right' },
  { key: 'kpiActual', header: 'KPI Actual', align: 'right', render: (r) => <span className="text-gtext-secondary">{r.kpiActual || '—'}</span> },
]

const ioCols: Column<IORecord>[] = [
  { key: 'status', header: 'Delivery', render: (r) => <span className="capitalize text-gtext-secondary">{r.status === 'active' ? 'Eligible' : r.status}</span> },
  { key: 'name', header: 'Name', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'type', header: 'Type' },
  { key: 'budget', header: 'Budget', align: 'right' },
  { key: 'spent', header: 'Spent', align: 'right', render: () => <span className="text-gtext-secondary">₹0.00</span> },
]

export default function Campaigns() {
  const [tab, setTab] = useState('Campaigns')
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])

  return (
    <div className="pb-8">
      <PageHeader title="Campaigns" />
      <Tabs tabs={['Campaigns', 'Insertion orders']} active={tab} onChange={setTab} />
      <TableToolbar
        primary={tab === 'Campaigns' ? 'New campaign' : 'New insertion order'}
        onPrimary={() => {
          if (tab === 'Campaigns') navigate('/advertiser/campaigns/new')
          else navigate('/advertiser/insertion-orders/new')
        }}
      />
      <FilterBar />
      <div className="mt-3">
        {tab === 'Campaigns' ? (
          <DataTable
            columns={campaignCols}
            rows={state.campaigns}
            leading={(r) => (
              <div className="flex items-center gap-1 pl-1">
                <StatusDot status={r.status} />
                <Icon name="campaign" size={16} className="text-gtext-secondary" />
              </div>
            )}
            onRowClick={(r) => navigate(`/advertiser/campaigns/${r.id}`)}
          />
        ) : (
          <DataTable
            columns={ioCols}
            rows={state.ios}
            leading={(r) => (
              <div className="pl-1">
                <StatusDot status={r.status} />
              </div>
            )}
            onRowClick={(r) => navigate(`/advertiser/insertion-orders/${r.id}`)}
          />
        )}
      </div>
      <Pagination total={tab === 'Campaigns' ? state.campaigns.length : state.ios.length} />
    </div>
  )
}
