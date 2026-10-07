/**
 * Data layer backed by our serverless /api (which talks to the shared hub
 * Supabase with the service-role key). The app is scoped to a "current
 * advertiser"; selecting one loads its campaigns / IOs / line items / creatives.
 *
 * DB rows are mapped to the same TypeScript shapes the screens already use so
 * the UI layer barely changes.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, type AdvertiserRow, type Student } from './lib/api'
import { toast } from './components/ui/Toast'
import { useAuth } from './auth/AuthContext'

// Entity → DV360 "created" toast label.
const CREATED_LABEL: Record<string, string> = {
  campaign: 'Campaign created',
  io: 'Insertion order created',
  line_item: 'Line item created',
  creative: 'Creative created',
  targeting_template: 'Targeting template created',
  audience: 'Audience created',
}
import type { Campaign, Creative, InsertionOrder, LineItem } from './data/mock'

export interface Advertiser {
  id: string
  name: string
  batch: string | null
  owner_email?: string | null
  owner_name?: string | null
}

export type EntityType = 'campaign' | 'io' | 'line_item' | 'creative' | 'targeting_template' | 'audience'

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
    image_url: r.settings?.image_url ?? null,
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
  /** Raw DB rows (full fields incl. settings) for prefilling edit forms. */
  raw: { campaigns: any[]; ios: any[]; lineItems: any[]; creatives: any[]; templates: any[]; audiences: any[] }
  /** Staff only: list of students for the Expert "view any student" feature. */
  students: Student[]
  /** Staff only: when set, advertiser list is scoped to this student. */
  viewingStudentId: string | null
  loading: boolean
}

export interface TemplateInput {
  name: string
  li_type?: string
  targeting?: Record<string, unknown>
  settings?: Record<string, unknown>
}

export interface AudienceInput {
  name: string
  audience_type?: string
  source?: string
  settings?: Record<string, unknown>
}

interface StoreApi {
  state: StoreState
  selectAdvertiser: (id: string) => void
  reloadAdvertisers: () => Promise<void>
  createAdvertiser: (name: string, batch?: string) => Promise<string | null>
  addCampaign: (input: CampaignInput) => Promise<string | null>
  updateCampaign: (id: string, input: CampaignInput) => Promise<boolean>
  addIO: (input: IOInput) => Promise<string | null>
  updateIO: (id: string, input: IOInput) => Promise<boolean>
  addLineItem: (input: LIInput) => Promise<string | null>
  updateLineItem: (id: string, input: LIInput) => Promise<boolean>
  addCreative: (input: CreativeInput) => Promise<string | null>
  updateCreative: (id: string, input: CreativeInput) => Promise<boolean>
  addTemplate: (input: TemplateInput) => Promise<string | null>
  updateTemplate: (id: string, input: TemplateInput) => Promise<boolean>
  addAudience: (input: AudienceInput) => Promise<string | null>
  updateAudience: (id: string, input: AudienceInput) => Promise<boolean>
  loadStudents: () => Promise<void>
  setViewingStudent: (id: string | null) => void
  deleteEntity: (type: EntityType, id: string) => Promise<boolean>
  deleteAdvertiser: (id: string) => Promise<boolean>
}

export interface CampaignInput {
  name: string
  goal?: string
  kpi_goal?: string
  budget?: string
  planned_spend?: string
  start_date?: string
  end_date?: string
  status?: string
  settings?: Record<string, unknown>
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
  status?: string
  settings?: Record<string, unknown>
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
  status?: string
  settings?: Record<string, unknown>
}
export interface CreativeInput {
  name: string
  dimensions?: string
  creative_type?: string
  click_url?: string
  accent?: string
  settings?: Record<string, unknown>
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
  const [raw, setRaw] = useState<StoreState['raw']>({ campaigns: [], ios: [], lineItems: [], creatives: [], templates: [], audiences: [] })
  const [students, setStudents] = useState<Student[]>([])
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reloadAdvertisers = useCallback(async (studentId?: string | null) => {
    try {
      const { advertisers } = await api.listAdvertisers(studentId ?? undefined)
      setAdvertisers(advertisers.map((a: AdvertiserRow) => ({
        id: a.id, name: a.name, batch: a.batch, owner_email: a.owner_email, owner_name: a.owner_name,
      })))
    } catch {
      setAdvertisers([])
    }
  }, [])

  const loadStudents = useCallback(async () => {
    try {
      const { students } = await api.listStudents()
      setStudents(students)
    } catch {
      setStudents([])
    }
  }, [])

  const setViewingStudent = useCallback((id: string | null) => {
    setViewingStudentId(id)
    reloadAdvertisers(id)
  }, [reloadAdvertisers])

