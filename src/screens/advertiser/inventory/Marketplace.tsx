import { useState } from 'react'
import { useBreadcrumb } from '../../../components/layout/breadcrumb'
import { PageHeader, Tabs } from '../../../components/ui/primitives'
import { Icon } from '../../../lib/icons'
import { ADVERTISER } from '../../../data/mock'

// Promo cards mirror the real DV360 Marketplace "Featured" strip.
const promos = [
  { title: 'Now Live: Reach 250M+ Netflix Viewers via Marketplace Packages & Instant Deals', cta: 'Activate Now', bg: '#e50914' },
  { title: 'Roku provides access to >80M streaming households across all screens', cta: 'Learn More', bg: '#6f1ab1' },
  { title: 'Drive attention & brand lift with premium YouTube ads', cta: 'Buy now', bg: '#0b1f3a' },
]

// Package listings (APAC Premium CTV — Always-On Video).
const packages = [
  { name: 'Magnite Multi-Pub | Always On | APAC Run of Network CTV 2026', imp: '801M', kind: 'Package' },
  { name: 'Multi-Pub | Always-On | IN CTV', imp: '492M', kind: 'Package' },
  { name: 'Multi-Pub | Always-On | IN Video Streaming', imp: '460M', kind: 'Package' },
  { name: 'Xiaomi | Always-On | IN CTV', imp: '1.11M', kind: 'Package' },
  { name: 'News Corp Australia - Tubi CTV Inventory Australia and New Zealand', imp: '5.94M', kind: 'Package' },
  { name: 'Multi-Pub | Always-On | Asia Streaming Female', imp: '568M', kind: 'Package' },
  { name: 'Multi-Pub | Always-On | Samsung TV', imp: '97.6K', kind: 'Package' },
  { name: 'Multi-Pub | Always-On | Xiaomi TV+', imp: '97.6K', kind: 'Package' },
]

export default function Marketplace() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const [tab, setTab] = useState('Featured')
  return (
    <div className="pb-10">
      <PageHeader title="Marketplace" />
      <Tabs tabs={['Featured', 'Discover']} active={tab} onChange={setTab} />

      <div className="px-6 py-5">
        {/* Featured promo strip */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {promos.map((p, i) => (
            <div key={i} className="flex flex-col justify-between rounded-g p-5 text-white" style={{ background: p.bg }}>
              <div className="text-15 font-medium leading-snug">{p.title}</div>
              <button className="mt-4 self-start rounded bg-white/15 px-4 py-1.5 text-14 font-medium hover:bg-white/25">{p.cta}</button>
            </div>
          ))}
        </div>

        {/* Package listing */}
        <div className="mt-8">
          <div className="mb-1 flex items-center gap-2">
            <Icon name="connected_tv" size={20} className="text-gtext-secondary" />
            <h2 className="text-16 font-medium text-gtext-primary">APAC Premium CTV: Always-On Video ({packages.length})</h2>
            <button className="ml-auto text-14 font-medium text-glink hover:underline">Bulk assign ({packages.length})</button>
          </div>
          <p className="mb-3 text-14 text-gtext-secondary">High-scale video packages across APAC verified for Connected TV and big-screen delivery.</p>
          <div className="overflow-hidden rounded-g border border-gborder">
            <table className="w-full text-14">
              <thead>
                <tr className="border-b border-gborder bg-gbg-hover text-left text-12 text-gtext-secondary">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 text-right font-medium">7-day impressions</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p, i) => (
                  <tr key={i} className="border-b border-gborder-light last:border-0 hover:bg-gbg-page">
                    <td className="px-4 py-3 text-glink">{p.name}</td>
                    <td className="px-4 py-3 text-right text-gtext-primary">{p.imp}</td>
                    <td className="px-4 py-3 text-gtext-secondary">{p.kind}</td>
                    <td className="px-4 py-3 text-right"><button className="text-14 font-medium text-glink hover:underline">Add</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex items-center gap-1 rounded-g border border-gborder px-4 py-2 text-14 font-medium text-glink hover:bg-gbg-page">
            <Icon name="bolt" size={18} /> Create an Instant Deal (9)
          </button>
        </div>
      </div>
    </div>
  )
}
