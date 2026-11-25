import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const WWW_ORIGIN = 'https://www.yundev.space'
export const WWW_ACCOUNT_URL = 'https://www.yundev.space/'

const LEGACY_CLEANUP_FLAG = 'vv_legacy_auth_cleanup_v1'
const LEGACY_AUTH_KEYS = ['yundev_session', 'yundev_supabase_auth_token'] as const

export function clearLegacyAuthStorageOnce(): void {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(LEGACY_CLEANUP_FLAG) === '1') return
    const hostname = window.location?.hostname || ''
    const isYundevDomain = hostname === 'yundev.space' || hostname.endsWith('.yundev.space')
    for (const key of LEGACY_AUTH_KEYS) {
      localStorage.removeItem(key)
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      if (isYundevDomain) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Domain=.yundev.space`
      }
    }
    localStorage.setItem(LEGACY_CLEANUP_FLAG, '1')
  } catch {
    // Ignore restricted storage environments
  }
}

type RefreshOutcome = 'ok' | 'retry' | 'failed'
const REFRESH_SLOT_KEY = Symbol.for('yundev.auth.refresh.v1')
const RECENT_OK_MS = 2000

interface RefreshSlot {
  inFlight: Promise<RefreshOutcome> | null
  lastOkAt: number
}

function getRefreshSlot(): RefreshSlot {
  const store = globalThis as unknown as Record<symbol, RefreshSlot | undefined>
  let slot = store[REFRESH_SLOT_KEY]
  if (!slot) {
    slot = { inFlight: null, lastOkAt: Number.NEGATIVE_INFINITY }
    store[REFRESH_SLOT_KEY] = slot
  }
  return slot
}

export function readCsrfCookie(): string {
  if (typeof document === 'undefined') return ''
  try {
    const raw = document.cookie
    if (!raw) return ''
    for (const part of raw.split(';')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      if (trimmed.slice(0, eqIdx).trim() !== 'csrf') continue
      const val = trimmed.slice(eqIdx + 1).trim()
      try {
        return decodeURIComponent(val)
      } catch {
        return val
      }
    }
    return ''
  } catch {
    return ''
  }
}

export function sharedRefresh(): Promise<RefreshOutcome> {
  const slot = getRefreshSlot()
  if (Date.now() - slot.lastOkAt < RECENT_OK_MS) {
    return Promise.resolve('ok')
  }
  if (slot.inFlight) {
    return slot.inFlight
  }
  const csrf = readCsrfCookie()
  if (!csrf) {
    return Promise.resolve('failed')
  }
  slot.inFlight = (async (): Promise<RefreshOutcome> => {
    try {
      const res = await fetch(`${WWW_ORIGIN}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-csrf-token': csrf }
      })
      if (res.status === 200) {
        slot.lastOkAt = Date.now()
        return 'ok'
      }
      if (res.status === 409) {
        return 'retry'
      }
      return 'failed'
    } catch {
      return 'failed'
    } finally {
      slot.inFlight = null
    }
  })()
  return slot.inFlight
}

export interface WwwUser {
  id: string
  email: string | null
  displayName: string
}

async function parseWwwUserResponse(res: Response): Promise<WwwUser | null> {
  if (!res.ok) return null
  const data: unknown = await res.json()
  if (!data || typeof data !== 'object') return null
  const record = data as { ok?: unknown; user?: unknown }
  if (record.ok !== true || !record.user || typeof record.user !== 'object') return null
  const u = record.user as {
    id?: unknown
    email?: unknown
    user_metadata?: { full_name?: unknown; name?: unknown } | null
  }
  if (typeof u.id !== 'string' || u.id.trim().length === 0) return null
  const email = typeof u.email === 'string' && u.email.trim().length > 0 ? u.email.trim() : null
  const meta = u.user_metadata && typeof u.user_metadata === 'object' ? u.user_metadata : null
  const fullName = meta && typeof meta.full_name === 'string' && meta.full_name.trim().length > 0
    ? meta.full_name.trim()
    : ''
  const metaName = meta && typeof meta.name === 'string' && meta.name.trim().length > 0
    ? meta.name.trim()
    : ''
  const emailLocal = email ? email.split('@')[0]?.trim() || '' : ''
  const displayName = fullName || metaName || emailLocal || 'Anh Hùng'
  return {
    id: u.id,
    email,
    displayName
  }
}

