/** Thin client for our serverless /api. Auth is via the httpOnly session cookie. */

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

  listAdvertisers: () => req<{ advertisers: AdvertiserRow[] }>('/api/advertisers'),
  createAdvertiser: (name: string, batch?: string) =>
    req<{ advertiser: AdvertiserRow }>('/api/advertisers', {
      method: 'POST',
      body: JSON.stringify({ name, batch }),
    }),

  loadEntities: (advertiserId: string) =>
    req<EntitiesResponse>(`/api/entities?advertiser_id=${encodeURIComponent(advertiserId)}`),
  createEntity: (payload: Record<string, unknown> & { type: string; advertiser_id: string }) =>
    req<{ row: any }>('/api/entities', { method: 'POST', body: JSON.stringify(payload) }),
}

export interface AdvertiserRow { id: string; name: string; batch: string | null; user_id: string }
export interface EntitiesResponse {
  campaigns: any[]
  ios: any[]
  lineItems: any[]
  creatives: any[]
}
