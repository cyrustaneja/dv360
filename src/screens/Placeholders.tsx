import { useBreadcrumb } from '../components/layout/breadcrumb'
import { PageHeader, FilterBar, EmptyState, Button } from '../components/ui/primitives'
import { Icon } from '../lib/icons'
import { ADVERTISER, PARTNER } from '../data/mock'

type Scope = 'partner' | 'advertiser'

/** A small banner marking a screen as not-yet-functional. Reused across placeholders. */
export function UpcomingBanner() {
  return (
    <div className="mx-6 mt-3 flex items-center gap-2 rounded border border-gborder bg-gbg-page px-3 py-2 text-12 text-gtext-secondary">
      <Icon name="schedule" size={16} className="text-gtext-secondary" />
      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gtext-primary">Upcoming</span>
      This section is view-only for now — it's coming in a future update. Campaigns, insertion orders, line items, creatives, audiences and targeting templates are fully functional.
    </div>
  )
}

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
      <UpcomingBanner />
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
