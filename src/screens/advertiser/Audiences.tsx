import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, Tabs, FilterBar, Pagination, Button } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

// DV360 Audiences sub-tabs.
const TABS = ['First-party', 'Custom lists', 'Combined', 'Partner'] as const
type Tab = (typeof TABS)[number]

/** Which sub-tab an audience belongs to, based on its type. */
function bucket(a: any): Tab {
  const t = (a.audience_type ?? '').toLowerCase()
  if (t.includes('custom')) return 'Custom lists'
  if (t.includes('combined')) return 'Combined'
  if (t.includes('partner') || t.includes('third')) return 'Partner'
  return 'First-party'
}

export default function Audiences() {
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])
  const [tab, setTab] = useState<Tab>('First-party')
  const audiences = state.raw.audiences
  const rows = audiences.filter((a) => bucket(a) === tab)

  return (
    <div className="pb-8">
      <PageHeader title="Audiences" />
      <Tabs tabs={TABS as unknown as string[]} active={tab} onChange={(t) => setTab(t as Tab)} />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/audiences/new')}>
          <Icon name="add" size={18} /> New audience
        </Button>
      </div>
      <FilterBar count={rows.length} chip="" placeholder="Search audiences" />

      {rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-14 text-gtext-secondary">
          {tab === 'First-party'
            ? <>No first-party audiences yet. Click <span className="font-medium">New audience</span> to build one.</>
            : `No ${tab.toLowerCase()} audiences.`}
        </div>
      ) : (
        <table className="mt-2 w-full text-14">
          <thead>
            <tr className="border-b border-gborder text-left text-12 text-gtext-secondary">
              <th className="px-6 py-2 font-medium">Audience name</th>
              <th className="px-6 py-2 font-medium">Type</th>
              <th className="px-6 py-2 font-medium">Source</th>
              <th className="px-6 py-2 text-right font-medium">Audience size</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.id}
                className="cursor-pointer border-b border-gborder-light hover:bg-gbg-page"
                onClick={() => navigate(`/advertiser/audiences/${a.id}/edit`)}
              >
                <td className="px-6 py-2.5 text-glink">{a.name}</td>
                <td className="px-6 py-2.5 text-gtext-secondary">{a.audience_type}</td>
                <td className="px-6 py-2.5 text-gtext-secondary">{a.source ?? '—'}</td>
                <td className="px-6 py-2.5 text-right text-gtext-secondary">{a.settings?.size ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination total={rows.length} />
    </div>
  )
}
