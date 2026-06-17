import type { NavNode } from './Sidebar'

export const partnerNav: NavNode[] = [
  { icon: 'dashboard', label: 'Overview', to: '/', end: true },
  { icon: 'store', label: 'Advertisers', to: '/advertisers' },
  {
    icon: 'bar_chart',
    label: 'Reports',
    children: [
      { label: 'Offline reporting', to: '/reports/offline' },
      { label: 'Report builder', to: '/reports/builder' },
    ],
  },
  {
    icon: 'folder',
    label: 'Resources',
    children: [
      { label: 'Creatives', to: '/resources/creatives' },
      { label: 'Floodlight', to: '/resources/floodlight' },
    ],
  },
  {
    icon: 'settings',
    label: 'Partner settings',
    children: [
      { label: 'Basic details', to: '/partner-settings/basic' },
      { label: 'User management', to: '/partner-settings/users' },
    ],
  },
]

export const advertiserNav: NavNode[] = [
  { icon: 'campaign', label: 'Campaigns', to: '/advertiser/campaigns' },
  {
    icon: 'group',
    label: 'Audiences',
    children: [
      { label: 'All audiences', to: '/advertiser/audiences', end: true },
      { label: 'Analysis', to: '/advertiser/audiences/analysis' },
    ],
  },
  {
    icon: 'image',
    label: 'Creative',
    children: [
      { label: 'Creatives', to: '/advertiser/creatives' },
      { label: 'Format gallery', to: '/advertiser/format-gallery' },
      { label: 'Appeal history', to: '/advertiser/appeal-history' },
    ],
  },
  {
    icon: 'inventory_2',
    label: 'Inventory',
    children: [
      { label: 'Plans', to: '/advertiser/inventory/plans' },
      { label: 'My inventory', to: '/advertiser/inventory/my-inventory' },
      { label: 'Marketplace', to: '/advertiser/inventory/marketplace' },
      { label: 'Negotiations', to: '/advertiser/inventory/negotiations' },
    ],
  },
  {
    icon: 'bar_chart',
    label: 'Reports',
    children: [
      { label: 'Offline reporting', to: '/advertiser/reports' },
      { label: 'Report builder', to: '/advertiser/reports/builder' },
    ],
  },
  { icon: 'science', label: 'Experiments', to: '/advertiser/experiments' },
  { icon: 'ads_click', label: 'Targeting templates', to: '/advertiser/targeting-templates' },
  {
    icon: 'folder',
    label: 'Resources',
    children: [
      { label: 'Floodlight', to: '/advertiser/resources/floodlight' },
      { label: 'Combined audiences', to: '/advertiser/resources/combined-audiences' },
    ],
  },
  { icon: 'settings', label: 'Advertiser settings', to: '/advertiser/settings' },
  { icon: 'history', label: 'History', to: '/advertiser/history' },
]