export async function fetchWwwUser(): Promise<WwwUser | null> {
  try {
    const meInit: RequestInit = {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    }
    let res = await fetch(`${WWW_ORIGIN}/api/auth/me`, meInit)
    if (res.status === 401 && readCsrfCookie()) {
      const outcome = await sharedRefresh()
      if (outcome === 'ok') {
        res = await fetch(`${WWW_ORIGIN}/api/auth/me`, meInit)
      } else if (outcome === 'retry') {
        await new Promise<void>(resolve => setTimeout(resolve, 400))
        res = await fetch(`${WWW_ORIGIN}/api/auth/me`, meInit)
      } else {
        return null
      }
    }
    return await parseWwwUserResponse(res)
  } catch {
    return null
  }
}

export function wwwAuthUrl(mode: 'signin' | 'signup'): string {
  const nextUrl = typeof window !== 'undefined' ? window.location.href : ''
  return `${WWW_ORIGIN}/?auth=${mode}&next=${encodeURIComponent(nextUrl)}`
}

// Read Supabase environment variables from Vite env (supports VITE_PUBLIC_SUPABASE_URL & VITE_PUBLIC_SUPABASE_ANON_KEY)
const envUrl = (
  import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''
).trim()

const envAnonKey = (
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''
).trim()

// Helper flag to check if custom environment variables are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  envUrl.startsWith('https://') &&
  !envUrl.includes('your-project')
)

if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.warn('[Supabase] not configured: leaderboard disabled')
}

// Initialize anon-only Supabase Client (public leaderboard view read)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(envUrl, envAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null

export interface LeaderboardEntry {
  rank: number
  display_name: string
  max_unlocked_stage: number
  pvp_score: number
}

// Cloud Database & YunDev Shared Login Player Profile Service
class CloudDatabaseService {
  private isConnected: boolean = true
  private currentUser: WwwUser | null = null
  private guestId: string = (typeof window !== 'undefined' && localStorage.getItem('yundev_guest_id')) || ('player_' + Math.floor(Math.random() * 100000))

  constructor() {
    if (typeof window !== 'undefined' && !localStorage.getItem('yundev_guest_id')) {
      localStorage.setItem('yundev_guest_id', this.guestId)
    }
  }

  public setCurrentUser(u: WwwUser | null): void {
    this.currentUser = u
  }

  public getCurrentUser(): WwwUser | null {
    return this.currentUser
  }

  public getPlayerId(): string {
    return this.currentUser ? this.currentUser.id : this.guestId
  }

  public getPlayerName(): string {
    if (this.currentUser) {
      return this.currentUser.displayName || ('Anh Hùng #' + this.currentUser.id.slice(-4))
    }
    return 'Anh Hùng Sử Việt #' + this.guestId.slice(-4)
  }

  // Name stored in player_profiles.player_name and shown on the leaderboard.
  // Never the email (S-11).
  public getPublicPlayerName(): string {
    if (this.currentUser) {
      return 'Anh Hùng #' + this.currentUser.id.slice(-4)
    }
    return 'Anh Hùng Sử Việt #' + this.guestId.slice(-4)
  }

  public getIsConnected(): boolean {
    return this.isConnected
  }

  public isCloudSaveAvailable(): boolean {
    return this.currentUser !== null
  }

  // Tải Bảng Xếp Hạng Top Cao Thủ từ Supabase Cloud
  // Reads the public.vang_vong_leaderboard view (S-11): only rank, display name,
  // stage and PvP score. Raw player_profiles rows are owner-only under RLS.
  public async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured || !supabase) return []
    try {
      const { data, error } = await supabase
        .from('vang_vong_leaderboard')
        .select('rank, display_name, max_unlocked_stage, pvp_score')
        .order('rank', { ascending: true })
        .limit(10)

      if (error || !data) return []
      return data as LeaderboardEntry[]
    } catch {
      return []
    }
  }
}

export const cloudService = new CloudDatabaseService()
