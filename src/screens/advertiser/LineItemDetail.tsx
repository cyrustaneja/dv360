import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs } from '../../components/ui/primitives'
import { FormActionBar } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

interface TargetRow {
  label: string
  mode: 'include' | 'exclude'
  heading: string
  detail: string[]
  more?: number
}

const targeting: TargetRow[] = [
  { label: 'Apps & URLs', mode: 'exclude', heading: 'Excluded channels', detail: ['Non-Reportable Sites and Apps'] },
  { label: 'Categories', mode: 'exclude', heading: 'Exclude the following categories', detail: ['/Games'] },
  { label: 'Viewability', mode: 'include', heading: 'Open Measurement', detail: ['Active View', '60% or greater'] },
  {
    label: 'Geography',
    mode: 'include',
    heading: 'Region inclusions',
    detail: [
      'Mumbai, Maharashtra, India (City)',
      'Chennai, Chennai, Tamil Nadu, India (City)',
      'Delhi, India (Union Territory)',
      'Hyderabad, Telangana, India (City)',
      'Pune, Maharashtra, India (City)',
    ],
    more: 3,
  },
  { label: 'Device', mode: 'include', heading: 'Include the following device types', detail: ['Computer', 'Smartphone'] },
]

export default function LineItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()
  const li = state.lineItems.find((l) => l.id === id) ?? state.lineItems[0]
  const parentIO = state.ios.find((io) => io.id === li?.ioId)
  const parentCampaign = state.campaigns.find((c) => c.id === parentIO?.campaignId)
  useBreadcrumb([
    { label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' },
    ...(parentCampaign ? [{ label: 'Campaign', name: parentCampaign.name, to: `/advertiser/campaigns/${parentCampaign.id}` }] : []),
    ...(parentIO ? [{ label: 'Insertion order', name: parentIO.name, to: `/advertiser/insertion-orders/${parentIO.id}` }] : []),
    { label: 'Line item', name: li?.name ?? 'Line item' },
  ])
  const [tab, setTab] = useState('Line item details')

  return (
    <div className="pb-20">
      <div className="px-6 pt-4">
        <button onClick={() => navigate(-1)} className="text-12 text-gblue-700 hover:underline">‹ Overview</button>
        <div className="mt-1 flex items-center">
          <h1 className="font-gsans text-22 text-gtext-primary">{li.name}</h1>
          <span className="ml-3 rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary">Limited Access</span>
        </div>
      </div>
      <Tabs tabs={['Line item details', 'Troubleshooter', 'History']} active={tab} onChange={setTab} />

      {tab === 'Line item details' && (
        <div className="px-6">
          {targeting.map((t) => (
            <div key={t.label} className="grid grid-cols-[160px_1fr] gap-6 border-b border-gborder-light py-5">
              <div className="text-13 font-medium text-gtext-primary">{t.label}</div>
              <div>
                <div className="flex items-center gap-2">
                  <Icon
                    name={t.mode === 'exclude' ? 'block' : 'check'}
                    size={18}
                    className={t.mode === 'exclude' ? 'text-gstatus-red' : 'text-gstatus-green'}
                  />
                  <span className="text-13 font-medium text-gtext-primary">{t.heading}</span>
                </div>
                <div className="mt-1 pl-6 text-13 text-gtext-secondary">
                  {t.detail.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                  {t.more && <button className="mt-1 text-gblue-700">show {t.more} more</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Troubleshooter' && (
        <div className="px-6 py-6 text-13 text-gtext-secondary">
          <div className="flex items-center gap-2 text-gtext-primary">
            <Icon name="check_circle" size={18} className="text-gstatus-green" />
            This line item is eligible to serve.
          </div>
          <p className="mt-3 max-w-xl">No blocking issues detected. Targeting, budget and creative checks have passed.</p>
        </div>
      )}

      {tab === 'History' && (
        <div className="px-6 py-4 text-13 text-gtext-secondary">
          <div className="border-b border-gborder-light py-3">Created line item — May 9, 2026</div>
          <div className="border-b border-gborder-light py-3">Edited geography targeting — May 12, 2026</div>
        </div>
      )}

      {tab === 'Line item details' && <FormActionBar />}
    </div>
  )
}
