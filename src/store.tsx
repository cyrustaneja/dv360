/**
 * Data layer backed by our serverless /api (which talks to the shared hub
 * Supabase with the service-role key). The app is scoped to a "current
 * advertiser"; selecting one loads its campaigns / IOs / line items / creatives.
 *
 * DB rows are mapped to the same TypeScript shapes the screens already use so
 * the UI layer barely changes.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, type AdvertiserRow } from './lib/api'
import { useAuth } from './auth/AuthContext'
import type { Campaign, Creative, InsertionOrder, LineItem } from './data/mock'

export interface Advertiser {
  id: string
  name: string
  batch: string | null
}

export interface IORecord extends InsertionOrder {
  campaignId: string
}

export interface LIRecord extends LineItem {
  ioId: string
}

// ─── Row → UI mappers ──────────────────────────────────────────────────────

function mapCampaign(r: any): Campaign {
  return {
    id: r.id,
    name: r.name,
    status: r.status ?? 'active',
    budget: r.budget ?? 'Unknown',
    spent: '-',
    kpiGoal: r.kpi_goal ?? '-',
    kpiActual: '-',
  }
}

function mapIO(r: any): IORecord {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    name: r.name,
    type: (r.io_type ?? 'Standard') as InsertionOrder['type'],
    status: r.status ?? 'active',
    budget: r.budget ?? '₹0.00',
    goal: r.kpi_value ? `₹${r.kpi_value} ${r.kpi_type ?? 'CPM'}` : `₹0.00 ${r.kpi_type ?? 'CPM'}`,
    delivery: '0',
    impressions: '0',
    revenue: '₹0.00',
    interactions: '0',
    conversions: '0',
    channel: 'Display',
  }
}

function mapLI(r: any): LIRecord {
  return {
    id: r.id,
    ioId: r.io_id,
    name: r.name,
    type: (r.li_type ?? 'Display') as LineItem['type'],
    status: r.status ?? 'active',
    budget: r.budget_type === 'limited' ? (r.budget ?? '₹0.00') : 'Unlimited',
    goal: r.bid_amount ? `₹${r.bid_amount} CPM` : '₹0.00 CPM',
    impressions: '0',
    revenue: '₹0.00',
    clicks: '0',
    conversions: '0',
    cpm: '₹0.00',
  }
}

function mapCreative(r: any): Creative {
  return {
    id: r.id,
    name: r.name,
    dimensions: r.dimensions ?? '300 × 250',
    type: r.creative_type ?? 'Standard',
    accent: r.accent ?? '#1a73e8',
    label: r.name,
  }
}

// ─── Store context ───────────────────────────────────────────────────────────

interface StoreState {
  advertisers: Advertiser[]
  currentAdvertiser: Advertiser | null
  campaigns: Campaign[]
  ios: IORecord[]
  lineItems: LIRecord[]
  creatives: Creative[]
  loading: boolean
}

interface StoreApi {
  state: StoreState
  selectAdvertiser: (id: string) => void
  reloadAdvertisers: () => Promise<void>
  createAdvertiser: (name: string, batch?: string) => Promise<string | null>
  addCampaign: (input: CampaignInput) => Promise<string | null>
  addIO: (input: IOInput) => Promise<string | null>
  addLineItem: (input: LIInput) => Promise<string | null>
  addCreative: (input: CreativeInput) => Promise<string | null>
}

export interface CampaignInput {
  name: string
  goal?: string
  kpi_goal?: string
  budget?: string
  planned_spend?: string
  start_date?: string
  end_date?: string
}
export interface IOInput {
  campaign_id: string
  name: string
  io_type?: string
  budget?: string
  pacing?: string
  freq_cap?: string
  kpi_type?: string
  kpi_value?: string
  start_date?: string
  end_date?: string
}
export interface LIInput {
  io_id: string
  name: string
  li_type?: string
  budget_type?: string
  budget?: string
  pacing?: string
  bid_strategy?: string
  bid_amount?: string
  freq_cap?: string
  targeting?: Record<string, unknown>
}
export interface CreativeInput {
  name: string
  dimensions?: string
  creative_type?: string
  click_url?: string
  accent?: string
}

const StoreCtx = createContext<StoreApi | null>(null)

const ADV_KEY = 'dv360sim-current-advertiser'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { me } = useAuth()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [currentId, setCurrentId] = useState<string | null>(
    () => localStorage.getItem(ADV_KEY)
  )
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [ios, setIOs] = useState<IORecord[]>([])
  const [lineItems, setLineItems] = useState<LIRecord[]>([])
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(false)

  const reloadAdvertisers = useCallback(async () => {
    try {
      const { advertisers } = await api.listAdvertisers()
      setAdvertisers(advertisers.map((a: AdvertiserRow) => ({ id: a.id, name: a.name, batch: a.batch })))
    } catch {
      setAdvertisers([])
    }
  }, [])

  // Load advertisers whenever the signed-in user changes.
  useEffect(() => {
    if (me) reloadAdvertisers()
    else {
      setAdvertisers([])
      setCurrentId(null)
    }
  }, [me, reloadAdvertisers])

  // Load all data for the current advertiser.
  const loadData = useCallback(async (advId: string) => {
    setLoading(true)
    try {
      const d = await api.loadEntities(advId)
      setCampaigns(d.campaigns.map(mapCampaign))
      setIOs(d.ios.map(mapIO))
      setLineItems(d.lineItems.map(mapLI))
      setCreatives(d.creatives.map(mapCreative))
    } catch {
      setCampaigns([]); setIOs([]); setLineItems([]); setCreatives([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentId) loadData(currentId)
    else {
      setCampaigns([]); setIOs([]); setLineItems([]); setCreatives([])
    }
  }, [currentId, loadData])

  const selectAdvertiser = useCallback((id: string) => {
    localStorage.setItem(ADV_KEY, id)
    setCurrentId(id)
  }, [])

  const createAdvertiser = useCallback(async (name: string, batch?: string) => {
    try {
      const { advertiser } = await api.createAdvertiser(name, batch)
      setAdvertisers((prev) => [...prev, { id: advertiser.id, name: advertiser.name, batch: advertiser.batch }])
      return advertiser.id
    } catch {
      return null
    }
  }, [])

  const create = useCallback(async (type: string, fields: Record<string, any>, map: (r: any) => any, set: React.Dispatch<any>) => {
    if (!currentId) return null
    try {
      const { row } = await api.createEntity({ type, advertiser_id: currentId, ...fields })
      set((prev: any[]) => [...prev, map(row)])
      return row.id as string
    } catch {
      return null
    }
  }, [currentId])

  const addCampaign = useCallback((input: CampaignInput) =>
    create('campaign', input, mapCampaign, setCampaigns), [create])
  const addIO = useCallback((input: IOInput) =>
    create('io', input, mapIO, setIOs), [create])
  const addLineItem = useCallback((input: LIInput) =>
    create('line_item', input, mapLI, setLineItems), [create])
  const addCreative = useCallback((input: CreativeInput) =>
    create('creative', input, mapCreative, setCreatives), [create])

  const currentAdvertiser = advertisers.find((a) => a.id === currentId) ?? null

  const value: StoreApi = {
    state: { advertisers, currentAdvertiser, campaigns, ios, lineItems, creatives, loading },
    selectAdvertiser,
    reloadAdvertisers,
    createAdvertiser,
    addCampaign,
    addIO,
    addLineItem,
    addCreative,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
