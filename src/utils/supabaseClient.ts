import { createClient } from '@supabase/supabase-js'

export const WWW_ORIGIN = 'https://www.yundev.space'
export const WWW_ACCOUNT_URL = 'https://www.yundev.space/'

export interface WwwUser {
  id: string
  email: string | null
  displayName: string
}

export async function fetchWwwUser(): Promise<WwwUser | null> {
  try {
    const res = await fetch(`${WWW_ORIGIN}/api/auth/me`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })
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

// Local development fallbacks if environment variables are not set
const LOCAL_FALLBACK_URL = 'http://localhost:54321'
const LOCAL_FALLBACK_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export const SUPABASE_CONFIG = {
  url: envUrl || LOCAL_FALLBACK_URL,
  anonKey: envAnonKey || LOCAL_FALLBACK_KEY
}

// Helper flag to check if custom environment variables are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  !envUrl.includes('your-project') &&
  !envUrl.includes('localhost')
)

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log(`[Supabase Status] 🟢 Connected to Cloud Supabase: ${SUPABASE_CONFIG.url}`)
  } else {
    console.warn(`[Supabase Status] 🟡 Using Local Fallback (${SUPABASE_CONFIG.url}). Reason: VITE_PUBLIC_SUPABASE_URL environment variable was not baked into Vite build.`)
  }
}

// Initialize anon-only Supabase Client (public leaderboard view read)
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

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
    if (!this.isCloudSaveAvailable() || !isSupabaseConfigured) return null
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
    if (!this.isCloudSaveAvailable() || !isSupabaseConfigured) return false
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
    if (!isSupabaseConfigured) return []
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
