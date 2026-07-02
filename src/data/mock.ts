/**
 * Mock data for the DV360 simulation.
 *
 * Phase 1 is frontend-only. All values below are static and modelled on the
 * reference recording (Partner "DWAO Managed Accounts" / Advertiser
 * "Kraftshala"). Types are intentionally shaped like the eventual API
 * responses so screens can later swap this module for real data fetching
 * without changing the component layer.
 */

export type DeliveryStatus = 'active' | 'paused' | 'draft' | 'ended'

export interface Campaign {
  id: string
  name: string
  status: DeliveryStatus
  budget: string
  spent: string
  kpiGoal: string
  kpiActual: string
}

export interface InsertionOrder {
  id: string
  name: string
  type: 'Standard' | 'YouTube & partners'
  status: DeliveryStatus
  budget: string
  goal: string
  delivery: string
  impressions: string
  revenue: string
  interactions: string
  conversions: string
  channel: 'Display' | 'YouTube Video'
}

export interface LineItem {
  id: string
  name: string
  type: 'Display' | 'Video' | 'Audio'
  status: DeliveryStatus
  budget: string
  goal: string
  impressions: string
  revenue: string
  clicks: string
  conversions: string
  cpm: string
}

export interface Creative {
  id: string
  name: string
  dimensions: string
  type: string
  accent: string
  label: string
  image_url?: string | null
}

export interface AudienceRow {
  id: string
  name: string
  type: string
  size: string
  source: string
}

export const PARTNER = {
  id: '883260439',
  name: 'DWAO Managed Accounts',
  label: 'Partner',
}

export const ADVERTISER = {
  id: '8118782786',
  name: 'Kraftshala',
  label: 'Advertiser',
}

export const campaigns: Campaign[] = [
  { id: '56793272', name: 'Kraftshala - Dummy Campaign', status: 'active', budget: 'Unknown', spent: '-', kpiGoal: '-', kpiActual: '-' },
  { id: '56797402', name: 'Kraftshala_Dummy_Sleepywol_Awareness', status: 'active', budget: 'Unknown', spent: '-', kpiGoal: '-', kpiActual: '-' },
  { id: '56800352', name: 'Kraftshala_Dummy_Sleepywol_Consideration', status: 'active', budget: 'Unknown', spent: '-', kpiGoal: '-', kpiActual: '-' },
  { id: '56825622', name: 'Kraftshala_Dummy_Sleepywol_Conversion', status: 'active', budget: 'Unknown', spent: '-', kpiGoal: '-', kpiActual: '-' },
]

export const insertionOrders: InsertionOrder[] = [
  { id: '1027240259', name: 'Mock_IO_April', type: 'Standard', status: 'active', budget: '₹1.00', goal: '₹1.00 CPM', delivery: '0', impressions: '0', revenue: '₹0.00', interactions: '0', conversions: '0', channel: 'Display' },
  { id: '1027240260', name: 'Mock_IO_April', type: 'Standard', status: 'active', budget: '₹1.00', goal: '₹1.00 CPM', delivery: '0', impressions: '0', revenue: '₹0.00', interactions: '0', conversions: '0', channel: 'Display' },
]

export const lineItems: LineItem[] = [
  { id: '23741537661', name: 'Cart abandoners', type: 'Display', status: 'active', budget: 'Unlimited', goal: '₹260.00 CPM', impressions: '0', revenue: '₹0.00', clicks: '0', conversions: '0', cpm: '₹0.00' },
  { id: '23741850893', name: 'General site visitors', type: 'Display', status: 'active', budget: 'Unlimited', goal: '₹260.00 CPM', impressions: '0', revenue: '₹0.00', clicks: '0', conversions: '0', cpm: '₹0.00' },
  { id: '23741841773', name: 'Product page viewers (3+ visits)', type: 'Display', status: 'active', budget: 'Unlimited', goal: '₹160.00 CPM', impressions: '0', revenue: '₹0.00', clicks: '0', conversions: '0', cpm: '₹0.00' },
]

const creativeLabels = [
  'Consideration_300x250', 'Consideration_728x90', 'Consideration_320x50', 'Consideration_300x600',
  'Awareness_300x250', 'Awareness_P – rkg_300x600', 'Awareness_320x50', 'Awareness_728x90',
  'Conversion_300x250', 'Conversion_728x90', 'Display_April_300x250', 'Display_April_728x90',
]
const dims = ['300 × 250', '728 × 90', '320 × 50', '300 × 600']
const accents = ['#1a3a8f', '#0b2e6f', '#c79a1e', '#1f1f1f', '#7b1fa2', '#0d652d']
export const creatives: Creative[] = creativeLabels.map((label, i) => ({
  id: `cr-${1000 + i}`,
  name: label,
  dimensions: dims[i % dims.length],
  type: 'Standard',
  accent: accents[i % accents.length],
  label,
}))

export const audiences: AudienceRow[] = [
  { id: 'aud-1', name: 'Cart abandoners', type: 'First-party', size: '12,400', source: 'Floodlight' },
  { id: 'aud-2', name: 'Site visitors – early retargeting', type: 'First-party', size: '48,900', source: 'Floodlight' },
  { id: 'aud-3', name: 'Product page viewers (3+ visits)', type: 'First-party', size: '8,210', source: 'Floodlight' },
  { id: 'aud-4', name: 'Affinity: Marketing & Advertising', type: 'Affinity', size: '2.4M', source: 'Google' },
  { id: 'aud-5', name: 'In-market: Online courses', type: 'In-market', size: '1.1M', source: 'Google' },
]

export interface RecentItem {
  advertiser: string
  name: string
  date: string
}
export const recentlyOpened: RecentItem[] = [
  { advertiser: 'Kraftshala', name: 'Affinity display', date: '5/25' },
  { advertiser: 'Kraftshala', name: 'Mock_Display_AffinityInmarket', date: '5/25' },
  { advertiser: 'Kraftshala', name: 'Cart abandoners', date: '5/19' },
  { advertiser: 'Kraftshala', name: 'Mock_Non_Skippable', date: '5/18' },
  { advertiser: 'Kraftshala', name: 'Site visitors – early retargeting', date: '5/5' },
]

export interface Tutorial {
  title: string
  minutes: number
}
export const tutorials: Tutorial[] = [
  { title: 'Introductory tour', minutes: 1 },
  { title: 'Account structure introduction', minutes: 2 },
  { title: 'Partner-level navigation', minutes: 2 },
  { title: 'Advertiser-level navigation', minutes: 3 },
]

export const advertisersList = [
  { id: '8118782786', name: 'Kraftshala', status: 'active' as DeliveryStatus, campaigns: 4, spent: '₹0.00' },
  { id: '8118782787', name: 'Kraftshala – Test', status: 'paused' as DeliveryStatus, campaigns: 1, spent: '₹0.00' },
]
