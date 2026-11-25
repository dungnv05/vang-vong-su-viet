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

function readCsrfCookie(): string {
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

export interface CloudPlayerProfile {
  id: string
  playerName: string
  gold: number
  currentStageIndex: number
  maxUnlockedStage: number
  towerFloor: number
  maxTowerFloor: number
  pvpScore: number
  worldBossTotalDamage: number
  activeBeastId: string
  fullStateJson?: any
  lastSyncedAt?: string
}

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

  // Cloud save needs a server endpoint that uses the www session; the browser has no Supabase session after the move to www shared login.
  public isCloudSaveAvailable(): boolean {
    return false
  }

  // Tải dữ liệu tiến trình từ Supabase Cloud
  public async fetchCloudProfile(): Promise<CloudPlayerProfile | null> {
    if (!this.isCloudSaveAvailable() || !isSupabaseConfigured || !supabase) return null
    try {
      const playerId = this.getPlayerId()
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('id', playerId)
        .maybeSingle()

      if (error || !data) return null
      return {
        id: data.id,
        playerName: data.player_name || this.getPlayerName(),
        gold: Number(data.gold || 5000),
        currentStageIndex: Number(data.current_stage || 0),
        maxUnlockedStage: Number(data.max_unlocked_stage || 0),
        towerFloor: Number(data.tower_floor || 1),
        maxTowerFloor: Number(data.max_tower_floor || 1),
        pvpScore: Number(data.pvp_score || 1250),
        worldBossTotalDamage: Number(data.world_boss_total_damage || 0),
        activeBeastId: data.active_beast_id || 'beast_kim_quy',
        fullStateJson: data.full_state_json || null,
        lastSyncedAt: data.last_synced_at || new Date().toISOString()
      }
    } catch {
      return null
    }
  }

  // Lưu tiến trình đầy đủ lên Supabase Cloud
  public async saveCloudProfile(fullGameState: any): Promise<boolean> {
    if (!this.isCloudSaveAvailable() || !isSupabaseConfigured || !supabase) return false
    try {
      const playerId = this.getPlayerId()
      const playerName = this.getPublicPlayerName()

      const payload = {
        id: playerId,
        player_name: playerName,
        gold: fullGameState.gold || 5000,
        current_stage: fullGameState.currentStageIndex || 0,
        max_unlocked_stage: fullGameState.maxUnlockedStage || 0,
        tower_floor: fullGameState.towerFloor || 1,
        max_tower_floor: fullGameState.maxTowerFloor || 1,
        pvp_score: fullGameState.pvpScore || 1250,
        world_boss_total_damage: fullGameState.worldBossTotalDamage || 0,
        active_beast_id: fullGameState.activeBeastId || 'beast_kim_quy',
        full_state_json: fullGameState,
        last_synced_at: new Date().toISOString()
      }

      // 1. Upsert Profile
      const { error: profileErr } = await supabase
        .from('player_profiles')
        .upsert(payload, { onConflict: 'id' })

      if (profileErr) {
        console.warn('[Supabase Cloud Save Profile Warning]:', profileErr)
      }

      // 2. Upsert Heroes
      if (Array.isArray(fullGameState.heroes) && fullGameState.heroes.length > 0) {
        try {
          const heroRecords = fullGameState.heroes.map((h: any) => ({
            id: `${playerId}_${h.id}`,
            player_id: playerId,
            hero_name: h.name,
            rarity: h.rarity || 'SR',
            level: h.level || 1,
            stars: h.stars || 1,
            slot_index: h.slotIndex ?? -1,
            equipped_item_ids: h.equippedItemIds || []
          }))
          await supabase.from('player_heroes').upsert(heroRecords, { onConflict: 'id' })
        } catch (heroErr) {
          console.warn('[Supabase Cloud Save Heroes Warning]:', heroErr)
        }
      }

      // 3. Upsert Shards
      if (fullGameState.shards && typeof fullGameState.shards === 'object') {
        try {
          const shardRecords = Object.entries(fullGameState.shards).map(([heroName, count]) => ({
            player_id: playerId,
            hero_name: heroName,
            count: count
          }))
          if (shardRecords.length > 0) {
            await supabase.from('player_shards').upsert(shardRecords, { onConflict: 'player_id,hero_name' })
          }
        } catch (shardErr) {
          console.warn('[Supabase Cloud Save Shards Warning]:', shardErr)
        }
      }

      return true
    } catch (err) {
      console.warn('[Supabase Cloud Save Exception]:', err)
      return false
    }
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
