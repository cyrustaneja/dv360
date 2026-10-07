import { useState } from 'react'
import { useBreadcrumb } from '../../../components/layout/breadcrumb'
import { UpcomingBanner } from '../../Placeholders'
import { PageHeader, Tabs, FilterBar, Dropdown } from '../../../components/ui/primitives'
import { Icon } from '../../../lib/icons'
import { ADVERTISER } from '../../../data/mock'

const cols = ['Inventory source', 'Details', 'Rate & Vol.', 'Delivery', 'Creative reqs.', 'Dates']

export default function MyInventory() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const [tab, setTab] = useState('Orders and deals')
  return (
    <div className="pb-8">
      <PageHeader title="My inventory" />
      <UpcomingBanner />
      <Tabs tabs={['Orders and deals', 'Packages', 'Deal groups']} active={tab} onChange={setTab} />
      <div className="flex items-center gap-3 px-6 pt-3">
        <Dropdown label={<span className="flex items-center gap-1 text-14"><Icon name="calendar_today" size={16} className="text-gtext-secondary" />Jun 1, 2026</span>} items={['Today', 'Last 7 days']} />
      </div>
      <FilterBar chip="Status: 5 selected" placeholder="Enter a search term or select filters" />
      <div className="px-6 pt-3">
        <table className="w-full border-collapse text-14">
          <thead>
            <tr className="text-11 uppercase tracking-wide text-gtext-secondary">
              <th className="w-10 border-b border-gborder px-3 py-2" />
              {cols.map((c) => (
                <th key={c} className="border-b border-gborder py-2 pl-3 text-left font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={cols.length + 1} className="py-10 text-center text-14 text-gtext-secondary">
                No inventory available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
