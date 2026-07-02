import { useState } from 'react'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { UpcomingBanner } from '../Placeholders'
import { PageHeader, Tabs } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { ADVERTISER } from '../../data/mock'

interface Format {
  name: string
  desc: string
  tag: string
}
const recommended: Format[] = [
  { name: 'Swirl', desc: 'Build brand awareness using 3D models that users can interact with no touch.', tag: 'ONLY IN USE' },
  { name: 'Native video', desc: 'Include a video in a less intrusive ad that fits the look and feel of the publisher’s page.', tag: 'Display + Mobile web' },
  { name: 'Native display', desc: 'Promote your website with a less intrusive ad that fits the look and feel of the publisher’s page.', tag: 'Mobile app + Mobile web' },
]

export default function FormatGallery() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const [tab, setTab] = useState('All Formats')
  return (
    <div className="pb-8">
      <PageHeader title="Format gallery" />
      <UpcomingBanner />
      <Tabs tabs={['All Formats', 'Video', 'Display', 'Native', 'Optimized']} active={tab} onChange={setTab} />

      <div className="px-6 py-5">
        <h2 className="mb-3 text-14 font-medium text-gtext-primary">Recommended formats</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {recommended.map((f) => (
            <FormatCard key={f.name} f={f} />
          ))}
        </div>

        <h2 className="mb-3 mt-8 text-14 font-medium text-gtext-primary">All formats</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {[...recommended, ...recommended].map((f, i) => (
            <FormatCard key={i} f={f} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FormatCard({ f }: { f: Format }) {
  return (
    <div className="rounded-lg border border-gborder bg-white p-3">
      <div className="relative mx-auto flex h-[230px] w-[130px] items-center justify-center rounded-[14px] border-2 border-gtext-primary bg-gbg-hover">
        <div className="absolute inset-x-3 top-3 space-y-1">
          <div className="h-2 rounded bg-gborder" />
          <div className="h-16 rounded bg-[#1a3a8f]" />
          <div className="h-2 w-3/4 rounded bg-gborder" />
          <div className="h-2 w-1/2 rounded bg-gborder" />
          <div className="mt-2 h-5 w-16 rounded bg-gstatus-amber" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-14 font-medium text-gtext-primary">{f.name}</span>
        <span className="rounded bg-gbg-page px-1.5 py-0.5 text-[10px] text-gtext-secondary">{f.tag}</span>
      </div>
      <p className="mt-1 text-12 text-gtext-secondary">{f.desc}</p>
      <div className="mt-3 flex items-center gap-4">
        <button className="text-13 font-medium text-gblue-700">Create</button>
        <button className="text-13 font-medium text-gblue-700">Details</button>
      </div>
    </div>
  )
}
