import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { Banners } from './Banners'
import { Sidebar } from './Sidebar'
import { partnerNav, advertiserNav } from './nav'
import { BreadcrumbProvider } from './breadcrumb'
import { GuidedTour } from '../GuidedTour'

/** Partner-scope layout (Overview, Advertisers, …). */
export function PartnerLayout() {
  return <Shell nav={partnerNav} showWarning showHome={false} />
}

/** Advertiser-scope layout (Campaigns, Creatives, Inventory, …). */
export function AdvertiserLayout() {
  return <Shell nav={advertiserNav} showWarning={false} showHome />
}

function Shell({ nav, showWarning, showHome }: { nav: typeof partnerNav; showWarning: boolean; showHome: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <BreadcrumbProvider>
      <div className="flex h-screen flex-col">
        <AppHeader onToggleNav={() => setCollapsed((c) => !c)} showHome={showHome} />
        <Banners showWarning={showWarning} />
        <div className="flex min-h-0 flex-1">
          <Sidebar nav={nav} collapsed={collapsed} />
          <main className="min-w-0 flex-1 overflow-auto bg-white">
            <Outlet />
          </main>
        </div>
      </div>
      <GuidedTour />
    </BreadcrumbProvider>
  )
}
