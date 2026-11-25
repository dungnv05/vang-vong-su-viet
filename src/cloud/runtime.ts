import { createCloudApi } from './cloudApi.ts'
import type { HeroTemplateLike } from './heroStats.ts'
import type { LocalStateLike, RestoredState } from './saveFormat.ts'
import { createSyncController, type SyncController } from './syncController.ts'
import { SYNC_KEY } from './syncState.ts'
import { readCsrfCookie, sharedRefresh } from '../utils/supabaseClient'
import { MOCK_HEROES } from '../data/heroes'
import { GACHA_HERO_POOL } from '../data/gachaPool'
import { MOCK_ITEMS } from '../data/items'

let controller: SyncController | null = null
let boundGetLocal: (() => LocalStateLike) | null = null
let boundApplyRestored: ((s: RestoredState) => void) | null = null
let boundReloadLocal: (() => void) | undefined

function buildHeroTemplates(): (HeroTemplateLike & Record<string, unknown>)[] {
  const seen = new Set<string>()
  const result: (HeroTemplateLike & Record<string, unknown>)[] = []
  for (const hero of [...MOCK_HEROES, ...GACHA_HERO_POOL]) {
    if (seen.has(hero.name)) continue
    seen.add(hero.name)
    result.push(hero as unknown as HeroTemplateLike & Record<string, unknown>)
  }
  return result
}

export function bindStore(
  getLocal: () => LocalStateLike,
  applyRestored: (s: RestoredState) => void,
  reloadLocal?: () => void,
): void {
  boundGetLocal = getLocal
  boundApplyRestored = applyRestored
  boundReloadLocal = reloadLocal
}

export function getSyncController(): SyncController {
  if (controller) return controller
  if (!boundGetLocal || !boundApplyRestored) {
    throw new Error('Cloud sync store is not bound')
  }

  const getLocal = boundGetLocal
  const applyRestored = boundApplyRestored

  const api = createCloudApi({
    fetch: (...a) => globalThis.fetch(...a),
    readCsrf: readCsrfCookie,
    refresh: sharedRefresh,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  })

  const ctrl = createSyncController({
    api,
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    getLocal,
    applyRestored,
    reloadLocal: boundReloadLocal,
    catalog: {
      heroTemplates: buildHeroTemplates(),
      items: MOCK_ITEMS,
    },
    starters: MOCK_HEROES.map((h) => ({ name: h.name, level: h.level, stars: h.stars })),
    now: Date.now,
    setTimer: (fn, ms) => globalThis.setTimeout(fn, ms),
    clearTimer: (h) => globalThis.clearTimeout(h as ReturnType<typeof setTimeout>),
    locks:
      typeof navigator !== 'undefined' && navigator.locks
        ? { request: (n, cb) => navigator.locks.request(n, cb) }
        : undefined,
  })

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('pagehide', () => {
      ctrl.flushKeepalive()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        ctrl.flushKeepalive()
      }
    })
    window.addEventListener('storage', (e) => {
      if (e.key === SYNC_KEY) {
        ctrl.reloadFromStorage()
      }
    })
  }

  controller = ctrl
  return ctrl
}
