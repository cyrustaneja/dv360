import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, EmptyState, Button } from '../../components/ui/primitives'
import { ADVERTISER } from '../../data/mock'

export default function TargetingTemplates() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const navigate = useNavigate()
  return (
    <div className="pb-8">
      <PageHeader title="Targeting templates" />
      <div className="px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/targeting-templates/new')}>
          New
        </Button>
      </div>
      <FilterBar count={0} chip="" />
      <EmptyState
        title="No targeting templates"
        subtitle="Streamline your line item setup with targeting templates."
        actions={
          <>
            <Button variant="outlined" size="sm">Take a tour</Button>
            <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/targeting-templates/new')}>
              New targeting template
            </Button>
          </>
        }
      />
    </div>
  )
}
