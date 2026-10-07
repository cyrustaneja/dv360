import type { NavNode } from './Sidebar'

export const partnerNav: NavNode[] = [
  { icon: 'dashboard', label: 'Overview', to: '/', end: true },
  { icon: 'store', label: 'Advertisers', to: '/advertisers' },
  {
    icon: 'insert_chart',
    label: 'Reports',
    children: [
      { label: 'Offline reporting', to: '/reports/offline' },
      { label: 'Report builder', to: '/reports/builder' },
    ],
  },
  {
    icon: 'assignment',
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
  { icon: 'explore', label: 'Campaigns', to: '/advertiser/campaigns' },
  {
    icon: 'people',
    label: 'Audiences',
    children: [
      { label: 'All audiences', to: '/advertiser/audiences', end: true },
      { label: 'Analysis', to: '/advertiser/audiences/analysis', upcoming: true },
    ],
  },
  {
    icon: 'insert_photo',
    label: 'Creative',
    children: [
      { label: 'Creatives', to: '/advertiser/creatives' },
      { label: 'Format gallery', to: '/advertiser/format-gallery', upcoming: true },
      { label: 'Appeal history', to: '/advertiser/appeal-history', upcoming: true },
    ],
  },
  {
    icon: 'inventory',
    label: 'Inventory',
    children: [
      { label: 'Plans', to: '/advertiser/inventory/plans' },
      { label: 'My inventory', to: '/advertiser/inventory/my-inventory', upcoming: true },
      { label: 'Marketplace', to: '/advertiser/inventory/marketplace' },
      { label: 'Negotiations', to: '/advertiser/inventory/negotiations', upcoming: true },
    ],
  },
  {
    icon: 'insert_chart',
    label: 'Reports',
    children: [
      { label: 'Overview', to: '/advertiser/reports', end: true },
      { label: 'Report builder', to: '/advertiser/reports/builder', upcoming: true },
    ],
  },
  { icon: 'science', label: 'Experiments', to: '/advertiser/experiments', upcoming: true },
  { icon: 'library_books', label: 'Targeting templates', to: '/advertiser/targeting-templates' },
  {
    icon: 'assignment',
    label: 'Resources',
    upcoming: true,
    children: [
      { label: 'Floodlight', to: '/advertiser/resources/floodlight', upcoming: true },
      { label: 'Combined audiences', to: '/advertiser/resources/combined-audiences', upcoming: true },
    ],
  },
  { icon: 'settings', label: 'Advertiser settings', to: '/advertiser/settings', upcoming: true },
  { icon: 'history', label: 'History', to: '/advertiser/history', upcoming: true },
]
