import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, EmptyState, Button } from '../../components/ui/primitives'
import { useStore } from '../../store'

export default function TargetingTemplates() {
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])
  const templates = state.raw.templates

  return (
    <div className="pb-8">
      <PageHeader title="Targeting templates" />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/targeting-templates/new')}>
          New
        </Button>
      </div>
      <FilterBar count={templates.length} chip="" />

      {templates.length === 0 ? (
        <EmptyState
          title="No targeting templates"
          subtitle="Streamline your line item setup with targeting templates."
          actions={
            <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/targeting-templates/new')}>
              New targeting template
            </Button>
          }
        />
      ) : (
        <table className="mt-2 w-full text-14">
          <thead>
            <tr className="border-b border-gborder text-left text-12 text-gtext-secondary">
              <th className="px-6 py-2 font-medium">Name</th>
              <th className="px-6 py-2 font-medium">Type</th>
              <th className="px-6 py-2 font-medium">Targeting summary</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => {
              const tg = t.targeting ?? {}
              const summary = [
                tg.geography?.length ? `${tg.geography.length} geos` : null,
                tg.audiences?.length ? `${tg.audiences.length} audiences` : null,
                tg.devices?.length ? `${tg.devices.length} devices` : null,
              ].filter(Boolean).join(' · ') || '—'
              return (
                <tr
                  key={t.id}
                  className="cursor-pointer border-b border-gborder-light hover:bg-gbg-page"
                  onClick={() => navigate(`/advertiser/targeting-templates/${t.id}/edit`)}
                >
                  <td className="px-6 py-2.5 text-gblue-700">{t.name}</td>
                  <td className="px-6 py-2.5 text-gtext-secondary">{t.li_type ?? 'Display'}</td>
                  <td className="px-6 py-2.5 text-gtext-secondary">{summary}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