  const deleteEntity = useCallback(async (type: EntityType, id: string) => {
    try {
      await api.deleteEntity(type, id)
      const key = ({ campaign: 'campaigns', io: 'ios', line_item: 'lineItems', creative: 'creatives', targeting_template: 'templates', audience: 'audiences' } as const)[type]
      setRaw((prev) => ({ ...prev, [key]: prev[key].filter((r: any) => r.id !== id) }))
      if (type === 'campaign') setCampaigns((p) => p.filter((x) => x.id !== id))
      if (type === 'io') setIOs((p) => p.filter((x) => x.id !== id))
      if (type === 'line_item') setLineItems((p) => p.filter((x) => x.id !== id))
      if (type === 'creative') setCreatives((p) => p.filter((x) => x.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  const deleteAdvertiser = useCallback(async (id: string) => {
    try {
      await api.deleteAdvertiser(id)
      setAdvertisers((prev) => prev.filter((a) => a.id !== id))
      return true
    } catch {
      return false
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
      setRaw({ campaigns: d.campaigns, ios: d.ios, lineItems: d.lineItems, creatives: d.creatives, templates: d.templates ?? [], audiences: d.audiences ?? [] })
    } catch {
      setCampaigns([]); setIOs([]); setLineItems([]); setCreatives([])
      setRaw({ campaigns: [], ios: [], lineItems: [], creatives: [], templates: [], audiences: [] })
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

  const create = useCallback(async (type: string, fields: Record<string, any>, map: (r: any) => any, set: React.Dispatch<any>, rawKey: keyof StoreState['raw']) => {
    if (!currentId) return null
    try {
      const { row } = await api.createEntity({ type, advertiser_id: currentId, ...fields })
      set((prev: any[]) => [...prev, map(row)])
      setRaw((prev) => ({ ...prev, [rawKey]: [...prev[rawKey], row] }))
      if (CREATED_LABEL[type]) toast(CREATED_LABEL[type])
      return row.id as string
    } catch {
      return null
    }
  }, [currentId])

  const addCampaign = useCallback((input: CampaignInput) =>
    create('campaign', input, mapCampaign, setCampaigns, 'campaigns'), [create])

  const updateCampaign = useCallback(async (id: string, input: CampaignInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'campaign', id, ...input })
      setCampaigns((prev) => prev.map((c) => (c.id === id ? mapCampaign(row) : c)))
      setRaw((prev) => ({ ...prev, campaigns: prev.campaigns.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])
  const addIO = useCallback((input: IOInput) =>
    create('io', input, mapIO, setIOs, 'ios'), [create])

  const updateIO = useCallback(async (id: string, input: IOInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'io', id, ...input })
      setIOs((prev) => prev.map((x) => (x.id === id ? mapIO(row) : x)))
      setRaw((prev) => ({ ...prev, ios: prev.ios.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])
  const addLineItem = useCallback((input: LIInput) =>
    create('line_item', input, mapLI, setLineItems, 'lineItems'), [create])

  const updateLineItem = useCallback(async (id: string, input: LIInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'line_item', id, ...input })
      setLineItems((prev) => prev.map((x) => (x.id === id ? mapLI(row) : x)))
      setRaw((prev) => ({ ...prev, lineItems: prev.lineItems.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])
  const addCreative = useCallback((input: CreativeInput) =>
    create('creative', input, mapCreative, setCreatives, 'creatives'), [create])

  const updateCreative = useCallback(async (id: string, input: CreativeInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'creative', id, ...input })
      setCreatives((prev) => prev.map((x) => (x.id === id ? mapCreative(row) : x)))
      setRaw((prev) => ({ ...prev, creatives: prev.creatives.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])

  const addTemplate = useCallback(async (input: TemplateInput) => {
    if (!currentId) return null
    try {
      const { row } = await api.createEntity({ type: 'targeting_template', advertiser_id: currentId, ...input })
      setRaw((prev) => ({ ...prev, templates: [...prev.templates, row] }))
      toast(CREATED_LABEL.targeting_template)
      return row.id as string
    } catch {
      return null
    }
  }, [currentId])

  const updateTemplate = useCallback(async (id: string, input: TemplateInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'targeting_template', id, ...input })
      setRaw((prev) => ({ ...prev, templates: prev.templates.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])

  const addAudience = useCallback(async (input: AudienceInput) => {
    if (!currentId) return null
    try {
      const { row } = await api.createEntity({ type: 'audience', advertiser_id: currentId, ...input })
      setRaw((prev) => ({ ...prev, audiences: [...prev.audiences, row] }))
      toast(CREATED_LABEL.audience)
      return row.id as string
    } catch {
      return null
    }
  }, [currentId])

  const updateAudience = useCallback(async (id: string, input: AudienceInput) => {
    try {
      const { row } = await api.updateEntity({ type: 'audience', id, ...input })
      setRaw((prev) => ({ ...prev, audiences: prev.audiences.map((r) => (r.id === id ? row : r)) }))
      return true
    } catch {
      return false
    }
  }, [])

  const currentAdvertiser = advertisers.find((a) => a.id === currentId) ?? null

  const value: StoreApi = {
    state: { advertisers, currentAdvertiser, campaigns, ios, lineItems, creatives, raw, students, viewingStudentId, loading },
    selectAdvertiser,
    reloadAdvertisers,
    createAdvertiser,
    addCampaign,
    updateCampaign,
    addIO,
    updateIO,
    addLineItem,
    updateLineItem,
    addCreative,
    updateCreative,
    addTemplate,
    updateTemplate,
    addAudience,
    updateAudience,
    loadStudents,
    setViewingStudent,
    deleteEntity,
    deleteAdvertiser,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
