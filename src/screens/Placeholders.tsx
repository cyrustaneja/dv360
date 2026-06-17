import { useBreadcrumb } from '../components/layout/breadcrumb'
import { PageHeader, FilterBar, EmptyState, Button } from '../components/ui/primitives'
import { Icon } from '../lib/icons'
import { ADVERTISER, PARTNER } from '../data/mock'

type Scope = 'partner' | 'advertiser'

function useScopeCrumb(scope: Scope) {
  useBreadcrumb(
    scope === 'partner'
      ? [{ label: PARTNER.label, name: PARTNER.name }]
      : [{ label: ADVERTISER.label, name: ADVERTISER.name }],
  )
}

/** A standard "nothing here yet" screen with the DV360 empty illustration. */
function EmptyScreen({
  scope,
  title,
  subtitle,
  cta,
  filter = true,
}: {
  scope: Scope
  title: string
  subtitle?: string
  cta?: string
  filter?: boolean
}) {
  useScopeCrumb(scope)
  return (
    <div className="pb-8">
      <PageHeader title={title} />
      {cta && (
        <div className="px-6 pt-3">
          <Button variant="filled" size="sm">
            <Icon name="add" size={18} /> {cta}
          </Button>
        </div>
      )}
      {filter && <FilterBar count={0} chip="" />}
      <EmptyState title={`No ${title.toLowerCase()} yet`} subtitle={subtitle} />
    </div>
  )
}

/* Advertiser scope -------------------------------------------------------- */
export const Analysis = () => (
  <EmptyScreen scope="advertiser" title="Analysis" subtitle="Audience insights and overlap analysis appear here once you have active audiences." filter={false} />
)
export const AppealHistory = () => (
  <EmptyScreen scope="advertiser" title="Appeal history" subtitle="Creative policy appeals you submit will be listed here." />
)
export const Negotiations = () => (
  <EmptyScreen scope="advertiser" title="Negotiations" subtitle="Deal negotiations with publishers will appear here." cta="New negotiation" />
)
export const Experiments = () => (
  <EmptyScreen scope="advertiser" title="Experiments" subtitle="A/B tests and brand lift studies live here." cta="New experiment" />
)
export const AdvReports = () => (
  <EmptyScreen scope="advertiser" title="Offline reporting" subtitle="Scheduled and one-off reports will appear here." cta="Create report" />
)
export const ReportBuilder = () => (
  <EmptyScreen scope="advertiser" title="Report builder" subtitle="Build a custom report by selecting dimensions and metrics." filter={false} />
)
export const AdvResources = () => (
  <EmptyScreen scope="advertiser" title="Floodlight" subtitle="Conversion activities and tags appear here." />
)

/* Partner scope ----------------------------------------------------------- */
export const PartnerReports = () => (
  <EmptyScreen scope="partner" title="Offline reporting" subtitle="Partner-level scheduled reports appear here." cta="Create report" />
)
export const PartnerResources = () => (
  <EmptyScreen scope="partner" title="Creatives" subtitle="Shared partner creatives appear here." />
)
export const PartnerSettings = () => (
  <EmptyScreen scope="partner" title="Basic details" subtitle="Partner configuration and defaults." filter={false} />
)
