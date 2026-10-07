import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { UpcomingBanner } from '../Placeholders'
import { PageHeader, FilterBar } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { ADVERTISER } from '../../data/mock'

const entries = [
  { what: 'Edited geography targeting on "Cart abandoners"', who: 'product@kraftshala.com', when: 'May 12, 2026 2:14 PM' },
  { what: 'Created line item "Product page viewers (3+ visits)"', who: 'product@kraftshala.com', when: 'May 9, 2026 11:48 AM' },
  { what: 'Created insertion order "1P Retargeting — our own data only"', who: 'product@kraftshala.com', when: 'May 9, 2026 11:24 AM' },
  { what: 'Created campaign "Kraftshala_Dummy_Sleepywol_Conversion"', who: 'product@kraftshala.com', when: 'May 8, 2026 6:02 PM' },
]

export default function History() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  return (
    <div className="pb-8">
      <PageHeader title="History" />
      <UpcomingBanner />
      <FilterBar count={0} chip="" placeholder="Search change history" />
      <div className="px-6 pt-3">
        {entries.map((e, i) => (
          <div key={i} className="flex gap-3 border-b border-gborder-light py-3">
            <Icon name="history" size={18} className="mt-0.5 text-gtext-secondary" />
            <div>
              <div className="text-14 text-gtext-primary">{e.what}</div>
              <div className="text-12 text-gtext-secondary">{e.who} · {e.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
