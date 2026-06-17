import { useState } from 'react'
import { useBreadcrumb } from '../../../components/layout/breadcrumb'
import { PageHeader, Tabs } from '../../../components/ui/primitives'
import { Icon } from '../../../lib/icons'
import { ADVERTISER } from '../../../data/mock'

interface Brand { name: string; sub: string; metric: string; metricLabel: string }
const brands: Brand[] = [
  { name: 'Magnite Multi-Pub', sub: 'Always On | CTV — All Video Streaming', metric: '488M', metricLabel: 'Total impressions' },
  { name: 'Multi-Pub', sub: 'Always On | TV-CTV', metric: '43.6M', metricLabel: 'Total impressions' },
  { name: 'News Corp Australia', sub: 'Premium CTV', metric: '49MM', metricLabel: 'Total impressions' },
  { name: 'Premium Curated', sub: 'CTV Inventory Australia', metric: '16.2M', metricLabel: 'Total impressions' },
  { name: 'News Corp Reach', sub: 'Audience Extension', metric: '4.84M', metricLabel: 'Avg. monthly reach' },
]

export default function Marketplace() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const [tab, setTab] = useState('Featured')
  return (
    <div className="pb-10">
      <PageHeader title="Marketplace" />
      <Tabs tabs={['Featured', 'Discover']} active={tab} onChange={setTab} />

      <div className="px-6 py-5">
        {/* Featured hero */}
        <div className="flex items-center justify-between overflow-hidden rounded-lg bg-[#0b1f3a] p-7 text-white">
          <div className="max-w-md">
            <div className="text-[22px] font-medium leading-snug">Unique network, studio and streaming brands</div>
            <button className="mt-4 rounded bg-white/15 px-4 py-1.5 text-13 font-medium hover:bg-white/25">Learn more</button>
          </div>
          <div className="flex items-center gap-3 text-right">
            <span className="font-gsans text-[64px] leading-none">5</span>
            <div>
              <div className="text-15 font-medium">Paramount+</div>
              <div className="text-12 opacity-80">The Complete CTV Universe</div>
              <div className="text-11 opacity-70">SVOD, AVOD &amp; FAST. All With Paramount.</div>
            </div>
          </div>
        </div>

        {/* Brand cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {brands.map((b, i) => (
            <div key={i} className="rounded-lg border border-gborder bg-white p-4 text-center">
              <Icon name="deployed_code" size={28} className="text-gtext-secondary" />
              <div className="mt-2 truncate text-13 font-medium text-gtext-primary">{b.name}</div>
              <div className="truncate text-11 text-gtext-secondary">{b.sub}</div>
              <div className="mt-3 font-gsans text-[20px] text-gtext-primary">{b.metric}</div>
              <div className="text-11 text-gtext-secondary">{b.metricLabel}</div>
              <button className="mt-2 text-12 font-medium text-gblue-700">Format</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
