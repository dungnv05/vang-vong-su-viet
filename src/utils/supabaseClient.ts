import { createClient, type User } from '@supabase/supabase-js'

/**
 * Utility for Wildcard Cookie Management & Supabase Client Config across *.yundev.space
 */
const COOKIE_DOMAIN = typeof window !== 'undefined' && window.location.hostname.includes('yundev.space') ? '.yundev.space' : ''

export function setSharedCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  const domainAttr = COOKIE_DOMAIN ? `; Domain=${COOKIE_DOMAIN}` : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainAttr}; SameSite=Lax; Secure`
}

export function getSharedCookie(name: string) {
  if (typeof document === 'undefined') return ''
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r
  }, '')
}

export function removeSharedCookie(name: string) {
  const domainAttr = COOKIE_DOMAIN ? `; Domain=${COOKIE_DOMAIN}` : ''
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// Hybrid Shared Cookie Storage Adapter for Wildcard SSO (*.yundev.space)
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null
    const cookieVal = getSharedCookie(key)
    if (cookieVal) return cookieVal
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null
  },
  setItem: (key: string, value: string): void => {
    setSharedCookie(key, value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string): void => {
    removeSharedCookie(key)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
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

// Initialize Supabase Client with Wildcard SSO token storage across *.yundev.space
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'yundev_supabase_auth_token',
      storage: cookieStorage
    }
  }
)

// Auth Helpers
export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
}

export async function signInWithEmail(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({ email, password })
  if (res.data?.session) {
    setSharedCookie('yundev_session', res.data.session.access_token)
    setSharedCookie('yundev_supabase_auth_token', JSON.stringify(res.data.session))
    if (typeof window !== 'undefined') {
      localStorage.setItem('yundev_session', res.data.session.access_token)
      localStorage.setItem('yundev_supabase_auth_token', JSON.stringify(res.data.session))
    }
  }
  return res
}

export async function signOutUser() {
  removeSharedCookie('yundev_session')
  removeSharedCookie('yundev_supabase_auth_token')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('yundev_session')
    localStorage.removeItem('yundev_supabase_auth_token')
  }
  return await supabase.auth.signOut()
}

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

// Export helper function to synchronize wildcard session across yundev.space
export async function syncSharedSSOSession(): Promise<User | null> {
  if (typeof window === 'undefined') return null

  const sharedSessionCookie = getSharedCookie('yundev_supabase_auth_token')
  const sharedAccessToken = getSharedCookie('yundev_session')
  const { data: { session: currentSession } } = await supabase.auth.getSession()

  // 1. If yundev.space has NO shared session cookie, but game currently has an active session -> User logged out on yundev.space!
  if (!sharedSessionCookie && !sharedAccessToken && currentSession) {
    console.log('[SSO Sync] Detected logout on yundev.space. Logging out of game...')
    await signOutUser()
    return null
  }

  // 2. If yundev.space HAS a shared session cookie, but game currently has no active session or session token differs -> User logged in on yundev.space!
  if (sharedSessionCookie) {
    try {
      const parsedSession = JSON.parse(sharedSessionCookie)
      if (parsedSession && parsedSession.access_token) {
        if (!currentSession || currentSession.access_token !== parsedSession.access_token) {
          console.log('[SSO Sync] Detected new login on yundev.space. Synchronizing session into game...')
          const { data, error } = await supabase.auth.setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token || ''
          })
          if (!error && data.session) {
            return data.session.user
          }
        }
      }
    } catch (err) {
      console.warn('[SSO Sync Parsing Error]:', err)
    }
  }

  return currentSession?.user || null
}

// Cloud Database & SSO Synchronized Player Profile Service
class CloudDatabaseService {
  private isConnected: boolean = true
  private currentUser: User | null = null
  private guestId: string = localStorage.getItem('yundev_guest_id') || ('player_' + Math.floor(Math.random() * 100000))

  constructor() {
    if (typeof window !== 'undefined' && !localStorage.getItem('yundev_guest_id')) {
      localStorage.setItem('yundev_guest_id', this.guestId)
    }
    this.initAuthListener()
  }

  private initAuthListener() {
    if (typeof window !== 'undefined') {
      // Sync immediately on startup
      syncSharedSSOSession().then(user => {
        this.currentUser = user
      })

      // Sync when tab regains focus or visibility changes
      window.addEventListener('focus', () => {
        syncSharedSSOSession().then(user => { this.currentUser = user })
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncSharedSSOSession().then(user => { this.currentUser = user })
        }
      })

      // Sync when storage event fires (cross-tab)
      window.addEventListener('storage', (e) => {
        if (e.key === 'yundev_session' || e.key === 'yundev_supabase_auth_token') {
          syncSharedSSOSession().then(user => { this.currentUser = user })
        }
      })

      // Periodic check every 2.5 seconds
      setInterval(() => {
        syncSharedSSOSession().then(user => { this.currentUser = user })
      }, 2500)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser = session?.user || null
      if (session) {
        setSharedCookie('yundev_session', session.access_token)
        setSharedCookie('yundev_supabase_auth_token', JSON.stringify(session))
      }
    })

    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null
      if (session) {
        setSharedCookie('yundev_session', session.access_token)
        setSharedCookie('yundev_supabase_auth_token', JSON.stringify(session))
        if (typeof window !== 'undefined') {
          localStorage.setItem('yundev_session', session.access_token)
          localStorage.setItem('yundev_supabase_auth_token', JSON.stringify(session))
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        removeSharedCookie('yundev_session')
        removeSharedCookie('yundev_supabase_auth_token')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('yundev_session')
          localStorage.removeItem('yundev_supabase_auth_token')
        }
      }
    })
  }

  public getCurrentUser(): User | null {
    return this.currentUser
  }

  public getPlayerId(): string {
    return this.currentUser ? this.currentUser.id : this.guestId
  }

  public getPlayerName(): string {
    if (this.currentUser) {
      return this.currentUser.email || ('Anh Hùng #' + this.currentUser.id.slice(-4))
    }
    return 'Anh Hùng Sử Việt #' + this.guestId.slice(-4)
  }

  public getIsConnected(): boolean {
    return this.isConnected
  }

  // Tải dữ liệu tiến trình từ Supabase Cloud
  public async fetchCloudProfile(): Promise<CloudPlayerProfile | null> {
    if (!isSupabaseConfigured) return null
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
    if (!isSupabaseConfigured) return false
    try {
      const playerId = this.getPlayerId()
      const playerName = this.getPlayerName()

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
  public async fetchLeaderboard(): Promise<any[]> {
    if (!isSupabaseConfigured) return []
    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .order('max_unlocked_stage', { ascending: false })
        .limit(10)

      if (error || !data) {
        // Fallback fallback order by gold
        const fallback = await supabase
          .from('player_profiles')
          .select('*')
          .order('gold', { ascending: false })
          .limit(10)
        return fallback.data || []
      }
      return data
    } catch {
      return []
    }
  }
}

export const cloudService = new CloudDatabaseService()
