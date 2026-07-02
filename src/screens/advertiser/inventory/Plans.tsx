import { useBreadcrumb } from '../../../components/layout/breadcrumb'
import { UpcomingBanner } from '../../Placeholders'
import { PageHeader, FilterBar, Pagination, Button } from '../../../components/ui/primitives'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Icon } from '../../../lib/icons'
import { ADVERTISER } from '../../../data/mock'

interface Plan { id: string; name: string; totalBudget: string; start: string; end: string; status: string }
const plans: Plan[] = [
  { id: 'p1', name: 'Q2 Display Plan', totalBudget: '₹1,00,000', start: 'Apr 1, 2026', end: 'Jun 30, 2026', status: 'Draft' },
  { id: 'p2', name: 'CTV Awareness Plan', totalBudget: '₹2,50,000', start: 'May 1, 2026', end: 'Jul 31, 2026', status: 'Draft' },
]
const cols: Column<Plan>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="text-gblue-700">{r.name}</span> },
  { key: 'totalBudget', header: 'Total budget', align: 'right' },
  { key: 'start', header: 'Start date' },
  { key: 'end', header: 'End date' },
  { key: 'status', header: 'Status' },
]

export default function Plans() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  return (
    <div className="pb-8">
      <PageHeader title="Plans" />
      <UpcomingBanner />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm"><Icon name="add" size={18} /> New plan</Button>
      </div>
      <FilterBar chip="Status: 5 selected" />
      <div className="mt-3">
        <DataTable columns={cols} rows={plans} />
      </div>
      <Pagination total={plans.length} />
    </div>
  )
}
