import { useBreadcrumb } from '../../../components/layout/breadcrumb'
import { PageHeader, FilterBar, Pagination, Button } from '../../../components/ui/primitives'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Icon } from '../../../lib/icons'
import { ADVERTISER } from '../../../data/mock'

// Columns mirror the real DV360 Inventory → Plans table.
interface Plan { id: string; name: string; totalBudget: string; start: string; end: string; channels: string }
const plans: Plan[] = [
  { id: '4821904', name: 'Cyrus Demo Plan', totalBudget: '₹1,00,000', start: 'Aug 1, 2026', end: 'Aug 28, 2026', channels: 'Digital' },
  { id: '4821553', name: 'ba ba black sheep', totalBudget: '₹50,000', start: 'Sep 1, 2026', end: 'Sep 28, 2026', channels: 'Digital' },
  { id: '4820027', name: 'boat 1 2', totalBudget: '₹2,50,000', start: 'Sep 12, 2026', end: 'Oct 28, 2026', channels: 'Digital' },
  { id: '4819330', name: 'bharat mata ki jai', totalBudget: '₹75,000', start: 'Sep 1, 2026', end: 'Sep 28, 2026', channels: 'Digital' },
  { id: '4818771', name: 'FINAL', totalBudget: '₹5,00,000', start: 'Oct 1, 2026', end: 'Oct 28, 2026', channels: 'Digital' },
]
const cols: Column<Plan>[] = [
  { key: 'name', header: 'Name', render: (r) => <span className="text-glink">{r.name}</span> },
  { key: 'id', header: 'ID', render: (r) => <span className="text-gtext-secondary">{r.id}</span> },
  { key: 'totalBudget', header: 'Total Budget', align: 'right' },
  { key: 'start', header: 'Start date' },
  { key: 'end', header: 'End date' },
  { key: 'channels', header: 'Channels' },
]

export default function Plans() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  return (
    <div className="pb-8">
      <PageHeader title="Plans" />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm"><Icon name="add" size={18} /> New plan</Button>
      </div>
      <FilterBar chip="Status: 2 selected" />
      <div className="mt-3">
        <DataTable columns={cols} rows={plans} />
      </div>
      <Pagination total={plans.length} />
    </div>
  )
}
