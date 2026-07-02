import { createHashRouter, Navigate } from 'react-router-dom'
import { AdvertiserLayout } from './components/layout/AppShell'
import { RequireAuth } from './auth/guards'
import { useStore } from './store'

// Top-level screens
import Home from './screens/Home'

// Advertiser-scope screens
import Campaigns from './screens/advertiser/Campaigns'
import CampaignDetail from './screens/advertiser/CampaignDetail'
import InsertionOrderDetail from './screens/advertiser/InsertionOrderDetail'
import LineItemDetail from './screens/advertiser/LineItemDetail'
import Audiences from './screens/advertiser/Audiences'
import Creatives from './screens/advertiser/Creatives'
import FormatGallery from './screens/advertiser/FormatGallery'
import MyInventory from './screens/advertiser/inventory/MyInventory'
import Plans from './screens/advertiser/inventory/Plans'
import Marketplace from './screens/advertiser/inventory/Marketplace'
import TargetingTemplates from './screens/advertiser/TargetingTemplates'
import AdvertiserSettings from './screens/advertiser/AdvertiserSettings'
import History from './screens/advertiser/History'

// Wizards
import NewCampaign from './screens/wizards/NewCampaign'
import NewInsertionOrder from './screens/wizards/NewInsertionOrder'
import NewLineItem from './screens/wizards/NewLineItem'
import NewTargetingTemplate from './screens/wizards/NewTargetingTemplate'
import NewCreative from './screens/wizards/NewCreative'
import NewAudience from './screens/wizards/NewAudience'

// Light / empty screens
import {
  Analysis,
  AppealHistory,
  Negotiations,
  Experiments,
  AdvReports,
  ReportBuilder,
  AdvResources,
} from './screens/Placeholders'

/** Advertiser routes require both auth and a selected advertiser. */
function AdvertiserGuard() {
  const { state } = useStore()
  if (!state.currentAdvertiser) return <Navigate to="/" replace />
  return <AdvertiserLayout />
}

export const router = createHashRouter([
  { path: '/', element: <RequireAuth><Home /></RequireAuth> },
  {
    element: <RequireAuth><AdvertiserGuard /></RequireAuth>,
    children: [
      { path: '/advertiser/campaigns', element: <Campaigns /> },
      { path: '/advertiser/campaigns/new', element: <NewCampaign /> },
      { path: '/advertiser/campaigns/:id/edit', element: <NewCampaign /> },
      { path: '/advertiser/campaigns/:id', element: <CampaignDetail /> },
      { path: '/advertiser/insertion-orders/new', element: <NewInsertionOrder /> },
      { path: '/advertiser/insertion-orders/:id/edit', element: <NewInsertionOrder /> },
      { path: '/advertiser/insertion-orders/:id', element: <InsertionOrderDetail /> },
      { path: '/advertiser/line-items/new', element: <NewLineItem /> },
      { path: '/advertiser/line-items/:id', element: <LineItemDetail /> },
      { path: '/advertiser/audiences', element: <Audiences /> },
      { path: '/advertiser/audiences/new', element: <NewAudience /> },
      { path: '/advertiser/audiences/:id/edit', element: <NewAudience /> },
      { path: '/advertiser/audiences/analysis', element: <Analysis /> },
      { path: '/advertiser/creatives', element: <Creatives /> },
      { path: '/advertiser/creatives/new', element: <NewCreative /> },
      { path: '/advertiser/creatives/:id/edit', element: <NewCreative /> },
      { path: '/advertiser/format-gallery', element: <FormatGallery /> },
      { path: '/advertiser/appeal-history', element: <AppealHistory /> },
      { path: '/advertiser/inventory/plans', element: <Plans /> },
      { path: '/advertiser/inventory/my-inventory', element: <MyInventory /> },
      { path: '/advertiser/inventory/marketplace', element: <Marketplace /> },
      { path: '/advertiser/inventory/negotiations', element: <Negotiations /> },
      { path: '/advertiser/reports', element: <AdvReports /> },
      { path: '/advertiser/reports/builder', element: <ReportBuilder /> },
      { path: '/advertiser/experiments', element: <Experiments /> },
      { path: '/advertiser/targeting-templates', element: <TargetingTemplates /> },
      { path: '/advertiser/targeting-templates/new', element: <NewTargetingTemplate /> },
      { path: '/advertiser/targeting-templates/:id/edit', element: <NewTargetingTemplate /> },
      { path: '/advertiser/resources/*', element: <AdvResources /> },
      { path: '/advertiser/settings', element: <AdvertiserSettings /> },
      { path: '/advertiser/history', element: <History /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
