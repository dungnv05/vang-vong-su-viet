import { deriveHeroStats } from './heroStats.ts'
import type { HeroTemplateLike, ItemLike } from './heroStats.ts'

export const CLOUD_SCHEMA_VERSION = 1
export const SUPPORTED_CLOUD_SCHEMAS: readonly number[] = [1]

export interface CloudHeroV1 {
  id: string
  name: string
  level: number
  stars: number
  slotIndex: number
  equippedItemIds: string[]
}

export interface CloudSaveV1 {
  schemaVersion: 1
  gold: number
  currentStageIndex: number
  maxUnlockedStage: number
  towerFloor: number
  maxTowerFloor: number
  worldBossTotalDamage: number
  pvpRank: number
  pvpScore: number
  rankLevel: number
  battleSpeed: number
  lastIdleClaimTime: number
  isMuted: boolean
  activeBeastId: string
  heroes: CloudHeroV1[]
  shards: Record<string, number>
}

export interface SaveSummary {
  currentStageIndex: number
  maxUnlockedStage: number
  maxTowerFloor: number
  rankLevel: number
  pvpScore: number
  gold: number
  heroCount: number
}

export interface LocalHeroLike {
  id: string
  name: string
  level: number
  stars: number
  slotIndex: number
  equippedItemIds: readonly string[]
  isEnemy?: boolean
}

export interface LocalStateLike {
  gold: number
  heroes: readonly LocalHeroLike[]
  shards: Record<string, number>
  currentStageIndex: number
  maxUnlockedStage: number
  towerFloor: number
  maxTowerFloor: number
  worldBossTotalDamage: number
  pvpRank: number
  pvpScore: number
  rankLevel: number
  activeBeastId: string
  lastIdleClaimTime?: number
  battleSpeed: number
  isMuted: boolean
}

export type RestoredHero = HeroTemplateLike &
  Record<string, unknown> & {
    id: string
    name: string
    level: number
    stars: number
    slotIndex: number
    equippedItemIds: string[]
    atk: number
    maxHp: number
    hp: number
    rage: number
    maxRage: number
  }

export interface RestoredState {
  gold: number
  currentStageIndex: number
  maxUnlockedStage: number
  towerFloor: number
  maxTowerFloor: number
  worldBossTotalDamage: number
  pvpRank: number
  pvpScore: number
  rankLevel: number
  battleSpeed: number
  lastIdleClaimTime: number
  isMuted: boolean
  activeBeastId: string
  heroes: RestoredHero[]
  inventory: readonly ItemLike[]
  shards: Record<string, number>
}

export type FromCloudResult =
  | { ok: true; state: RestoredState }
  | { ok: false; error: 'unsupported_schema' | 'unknown_catalog' }

export function toCloudSave(local: LocalStateLike, nowMs?: number): CloudSaveV1 {
  const battleSpeed =
    local.battleSpeed === 1 || local.battleSpeed === 2 || local.battleSpeed === 3
      ? local.battleSpeed
      : 1

  const rawIdleTime =
    typeof local.lastIdleClaimTime === 'number' && Number.isFinite(local.lastIdleClaimTime)
      ? local.lastIdleClaimTime
      : (nowMs ?? Date.now())

  const heroes: CloudHeroV1[] = []
  for (const h of local.heroes) {
    if (h.isEnemy === true) continue
    heroes.push({
      id: h.id,
      name: h.name.normalize('NFC'),
      level: h.level,
      stars: h.stars,
      slotIndex: h.slotIndex,
      equippedItemIds: [...h.equippedItemIds],
    })
  }

  const shards: Record<string, number> = {}
  for (const [key, count] of Object.entries(local.shards ?? {})) {
    shards[key.normalize('NFC')] = count
  }

  return {
    schemaVersion: 1,
    gold: local.gold,
    currentStageIndex: local.currentStageIndex,
    maxUnlockedStage: local.maxUnlockedStage,
    towerFloor: local.towerFloor,
    maxTowerFloor: local.maxTowerFloor,
    worldBossTotalDamage: local.worldBossTotalDamage,
    pvpRank: local.pvpRank,
    pvpScore: local.pvpScore,
    rankLevel: local.rankLevel,
    battleSpeed,
    lastIdleClaimTime: Math.trunc(rawIdleTime),
    isMuted: Boolean(local.isMuted),
    activeBeastId: local.activeBeastId,
    heroes,
    shards,
  }
}

