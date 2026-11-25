// Vendored verbatim from dungnv05/personal-portal src/yun-header/theme.ts @ ec6c943 (shared yundev theme: data-theme, yun-theme localStorage, yun_theme .yundev.space cookie, yh-theme-change). Do not edit here.
export type YunTheme = 'light' | 'dark'
export type YunThemeSource = 'init' | 'user' | 'system' | 'sync'

export interface YunThemeChangeDetail {
  theme: YunTheme
  source: YunThemeSource
}

export const THEME_STORAGE_KEY = 'yun-theme'
export const THEME_COOKIE = 'yun_theme'
export const THEME_EVENT = 'yh-theme-change'

const LEGACY_THEME_KEY = 'theme'

function isValidTheme(value: unknown): value is YunTheme {
  return value === 'light' || value === 'dark'
}

function readThemeCookie(): YunTheme | null {
  try {
    if (typeof document === 'undefined' || !document.cookie) {
      return null
    }
    let matched: YunTheme | null = null
    for (const segment of document.cookie.split(';')) {
      const eqIndex = segment.indexOf('=')
      if (eqIndex <= 0) {
        continue
      }
      const key = segment.slice(0, eqIndex).trim()
      if (key !== THEME_COOKIE) {
        continue
      }
      const rawValue = segment.slice(eqIndex + 1).trim()
      let decoded = rawValue
      try {
        decoded = decodeURIComponent(rawValue)
      } catch {
        decoded = rawValue
      }
      if (isValidTheme(decoded)) {
        matched = decoded
      }
    }
    return matched
  } catch {
    return null
  }
}

function readLocalStorageItem(key: string): YunTheme | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    const value = window.localStorage.getItem(key)
    return isValidTheme(value) ? value : null
  } catch {
    return null
  }
}

export function readStoredTheme(): YunTheme | null {
  return (
    readThemeCookie() ??
    readLocalStorageItem(THEME_STORAGE_KEY) ??
    readLocalStorageItem(LEGACY_THEME_KEY)
  )
}

export function systemTheme(): YunTheme {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'light'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function resolveTheme(): YunTheme {
  return readStoredTheme() ?? systemTheme()
}

export function applyTheme(theme: YunTheme, source: YunThemeSource): void {
  if (!isValidTheme(theme) || typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  const previous = root.dataset.theme
  root.dataset.theme = theme
  root.style.colorScheme = theme

  if (previous !== theme || source === 'init') {
    document.dispatchEvent(
      new CustomEvent<YunThemeChangeDetail>(THEME_EVENT, {
        detail: { theme, source },
        bubbles: true,
      }),
    )
  }
}

export function buildThemeCookie(theme: YunTheme, hostname: string, protocol: string): string {
  if (!isValidTheme(theme)) {
    throw new Error(`Invalid theme value: ${String(theme)}`)
  }
  const parts = [
    `${THEME_COOKIE}=${theme}`,
    'Path=/',
    'Max-Age=31536000',
    'SameSite=Lax',
  ]
  if (protocol === 'https:') {
    parts.push('Secure')
  }
  const host = hostname.toLowerCase()
  if (host === 'yundev.space' || host.endsWith('.yundev.space')) {
    parts.push('Domain=.yundev.space')
  }
  return parts.join('; ')
}

export function setTheme(theme: YunTheme): void {
  if (!isValidTheme(theme)) {
    return
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  } catch {
    // Ignore storage errors (e.g. Safari private mode)
  }
  try {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      document.cookie = buildThemeCookie(theme, window.location.hostname, window.location.protocol)
    }
  } catch {
    // Ignore cookie errors
  }
  applyTheme(theme, 'user')
}

let themeInitialized = false

export function initTheme(): void {
  applyTheme(resolveTheme(), 'init')

  if (themeInitialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  themeInitialized = true

  try {
    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const onMediaChange = () => {
        if (readStoredTheme() === null) {
          applyTheme(systemTheme(), 'system')
        }
      }
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onMediaChange)
      }
    }
  } catch {
    // Ignore matchMedia errors
  }

  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) {
      return
    }
    const next = isValidTheme(event.newValue) ? event.newValue : resolveTheme()
    applyTheme(next, 'sync')
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      return
    }
    const next = resolveTheme()
    if (document.documentElement.dataset.theme !== next) {
      applyTheme(next, 'sync')
    }
  })
}

export function __resetThemeInitForTests(): void {
  themeInitialized = false
}
