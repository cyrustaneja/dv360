import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, StatusDot, FilterBar, Pagination } from '../../components/ui/primitives'
import { TableToolbar } from '../../components/ui/parts'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { PARTNER, advertisersList } from '../../data/mock'

type Row = (typeof advertisersList)[number]

const columns: Column<Row>[] = [
  { key: 'name', header: 'Advertiser', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'id', header: 'ID', render: (r) => <span className="text-gtext-secondary">{r.id}</span> },
  { key: 'campaigns', header: 'Campaigns', align: 'right' },
  { key: 'spent', header: 'Spent', align: 'right', group: 'Delivery' },
]

export default function Advertisers() {
  useBreadcrumb([{ label: PARTNER.label, name: PARTNER.name }])
  const navigate = useNavigate()
  return (
    <div className="pb-8">
      <PageHeader title="Advertisers" />
      <TableToolbar primary="New advertiser" />
      <FilterBar />
      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={advertisersList}
          leading={(r) => (
            <div className="flex justify-center">
              <StatusDot status={r.status} />
            </div>
          )}
          onRowClick={() => navigate('/advertiser/campaigns')}
        />
      </div>
      <Pagination total={advertisersList.length} />
    </div>
  )
}
