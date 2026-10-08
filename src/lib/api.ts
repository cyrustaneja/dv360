/** Thin client for our serverless /api. Auth is via the httpOnly session cookie. */
import { toast } from '../components/ui/Toast'
import { startLoad, endLoad } from '../components/ui/LoadingBar'

export type Role = 'admin' | 'expert' | 'student'

export interface Me {
  sub: string
  email: string
  name: string
  role: Role
  batch: string | null
  course: string | null
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  startLoad()
  try {
    const res = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    })
    if (!res.ok) {
      let msg = `Request failed (${res.status})`
      try { msg = (await res.json()).error || msg } catch { /* ignore */ }
      throw new ApiError(msg, res.status)
    }
    return res.json() as Promise<T>
  } finally {
    endLoad()
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const api = {
  me: () => req<Me>('/api/me'),
  logout: () => fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }),

  listAdvertisers: (userId?: string) =>
    req<{ advertisers: AdvertiserRow[] }>(`/api/advertisers${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`),
  createAdvertiser: (name: string, batch?: string) =>
    req<{ advertiser: AdvertiserRow }>('/api/advertisers', {
      method: 'POST',
      body: JSON.stringify({ name, batch }),
    }),
  deleteAdvertiser: (id: string) =>
    req<{ ok: true }>(`/api/advertisers?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

  listStudents: () => req<{ students: Student[] }>('/api/students'),

  loadEntities: (advertiserId: string) =>
    req<EntitiesResponse>(`/api/entities?advertiser_id=${encodeURIComponent(advertiserId)}`),
  createEntity: (payload: Record<string, unknown> & { type: string; advertiser_id: string }) =>
    req<{ row: any }>('/api/entities', { method: 'POST', body: JSON.stringify(payload) }),
  updateEntity: async (payload: Record<string, unknown> & { type: string; id: string }) => {
    const r = await req<{ row: any }>('/api/entities', { method: 'PATCH', body: JSON.stringify(payload) })
    toast('Changes saved')
    return r
  },
  deleteEntity: (type: string, id: string) =>
    req<{ ok: true }>(`/api/entities?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

  uploadImage: (filename: string, contentType: string, dataBase64: string) =>
    req<{ url: string }>('/api/upload', { method: 'POST', body: JSON.stringify({ filename, contentType, dataBase64 }) }),

  history: (type: string, id: string) =>
    req<{ events: HistoryEvent[] }>(`/api/history?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`),
}

export interface HistoryEvent { action: string; actor: string; note: string | null; at: string }

export interface Student { id: string; email: string; name: string | null; batch: string | null; advertisers: number }

export interface AdvertiserRow { id: string; name: string; batch: string | null; user_id: string; owner_email?: string | null; owner_name?: string | null }
export interface EntitiesResponse {
  campaigns: any[]
  ios: any[]
  lineItems: any[]
  creatives: any[]
  templates: any[]
  audiences: any[]
}
