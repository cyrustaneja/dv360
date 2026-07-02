import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, Pagination, Button } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

export default function Audiences() {
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])
  const audiences = state.raw.audiences

  return (
    <div className="pb-8">
      <PageHeader title="All audiences" />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/audiences/new')}>
          <Icon name="add" size={18} /> New audience
        </Button>
      </div>
      <FilterBar count={audiences.length} chip="" placeholder="Search audiences" />

      {audiences.length === 0 ? (
        <div className="px-6 py-10 text-center text-13 text-gtext-secondary">
          No audiences yet. Click <span className="font-medium">New audience</span> to build one.
        </div>
      ) : (
        <table className="mt-2 w-full text-13">
          <thead>
            <tr className="border-b border-gborder text-left text-12 text-gtext-secondary">
              <th className="px-6 py-2 font-medium">Audience name</th>
              <th className="px-6 py-2 font-medium">Type</th>
              <th className="px-6 py-2 font-medium">Source</th>
              <th className="px-6 py-2 text-right font-medium">Est. size</th>
            </tr>
          </thead>
          <tbody>
            {audiences.map((a) => (
              <tr
                key={a.id}
                className="cursor-pointer border-b border-gborder-light hover:bg-gbg-page"
                onClick={() => navigate(`/advertiser/audiences/${a.id}/edit`)}
              >
                <td className="px-6 py-2.5 text-gblue-700">{a.name}</td>
                <td className="px-6 py-2.5 text-gtext-secondary">{a.audience_type}</td>
                <td className="px-6 py-2.5 text-gtext-secondary">{a.source ?? '—'}</td>
                <td className="px-6 py-2.5 text-right text-gtext-secondary">{a.settings?.size ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination total={audiences.length} />
    </div>
  )
}
