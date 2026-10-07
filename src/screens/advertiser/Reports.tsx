import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, Tabs, Button } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

// Sub-tabs mirror the real DV360 Reports area.
const TABS = ['Overview', 'Instant & offline', 'Cross-media reach']

export default function Reports() {
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])
  const [tab, setTab] = useState('Overview')

  return (
    <div className="pb-8">
      <PageHeader title="Reports" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: 'insert_chart', title: 'Standard report', desc: 'Build a custom report across your campaigns, line items and creatives.' },
              { icon: 'campaign', title: 'Reach report', desc: 'Understand unique reach and frequency across your media.' },
              { icon: 'trending_up', title: 'Performance', desc: 'Track KPIs like impressions, clicks, CTR and conversions.' },
            ].map((c) => (
              <div key={c.title} className="rounded-g border border-gborder bg-white p-5">
                <Icon name={c.icon} size={28} className="text-gblue-600" />
                <div className="mt-3 text-16 font-medium text-gtext-primary">{c.title}</div>
                <div className="mt-1 text-14 text-gtext-secondary">{c.desc}</div>
                <button onClick={() => navigate('/advertiser/reports/builder')} className="mt-4 text-14 font-medium text-glink hover:underline">Create report</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Instant & offline' && (
        <div className="pb-8">
          <div className="px-6 pt-3">
            <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/reports/builder')}><Icon name="add" size={18} /> Create report</Button>
          </div>
          <div className="px-6 py-16 text-center text-14 text-gtext-secondary">
            No reports yet. Create an instant or scheduled offline report to see it here.
          </div>
        </div>
      )}

      {tab === 'Cross-media reach' && (
        <div className="px-6 py-16 text-center text-14 text-gtext-secondary">
          Cross-media reach measurement will appear here once campaigns start delivering.
        </div>
      )}
    </div>
  )
}
