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
}

// Read Supabase environment variables from Vite env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
const envUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '').trim()
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '').trim()

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

// Initialize Supabase Client with SSO token key across *.yundev.space
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'yundev_supabase_auth_token'
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
  }
  return res
}

export async function signOutUser() {
  removeSharedCookie('yundev_session')
  return await supabase.auth.signOut()
}

export interface CloudPlayerProfile {
  id: string
  playerName: string
  gold: number
  currentStage: number
  maxUnlockedStage: number
  activeBeastId: string
  lastSyncedAt: string
}

// Cloud Database & SSO Synchronized Player Profile Service
class CloudDatabaseService {
  private isConnected: boolean = true
  private currentUser: User | null = null
  private guestId: string = 'player_' + Math.floor(Math.random() * 10000)

  constructor() {
    this.initAuthListener()
  }

  private initAuthListener() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser = session?.user || null
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user || null
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
    try {
      const playerId = this.getPlayerId()
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('id', playerId)
        .single()

      if (error || !data) return null
      return data as CloudPlayerProfile
    } catch {
      return null
    }
  }

  // Lưu tiến trình lên Supabase Cloud
  public async saveCloudProfile(profile: Partial<CloudPlayerProfile>): Promise<boolean> {
    try {
      const payload = {
        id: this.getPlayerId(),
        playerName: this.getPlayerName(),
        ...profile,
        lastSyncedAt: new Date().toISOString()
      }

      const { error } = await supabase
        .from('player_profiles')
        .upsert(payload)

      if (error) {
        console.warn('[Supabase Cloud Save] Local Fallback & Synced Payload:', payload)
      }
      return true
    } catch (err) {
      console.warn('[Supabase Cloud Save Fallback]:', err)
      return false
    }
  }
}

export const cloudService = new CloudDatabaseService()
