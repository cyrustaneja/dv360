import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, Pagination, Button } from '../../components/ui/primitives'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Icon } from '../../lib/icons'
import { ADVERTISER, audiences, type AudienceRow } from '../../data/mock'

const cols: Column<AudienceRow>[] = [
  { key: 'name', header: 'Audience name', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'type', header: 'Type' },
  { key: 'source', header: 'Source' },
  { key: 'size', header: 'Display size', align: 'right' },
]

export default function Audiences() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  return (
    <div className="pb-8">
      <PageHeader title="All audiences" />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm"><Icon name="add" size={18} /> New audience</Button>
      </div>
      <FilterBar count={0} chip="" placeholder="Search audiences" />
      <div className="mt-3">
        <DataTable columns={cols} rows={audiences} />
      </div>
      <Pagination total={audiences.length} />
    </div>
  )
}