export function summarizeSave(s: CloudSaveV1): SaveSummary {
  return {
    currentStageIndex: s.currentStageIndex,
    maxUnlockedStage: s.maxUnlockedStage,
    maxTowerFloor: s.maxTowerFloor,
    rankLevel: s.rankLevel,
    pvpScore: s.pvpScore,
    gold: s.gold,
    heroCount: s.heroes.length,
  }
}

export function isFreshLocal(
  local: LocalStateLike,
  starterHeroNames: readonly string[],
  starterStarsByName?: Readonly<Record<string, number>>,
): boolean {
  if (local.maxUnlockedStage !== 0) return false
  if (local.maxTowerFloor > 1) return false
  if (local.rankLevel > 1) return false

  const heroes = local.heroes.filter((h) => h.isEnemy !== true)
  if (heroes.length > starterHeroNames.length) return false

  const starterSet = new Set(starterHeroNames.map((n) => n.normalize('NFC')))
  for (const h of heroes) {
    const normName = h.name.normalize('NFC')
    if (!starterSet.has(normName)) return false
    if (h.level > 1) return false
    const maxStarterStars = starterStarsByName?.[normName] ?? 1
    if (h.stars > maxStarterStars) return false
  }

  return true
}

export function fromCloudSave(
  s: { schemaVersion?: unknown } & Partial<CloudSaveV1>,
  catalog: {
    heroTemplates: readonly (HeroTemplateLike & Record<string, unknown>)[]
    items: readonly ItemLike[]
  },
): FromCloudResult {
  if (typeof s.schemaVersion !== 'number' || !SUPPORTED_CLOUD_SCHEMAS.includes(s.schemaVersion)) {
    return { ok: false, error: 'unsupported_schema' }
  }

  const templateByName = new Map<string, HeroTemplateLike & Record<string, unknown>>()
  for (const t of catalog.heroTemplates) {
    templateByName.set(t.name.normalize('NFC'), t)
  }

  const itemIds = new Set<string>()
  for (const item of catalog.items) {
    itemIds.add(item.id)
  }

  const rebuiltHeroes: RestoredHero[] = []
  for (const h of s.heroes ?? []) {
    const normName = h.name.normalize('NFC')
    const template = templateByName.get(normName)
    if (!template) {
      return { ok: false, error: 'unknown_catalog' }
    }
    for (const itemId of h.equippedItemIds) {
      if (!itemIds.has(itemId)) {
        return { ok: false, error: 'unknown_catalog' }
      }
    }

    const { atk, maxHp } = deriveHeroStats(
      template,
      h.level,
      h.stars,
      h.equippedItemIds,
      catalog.items,
    )
    const maxRage = typeof template.maxRage === 'number' ? template.maxRage : 100

    rebuiltHeroes.push({
      ...template,
      id: h.id,
      name: normName,
      level: h.level,
      stars: h.stars,
      slotIndex: h.slotIndex,
      equippedItemIds: [...h.equippedItemIds],
      atk,
      maxHp,
      hp: maxHp,
      rage: 0,
      maxRage,
    })
  }

  const shards: Record<string, number> = {}
  for (const [key, count] of Object.entries(s.shards ?? {})) {
    shards[key.normalize('NFC')] = count
  }

  const battleSpeed =
    s.battleSpeed === 1 || s.battleSpeed === 2 || s.battleSpeed === 3 ? s.battleSpeed : 1

  return {
    ok: true,
    state: {
      gold: s.gold ?? 0,
      currentStageIndex: s.currentStageIndex ?? 0,
      maxUnlockedStage: s.maxUnlockedStage ?? 0,
      towerFloor: s.towerFloor ?? 1,
      maxTowerFloor: s.maxTowerFloor ?? 1,
      worldBossTotalDamage: s.worldBossTotalDamage ?? 0,
      pvpRank: s.pvpRank ?? 0,
      pvpScore: s.pvpScore ?? 0,
      rankLevel: s.rankLevel ?? 1,
      battleSpeed,
      lastIdleClaimTime: s.lastIdleClaimTime ?? 0,
      isMuted: s.isMuted ?? false,
      activeBeastId: s.activeBeastId ?? '',
      heroes: rebuiltHeroes,
      inventory: catalog.items,
      shards,
    },
  }
}
