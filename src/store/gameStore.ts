import { create } from 'zustand'
import { MOCK_HEROES, type HeroData, rehydrateHeroes } from '../data/heroes'
import { MOCK_ITEMS, type ItemData } from '../data/items'
import { CAMPAIGN_STAGES } from '../data/stages'
import { GACHA_HERO_POOL, type GachaHeroTemplate } from '../data/gachaPool'
import { getTowerFloorData } from '../data/towerData'
import { WORLD_BOSS_DATA } from '../data/worldBossData'
import { type PvPOpponent } from '../data/pvpData'
import { audioEngine } from '../utils/audioEngine'
import { cloudService } from '../utils/supabaseClient'

const SAVE_KEY = 'yundev_game_state'

export function loadLocalGameState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.heroes)) {
      parsed.heroes = rehydrateHeroes(parsed.heroes)
    }
    return parsed
  } catch {
    return null
  }
}

export function saveLocalGameState(state: any) {
  if (typeof window === 'undefined') return
  try {
    const dataToSave = {
      gold: state.gold,
      heroes: state.heroes,
      inventory: state.inventory,
      shards: state.shards,
      currentStageIndex: state.currentStageIndex,
      maxUnlockedStage: state.maxUnlockedStage,
      towerFloor: state.towerFloor,
      maxTowerFloor: state.maxTowerFloor,
      worldBossTotalDamage: state.worldBossTotalDamage,
      pvpRank: state.pvpRank,
      pvpScore: state.pvpScore,
      rankLevel: state.rankLevel,
      activeBeastId: state.activeBeastId,
      lastIdleClaimTime: state.lastIdleClaimTime
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave))
  } catch (err) {
    console.warn('Failed to save to localStorage:', err)
  }
}

const savedLocal = loadLocalGameState()

const triggerAutoCloudSave = () => {
  if (typeof window !== 'undefined') {
    const state = useGameStore.getState()
    saveLocalGameState(state)
    setTimeout(() => {
      cloudService.saveCloudProfile(useGameStore.getState())
    }, 300)
  }
}

interface GameState {
  heroes: HeroData[]
  enemies: HeroData[]
  inventory: ItemData[]
  shards: Record<string, number>
  gold: number
  turn: number
  currentScreen: 'LOBBY' | 'BATTLE'
  gameMode: 'CAMPAIGN' | 'TOWER' | 'WORLD_BOSS' | 'PVP'
  currentStageIndex: number
  maxUnlockedStage: number
  towerFloor: number
  maxTowerFloor: number
  worldBossTotalDamage: number
  pvpRank: number
  pvpScore: number
  rankLevel: number
  activeBeastId: string
  isMuted: boolean
  isAnimating: boolean
  battleSpeed: 1 | 2 | 3
  isAutoBattle: boolean
  draggingHeroId: string | null
  comboBanner: string | null
  selectedHeroId: string | null
  showVictoryModal: boolean
  showStageSelectModal: boolean
  showGachaModal: boolean
  showBeastModal: boolean
  showSquadModal: boolean
  showTowerModal: boolean
  showWorldBossModal: boolean
  showCodexModal: boolean
  showPvPModal: boolean
  showRankModal: boolean
  gachaResults: (GachaHeroTemplate & { id: string; isDuplicate?: boolean })[] | null
  activeAttackerId: string | null
  actionText: string | null
  showDefeatModal: boolean
  lastIdleClaimTime: number
  showIdleModal: boolean
  showCloudModal: boolean
  
  // Actions
  setCurrentScreen: (screen: 'LOBBY' | 'BATTLE') => void
  toggleMute: () => void
  toggleBattleSpeed: () => void
  toggleAutoBattle: () => void
  setDraggingHeroId: (id: string | null) => void
  setSelectedHeroId: (id: string | null) => void
  setShowStageSelectModal: (show: boolean) => void
  setShowVictoryModal: (show: boolean) => void
  setShowGachaModal: (show: boolean) => void
  setShowBeastModal: (show: boolean) => void
  setShowSquadModal: (show: boolean) => void
  setShowTowerModal: (show: boolean) => void
  setShowWorldBossModal: (show: boolean) => void
  setShowCodexModal: (show: boolean) => void
  setShowPvPModal: (show: boolean) => void
  setShowRankModal: (show: boolean) => void
  setShowDefeatModal: (show: boolean) => void
  setShowIdleModal: (show: boolean) => void
  setShowCloudModal: (show: boolean) => void
  getIdleRewards: () => { gold: number; shards: number; elapsedSec: number; goldRatePerSec: number }
  claimIdleRewards: () => { gold: number; shards: number }
  setRankLevel: (level: number) => void
  selectBeast: (beastId: string) => void
  deployHeroToSlot: (heroId: string, slotIndex: number) => void
  benchHero: (heroId: string) => void
  clearGachaResults: () => void
  updateHeroSlot: (heroId: string, newSlotIndex: number) => void
  levelUpHero: (heroId: string) => void
  starUpHero: (heroId: string) => void
  toggleEquipItem: (heroId: string, itemId: string) => void
  selectStage: (index: number) => void
  nextStage: () => void
  startTowerFloor: (floor: number) => void
  startWorldBossRaid: () => void
  startPvPChallenge: (opponent: PvPOpponent) => void
  pullGacha: (count: 1 | 10) => void
  importGameState: (cloudState: Partial<GameState>) => void
  executeTurn: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  heroes: savedLocal?.heroes || MOCK_HEROES,
  enemies: CAMPAIGN_STAGES[savedLocal?.currentStageIndex || 0]?.enemies || CAMPAIGN_STAGES[0].enemies,
  inventory: savedLocal?.inventory || MOCK_ITEMS,
  shards: savedLocal?.shards || { 'Lê Lợi': 20, 'Nguyễn Trãi': 10 },
  gold: savedLocal?.gold !== undefined ? savedLocal.gold : 5000,
  turn: 1,
  currentScreen: 'LOBBY',
  gameMode: 'CAMPAIGN',
  currentStageIndex: savedLocal?.currentStageIndex || 0,
  maxUnlockedStage: savedLocal?.maxUnlockedStage || 0,
  towerFloor: savedLocal?.towerFloor || 1,
  maxTowerFloor: savedLocal?.maxTowerFloor || 1,
  worldBossTotalDamage: savedLocal?.worldBossTotalDamage || 0,
  pvpRank: savedLocal?.pvpRank || 8,
  pvpScore: savedLocal?.pvpScore || 1250,
  rankLevel: savedLocal?.rankLevel || 1,
  activeBeastId: savedLocal?.activeBeastId || 'beast_kim_quy',
  isMuted: false,
  isAnimating: false,
  battleSpeed: 1,
  isAutoBattle: true,
  draggingHeroId: null,
  comboBanner: null,
  selectedHeroId: null,
  showVictoryModal: false,
  showStageSelectModal: false,
  showGachaModal: false,
  showBeastModal: false,
  showSquadModal: false,
  showTowerModal: false,
  showWorldBossModal: false,
  showCodexModal: false,
  showPvPModal: false,
  showRankModal: false,
  gachaResults: null,
  activeAttackerId: null,
  actionText: null,
  showDefeatModal: false,
  lastIdleClaimTime: savedLocal?.lastIdleClaimTime || (Date.now() - 3600 * 1000 * 2.5),
  showIdleModal: false,
  showCloudModal: false,

  setCurrentScreen: (screen) => {
    audioEngine.playClick()
    set((state) => {
      if (screen === 'LOBBY') {
        const stage = CAMPAIGN_STAGES[state.currentStageIndex]
        return {
          currentScreen: screen,
          isAnimating: false,
          activeAttackerId: null,
          comboBanner: null,
          actionText: null,
          turn: 1,
          heroes: state.heroes.map(h => ({ ...h, hp: h.maxHp, rage: 0 })),
          enemies: stage ? stage.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })) : state.enemies
        }
      }
      return { currentScreen: screen }
    })
  },

  toggleMute: () => set((state) => {
    const nextMuted = !state.isMuted
    audioEngine.setMuted(nextMuted)
    return { isMuted: nextMuted }
  }),

  toggleBattleSpeed: () => set((state) => {
    audioEngine.playClick()
    const nextSpeed = state.battleSpeed === 1 ? 2 : state.battleSpeed === 2 ? 3 : 1
    return { battleSpeed: nextSpeed }
  }),

  toggleAutoBattle: () => set((state) => {
    audioEngine.playClick()
    const nextAuto = !state.isAutoBattle
    
    if (nextAuto && !state.isAnimating && state.enemies.some(e => e.hp > 0)) {
      setTimeout(() => get().executeTurn(), 200)
    }

    return { isAutoBattle: nextAuto }
  }),

  setDraggingHeroId: (id) => set({ draggingHeroId: id }),
  setSelectedHeroId: (id) => {
    audioEngine.playClick()
    set({ selectedHeroId: id })
  },
  setShowStageSelectModal: (show) => {
    audioEngine.playClick()
    set({ showStageSelectModal: show })
  },
  setShowVictoryModal: (show) => set({ showVictoryModal: show }),
  setShowDefeatModal: (show) => set({ showDefeatModal: show }),
  setShowGachaModal: (show) => {
    audioEngine.playClick()
    set({ showGachaModal: show })
  },
  setShowBeastModal: (show) => {
    audioEngine.playClick()
    set({ showBeastModal: show })
  },
  setShowSquadModal: (show) => {
    audioEngine.playClick()
    set({ showSquadModal: show })
  },
  setShowTowerModal: (show) => {
    audioEngine.playClick()
    set({ showTowerModal: show })
  },
  setShowWorldBossModal: (show) => {
    audioEngine.playClick()
    set({ showWorldBossModal: show })
  },
  setShowCodexModal: (show) => {
    audioEngine.playClick()
    set({ showCodexModal: show })
  },
  setShowPvPModal: (show) => {
    audioEngine.playClick()
    set({ showPvPModal: show })
  },
  setShowRankModal: (show) => {
    audioEngine.playClick()
    set({ showRankModal: show })
  },
  setShowIdleModal: (show) => {
    audioEngine.playClick()
    set({ showIdleModal: show })
  },
  setShowCloudModal: (show) => {
    audioEngine.playClick()
    set({ showCloudModal: show })
  },

  getIdleRewards: () => {
    const st = get()
    const stage = (st.currentStageIndex || 0) + 1
    const lastClaim = st.lastIdleClaimTime || (Date.now() - 3600 * 1000 * 2.5)
    const goldRatePerSec = 5 + Math.floor(stage * 2.5)
    const maxSec = 12 * 3600
    const diff = Math.floor((Date.now() - lastClaim) / 1000)
    const elapsedSec = Math.min(maxSec, Math.max(0, isNaN(diff) ? 0 : diff))
    const gold = elapsedSec * goldRatePerSec
    const shards = Math.floor(elapsedSec / 1800)
    return { gold: gold || 0, shards: shards || 0, elapsedSec: elapsedSec || 0, goldRatePerSec }
  },

  claimIdleRewards: () => {
    const st = get()
    const { gold: pendingGold, shards: pendingShards } = st.getIdleRewards()
    if (pendingGold <= 0) return { gold: 0, shards: 0 }

    audioEngine.playEquipSFX()
    set({
      gold: st.gold + pendingGold,
      lastIdleClaimTime: Date.now(),
      showIdleModal: false
    })
    triggerAutoCloudSave()

    return { gold: pendingGold, shards: pendingShards }
  },

  setRankLevel: (level) => {
    audioEngine.playGachaPullSFX()
    set({ rankLevel: level })
  },

  selectBeast: (beastId) => {
    audioEngine.playClick()
    set({ activeBeastId: beastId, showBeastModal: false })
  },

  deployHeroToSlot: (heroId, slotIndex) => set((state) => {
    audioEngine.playClick()
    const existingOccupant = state.heroes.find(h => h.slotIndex === slotIndex && h.id !== heroId)
    const targetHero = state.heroes.find(h => h.id === heroId)
    if (!targetHero) return state

    const oldSlot = targetHero.slotIndex

    return {
      heroes: state.heroes.map(h => {
        if (h.id === heroId) return { ...h, slotIndex }
        if (existingOccupant && h.id === existingOccupant.id) return { ...h, slotIndex: oldSlot }
        return h
      })
    }
  }),

  benchHero: (heroId) => {
    audioEngine.playClick()
    set((state) => ({
      heroes: state.heroes.map(h => h.id === heroId ? { ...h, slotIndex: -1 } : h)
    }))
  },

  clearGachaResults: () => set({ gachaResults: null }),

  updateHeroSlot: (heroId, newSlotIndex) => set((state) => {
    const existingOccupant = state.heroes.find(h => h.slotIndex === newSlotIndex && h.id !== heroId)
    const currentHero = state.heroes.find(h => h.id === heroId)
    if (!currentHero) return state

    const oldSlotIndex = currentHero.slotIndex

    return {
      heroes: state.heroes.map(hero => {
        if (hero.id === heroId) {
          return { ...hero, slotIndex: newSlotIndex }
        }
        if (existingOccupant && hero.id === existingOccupant.id) {
          return { ...hero, slotIndex: oldSlotIndex }
        }
        return hero
      })
    }
  }),

  levelUpHero: (heroId) => set((state) => {
    const cost = 200
    if (state.gold < cost) return state

    audioEngine.playClick()
    return {
      gold: state.gold - cost,
      heroes: state.heroes.map(h => {
        if (h.id === heroId) {
          const newLevel = h.level + 1
          return {
            ...h,
            level: newLevel,
            atk: h.atk + 25,
            maxHp: h.maxHp + 150,
            hp: h.hp + 150
          }
        }
        return h
      })
    }
  }),

  starUpHero: (heroId) => set((state) => {
    const cost = 1000
    const hero = state.heroes.find(h => h.id === heroId)
    if (!hero || state.gold < cost || hero.stars >= 5) return state

    const currentShards = state.shards[hero.name] || 0
    const requiredShards = hero.stars * 20
    if (currentShards < requiredShards) return state

    audioEngine.playGachaPullSFX()
    return {
      gold: state.gold - cost,
      shards: {
        ...state.shards,
        [hero.name]: currentShards - requiredShards
      },
      heroes: state.heroes.map(h => {
        if (h.id === heroId) {
          return {
            ...h,
            stars: h.stars + 1,
            atk: h.atk + 120,
            maxHp: h.maxHp + 600,
            hp: h.hp + 600
          }
        }
        return h
      })
    }
  }),

  toggleEquipItem: (heroId, itemId) => set((state) => {
    const item = state.inventory.find(i => i.id === itemId)
    if (!item) return state

    audioEngine.playEquipSFX()

    return {
      heroes: state.heroes.map(h => {
        if (h.id === heroId) {
          const isEquipped = h.equippedItemIds.includes(itemId)
          const newEquipped = isEquipped 
            ? h.equippedItemIds.filter(id => id !== itemId)
            : [...h.equippedItemIds, itemId]

          const atkDelta = (item.statBonus.atk || 0) * (isEquipped ? -1 : 1)
          const hpDelta = (item.statBonus.hp || 0) * (isEquipped ? -1 : 1)

          return {
            ...h,
            equippedItemIds: newEquipped,
            atk: Math.max(10, h.atk + atkDelta),
            maxHp: Math.max(50, h.maxHp + hpDelta),
            hp: Math.max(50, h.hp + hpDelta)
          }
        }
        return h
      })
    }
  }),

  selectStage: (index) => set((state) => {
    if (index > state.maxUnlockedStage) return state
    audioEngine.playClick()
    const stage = CAMPAIGN_STAGES[index]
    return {
      gameMode: 'CAMPAIGN',
      currentStageIndex: index,
      enemies: stage.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      currentScreen: 'BATTLE',
      showStageSelectModal: false,
      showVictoryModal: false,
      showDefeatModal: false,
      comboBanner: 'BẮT ĐẦU TRẬN CHIẾN!'
    }
  }),

  nextStage: () => {
    audioEngine.playClick()
    set((state) => {
      if (state.gameMode === 'TOWER') {
        const nextFloor = Math.min(100, state.towerFloor + 1)
        const towerData = getTowerFloorData(nextFloor)
        return {
          towerFloor: nextFloor,
          maxTowerFloor: Math.max(state.maxTowerFloor, nextFloor),
          enemies: towerData.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
          heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
          turn: 1,
          showVictoryModal: false,
          comboBanner: 'TẦNG THÁP MỚI',
          isAutoBattle: true
        }
      } else if (state.gameMode === 'WORLD_BOSS') {
        return {
          enemies: [{ ...WORLD_BOSS_DATA.bossEnemy, hp: WORLD_BOSS_DATA.bossEnemy.maxHp, rage: 0 }],
          heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
          turn: 1,
          worldBossTotalDamage: 0,
          showVictoryModal: false,
          comboBanner: 'THẢO PHẠT BOSS',
          isAutoBattle: true
        }
      } else {
        const nextIdx = Math.min(CAMPAIGN_STAGES.length - 1, state.currentStageIndex + 1)
        const stage = CAMPAIGN_STAGES[nextIdx]
        const newMaxUnlocked = Math.max(state.maxUnlockedStage, nextIdx)

        return {
          currentStageIndex: nextIdx,
          maxUnlockedStage: newMaxUnlocked,
          enemies: stage.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
          heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
          turn: 1,
          showVictoryModal: false,
          comboBanner: 'ẢI TIẾP THEO',
          isAutoBattle: true
        }
      }
    })

    setTimeout(() => {
      const state = get()
      if (state.isAutoBattle && !state.isAnimating && state.enemies.some(e => e.hp > 0)) {
        get().executeTurn()
      }
    }, 400)
  },

  startTowerFloor: (floor) => {
    if (floor > get().maxTowerFloor) return
    audioEngine.playClick()
    const towerData = getTowerFloorData(floor)

    set((state) => ({
      gameMode: 'TOWER',
      towerFloor: floor,
      enemies: towerData.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      currentScreen: 'BATTLE',
      showTowerModal: false,
      showVictoryModal: false,
      showDefeatModal: false,
      isAutoBattle: true
    }))
  },

  startWorldBossRaid: () => {
    audioEngine.playClick()
    set((state) => ({
      gameMode: 'WORLD_BOSS',
      enemies: [{ ...WORLD_BOSS_DATA.bossEnemy, hp: WORLD_BOSS_DATA.bossEnemy.maxHp, rage: 0 }],
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      worldBossTotalDamage: 0,
      currentScreen: 'BATTLE',
      showWorldBossModal: false,
      showVictoryModal: false,
      showDefeatModal: false,
      isAutoBattle: true
    }))
  },

  startPvPChallenge: (opponent: PvPOpponent) => {
    audioEngine.playClick()
    set((state) => ({
      gameMode: 'PVP',
      enemies: opponent.defenseTeam.map((e: HeroData) => ({ ...e, hp: e.maxHp, rage: 0 })),
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      currentScreen: 'BATTLE',
      showPvPModal: false,
      showVictoryModal: false,
      showDefeatModal: false,
      isAutoBattle: true
    }))
  },

  pullGacha: (count) => set((state) => {
    const cost = count === 1 ? 300 : 2700
    if (state.gold < cost) return state

    audioEngine.playGachaPullSFX()

    const results: (GachaHeroTemplate & { id: string; isDuplicate?: boolean })[] = []
    const newHeroesList = [...state.heroes]
    const newShards = { ...state.shards }

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100
      let chosenRarity: 'UR' | 'SSR' | 'SR' = 'SR'
      if (rand < 10) chosenRarity = 'UR'
      else if (rand < 40) chosenRarity = 'SSR'

      const pool = GACHA_HERO_POOL.filter(h => h.rarity === chosenRarity)
      const template = pool[Math.floor(Math.random() * pool.length)] || GACHA_HERO_POOL[0]

      const existingHero = newHeroesList.find(h => h.name === template.name)

      if (existingHero) {
        newShards[template.name] = (newShards[template.name] || 0) + 30
        results.push({ ...template, id: `dupe_${Date.now()}_${i}`, isDuplicate: true })
      } else {
        const uniqueId = `hero_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        results.push({ ...template, id: uniqueId, isDuplicate: false })

        const occupiedSlots = new Set(newHeroesList.map(h => h.slotIndex))
        let freeSlot = -1
        for (let s = 0; s < 6; s++) {
          if (!occupiedSlots.has(s)) {
            freeSlot = s;
            break;
          }
        }

        newHeroesList.push({
          id: uniqueId,
          name: template.name,
          role: template.role,
          rarity: template.rarity,
          hp: template.hp,
          maxHp: template.maxHp,
          atk: template.atk,
          color: template.color,
          slotIndex: freeSlot,
          level: template.level,
          stars: template.stars,
          equippedItemIds: [],
          rage: 0,
          maxRage: 100,
          skill: template.skill
        })
      }
    }

    triggerAutoCloudSave()

    return {
      gold: state.gold - cost,
      heroes: newHeroesList,
      shards: newShards,
      gachaResults: results
    }
  }),

  importGameState: (cloudState: Partial<GameState>) => {
    set(state => ({
      ...state,
      ...cloudState,
      showCloudModal: false,
      showVictoryModal: false,
      showDefeatModal: false,
      showGachaModal: false,
      showCodexModal: false,
      showHeroModal: false,
      showSquadModal: false,
      showRankModal: false,
      showIdleModal: false,
      showStageSelectModal: false,
      showBeastModal: false,
      heroes: rehydrateHeroes(cloudState.heroes || state.heroes),
      inventory: cloudState.inventory || state.inventory,
      shards: cloudState.shards || state.shards,
      gold: cloudState.gold !== undefined ? cloudState.gold : state.gold,
      currentStageIndex: cloudState.currentStageIndex !== undefined ? cloudState.currentStageIndex : state.currentStageIndex,
      maxUnlockedStage: cloudState.maxUnlockedStage !== undefined ? cloudState.maxUnlockedStage : state.maxUnlockedStage,
      towerFloor: cloudState.towerFloor !== undefined ? cloudState.towerFloor : state.towerFloor,
      maxTowerFloor: cloudState.maxTowerFloor !== undefined ? cloudState.maxTowerFloor : state.maxTowerFloor,
      pvpScore: cloudState.pvpScore !== undefined ? cloudState.pvpScore : state.pvpScore,
      worldBossTotalDamage: cloudState.worldBossTotalDamage !== undefined ? cloudState.worldBossTotalDamage : state.worldBossTotalDamage,
      activeBeastId: cloudState.activeBeastId || state.activeBeastId
    }))
  },

  executeTurn: async () => {
    const state = get()
    if (state.currentScreen !== 'BATTLE' || state.isAnimating) return

    set({ isAnimating: true, actionText: null })

    const { battleSpeed, gameMode } = state
    const delay = Math.floor(1200 / battleSpeed)
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    let currentState = get()

    // 1. Khởi đầu trận: Buff nội tại Support và +Nộ Assassin
    if (currentState.turn === 1) {
      let heroes = [...currentState.heroes]
      let changed = false
      let supportCount = 0

      heroes = heroes.map(h => {
        if (h.slotIndex === -1) return h
        let newRage = h.rage || 0
        if (h.role === 'Assassin') {
          newRage = Math.min(h.maxRage || 100, newRage + 60)
          changed = true
        }
        if (h.role === 'Support' && h.hp > 0) {
          supportCount++
        }
        return { ...h, rage: newRage }
      })

      if (supportCount > 0) {
        heroes = heroes.map(h => h.slotIndex !== -1 ? { ...h, rage: Math.min(h.maxRage || 100, (h.rage || 0) + 20 * supportCount) } : h)
        changed = true
        set({ comboBanner: 'Nội tại Support: +Nộ toàn đội!' })
        await sleep(delay)
      }

      if (changed) {
        set({ heroes, comboBanner: supportCount > 0 ? 'Nội tại kích hoạt!' : 'Trinh Sát: +60 Nộ khởi đầu!' })
        await sleep(delay)
      }
      set({ comboBanner: null })
    }

    // 2. Tính Tổng Lực Chiến (Combat Power) để xem ai đánh trước
    currentState = get()
    const pCP = currentState.heroes.filter(h => h.slotIndex !== -1 && h.hp > 0).reduce((s, h) => s + h.hp + h.atk, 0)
    const eCP = currentState.enemies.filter(e => e.hp > 0).reduce((s, e) => s + e.hp + e.atk, 0)
    const playerFirst = pCP >= eCP

    // Hàm thực thi 1 đòn đánh
    const executeAttack = async (isPlayerAttacking: boolean, inputAttacker: any, forceUltimate: boolean = false) => {
      let st = get()
      if (st.currentScreen !== 'BATTLE') return true

      let attackerList = isPlayerAttacking ? st.heroes.filter(h => h.slotIndex !== -1) : st.enemies
      let attacker = attackerList.find(a => a.id === inputAttacker.id && a.hp > 0)
      if (!attacker) return false // No attacker or dead

      let targetList = isPlayerAttacking ? st.enemies : st.heroes.filter(h => h.slotIndex !== -1)
      let aliveTargets = targetList.filter(t => t.hp > 0)
      if (aliveTargets.length === 0) return true // Battle over

      // Animation lướt lên
      set({ activeAttackerId: attacker.id })
      await sleep(delay * 0.4)

      // Chọn mục tiêu: Ưu tiên hàng trước (slot 0-2). Khi hàng trước bị tiêu diệt hết mới đánh hàng sau (slot 3-5).
      // Ưu tiên theo độ gần của cột (column = slotIndex % 3).
      const attackerCol = attacker.slotIndex % 3
      const frontlineTargets = aliveTargets.filter(t => t.slotIndex >= 0 && t.slotIndex <= 2)
      const targetPool = frontlineTargets.length > 0 ? frontlineTargets : aliveTargets

      let target = targetPool.slice().sort((a, b) => {
        const distA = Math.abs((a.slotIndex % 3) - attackerCol)
        const distB = Math.abs((b.slotIndex % 3) - attackerCol)
        if (distA !== distB) return distA - distB
        return a.slotIndex - b.slotIndex
      })[0]

      const isUltimate = forceUltimate
      const excessRage = isUltimate ? Math.max(0, (attacker.rage || 0) - (attacker.maxRage || 100)) : 0
      
      let baseAtk = attacker.atk
      let variance = 0.9 + Math.random() * 0.2
      let dmg = Math.floor(baseAtk * variance)

      let actionMsg = ''
      let newAttackerRage = attacker.rage || 0
      let targetRageDelta = 0
      
      // Chí Mạng (Critical Hit)
      const critRate = (attacker.role === 'DPS' || attacker.role === 'Assassin') ? 0.35 : 0.20
      const isCrit = Math.random() < critRate
      if (isCrit) {
        dmg = Math.floor(dmg * 1.75)
      }
      const critText = isCrit ? ' 💥 CHÍ MẠNG!' : ''

      let updatedAttackerList = attackerList

      // If attacker is Support on normal attack -> Heal lowest HP ally!
      const isSupportHeal = !isUltimate && attacker.role === 'Support'
      let healDmg = 0

      if (isSupportHeal) {
        audioEngine.playEquipSFX()
        healDmg = Math.floor(attacker.atk * 1.4 * (isCrit ? 1.6 : 1.0))
        actionMsg = `${isCrit ? '💥 CHÍ MẠNG! ' : ''}+${healDmg.toLocaleString()} HP`
        newAttackerRage = newAttackerRage + 40

        let lowestAlly = attackerList.filter(a => a.hp > 0 && a.slotIndex !== -1).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0]
        if (lowestAlly) {
          updatedAttackerList = attackerList.map(a => {
            if (a.id === lowestAlly.id) {
              return { ...a, hp: Math.min(a.maxHp, a.hp + healDmg) }
            }
            if (a.id === attacker!.id) {
              return { ...a, rage: Math.min(a.maxRage || 100, newAttackerRage) }
            }
            return a
          })
        }
      } else if (isUltimate) {
        audioEngine.playComboSFX()
        const mult = attacker.skill?.damageMultiplier || 2.0
        const rageBonus = 1 + (excessRage * 0.01) // +1% sát thương mỗi điểm nộ dư
        dmg = Math.floor(dmg * mult * rageBonus)
        
        actionMsg = `[TUYỆT KỸ] ${attacker.skill?.name || 'Vung Vũ Khí'}!${critText} -${dmg.toLocaleString()} HP`
        
        newAttackerRage = 0 // Reset nộ
        if (attacker.skill?.rageRecovery) {
          newAttackerRage += attacker.skill.rageRecovery
        }
        if (attacker.skill?.rageSteal) {
          targetRageDelta = -attacker.skill.rageSteal
          newAttackerRage += attacker.skill.rageSteal
        }
      } else {
        audioEngine.playEquipSFX()
        actionMsg = `${isCrit ? '💥 CHÍ MẠNG! ' : ''}-${dmg.toLocaleString()} HP`
        newAttackerRage = newAttackerRage + (attacker.role === 'DPS' ? 60 : 40)
      }

      // Check Counter-attack (Phản công)
      let isCounter = false
      let counterDmg = 0
      if (!isUltimate && !isSupportHeal && target.role === 'Tank' && Math.random() < 0.35) {
         isCounter = true
         counterDmg = Math.floor(target.atk * 0.6)
         actionMsg += ` (Phản Kích -${counterDmg.toLocaleString()} HP)`
      }

      let targetHpBefore = target.hp
      let finalTargetHp = Math.max(0, targetHpBefore - dmg)
      let isKill = finalTargetHp === 0

      // Snowball Kích sát hồi nộ
      if (isKill && (attacker.role === 'DPS' || attacker.role === 'Assassin')) {
        newAttackerRage += 50
        actionMsg += ` (Đoạt Mệnh +50 Nộ)`
      }

      // Hợp Kích (Specific Synergy)
      let assistDmg = 0
      let synergyBanner: string | null = null
      let assistAttackerId: string | null = null
      let assistPartnerName: string = ''
      let isAssistCrit = false

      if (isUltimate && attacker.synergy) {
        let assistAttacker = attackerList.find(a => a.id === attacker!.synergy!.partnerId && a.hp > 0 && a.slotIndex !== -1)
        if (assistAttacker) {
           assistAttackerId = assistAttacker.id
           assistPartnerName = assistAttacker.name
           isAssistCrit = Math.random() < 0.35
           assistDmg = Math.floor(assistAttacker.atk * (isAssistCrit ? 2.2 : 1.5))
           synergyBanner = `[HỢP KỸ] ${attacker.synergy.skillName}`
        }
      }

      // Cập nhật máu và nộ cho attacker
      updatedAttackerList = updatedAttackerList.map(a => {
        if (a.id === attacker!.id) {
           return { ...a, rage: Math.min(a.maxRage || 100, newAttackerRage) }
        }
        if (isKill && a.role === 'Support') { 
           return { ...a, rage: Math.min(a.maxRage || 100, (a.rage || 0) + 5) }
        }
        return a
      })

      // Cập nhật máu và nộ cho target(s) trong đòn tuyệt kỹ chính
      let updatedTargetList = targetList.map(t => {
        if (t.id === target!.id) {
           let r = (t.rage || 0) + 15 + targetRageDelta
           if (t.role === 'Tank') r += 15
           return { ...t, hp: finalTargetHp, rage: Math.max(0, Math.min(t.maxRage || 100, r)) }
        }
        return t
      })

      // Phản đòn trừ máu attacker
      if (isCounter) {
        updatedAttackerList = updatedAttackerList.map(a => {
           if (a.id === attacker!.id) {
             return { ...a, hp: Math.max(0, a.hp - counterDmg) }
           }
           return a
        })
      }

      // Bước 1: Thi triển đòn đánh (Chỉ hiện Banner & Text khi dùng Tuyệt Kỹ)
      if (isPlayerAttacking) {
        set({ 
          heroes: st.heroes.map(h => updatedAttackerList.find(a => a.id === h.id) || h), 
          enemies: updatedTargetList, 
          actionText: isUltimate ? actionMsg : null, 
          comboBanner: isUltimate ? actionMsg : null 
        })
      } else {
        set({ 
          enemies: updatedAttackerList, 
          heroes: st.heroes.map(h => updatedTargetList.find(t => t.id === h.id) || h), 
          actionText: isUltimate ? actionMsg : null, 
          comboBanner: isUltimate ? actionMsg : null 
        })
      }

      await sleep(delay * 0.8)
      set({ activeAttackerId: null, comboBanner: null }) // Tướng chính lùi về & ẩn banner Tuyệt Kỹ

      // Bước 2: Thi triển Hợp Kỹ của Tướng Phối hợp (Có khoảng nghỉ rõ ràng sau Tuyệt Kỹ)
      if (synergyBanner && assistAttackerId) {
        // Khoảng nghỉ giữa đòn Tuyệt Kỹ và đòn Hợp Kỹ
        await sleep(delay * 0.6)
        
        // Hiện banner Hợp Kỹ riêng biệt & Tướng Hợp Kích lao lên
        set({ 
          activeAttackerId: assistAttackerId,
          comboBanner: synergyBanner,
          actionText: `${assistPartnerName} Hợp Kích:${isAssistCrit ? ' 💥 CHÍ MẠNG!' : ''} -${assistDmg.toLocaleString()} HP!`
        })

        // Tính sát thương hợp kích (nếu quái ban đầu đã gục, bồi vào quái tiếp theo)
        let currentEnemies = get().enemies
        let currentHeroes = get().heroes
        let targetListForAssist = isPlayerAttacking ? currentEnemies : currentHeroes
        let primaryTargetStillAlive = targetListForAssist.find(t => t.id === target!.id && t.hp > 0)

        let updatedAssistTargets = targetListForAssist.map(t => {
          if (primaryTargetStillAlive && t.id === target!.id) {
            return { ...t, hp: Math.max(0, t.hp - assistDmg) }
          } else if (!primaryTargetStillAlive) {
            let nextAliveTarget = targetListForAssist.filter(x => x.hp > 0).sort((a, b) => a.slotIndex - b.slotIndex)[0]
            if (nextAliveTarget && t.id === nextAliveTarget.id) {
              return { ...t, hp: Math.max(0, t.hp - assistDmg) }
            }
          }
          return t
        })

        if (isPlayerAttacking) {
          set({ enemies: updatedAssistTargets })
        } else {
          set({ heroes: updatedAssistTargets })
        }

        await sleep(delay * 0.8)
        set({ activeAttackerId: null, comboBanner: null })
      } else {
        await sleep(delay * 0.4)
      }

      // Khoảng nghỉ rõ ràng giữa các hành động của từng tướng/quái
      await sleep(delay * 0.5)

      // Kiểm tra kết thúc trận
      st = get()
      const stillAliveEnemies = st.enemies.some(e => e.hp > 0)
      const stillAliveHeroes = st.heroes.some(h => h.slotIndex !== -1 && h.hp > 0)
      if (!stillAliveEnemies || !stillAliveHeroes) return true

      return false // Tiếp tục
    }

    const checkAndExecuteUltimates = async (): Promise<boolean> => {
      let st = get();
      while (true) {
        if (st.currentScreen !== 'BATTLE') return true;

        let candidates = [
          ...st.heroes.filter(h => h.slotIndex !== -1 && h.hp > 0 && (h.rage || 0) >= (h.maxRage || 100)).map(h => ({ ...h, isPlayer: true })),
          ...st.enemies.filter(e => e.hp > 0 && (e.rage || 0) >= (e.maxRage || 100)).map(e => ({ ...e, isPlayer: false }))
        ];

        if (candidates.length === 0) break;

        // Ưu tiên: Lượng Nộ cao hơn > Phe người chơi (isPlayer) > Vị trí đứng (slotIndex)
        candidates.sort((a, b) => {
          if ((b.rage || 0) !== (a.rage || 0)) return (b.rage || 0) - (a.rage || 0);
          if (a.isPlayer !== b.isPlayer) return a.isPlayer ? -1 : 1;
          return a.slotIndex - b.slotIndex;
        });

        const nextUlt = candidates[0];
        let over = await executeAttack(nextUlt.isPlayer, nextUlt, true);
        if (over) return true;
        
        await sleep(delay * 0.4); // Khoảng nghỉ giữa các đòn tuyệt kỹ liên tiếp
        st = get(); 
      }
      return false;
    }

    let battleEnded = false
    
    // Check ngay từ đầu lượt xem có ai đầy nộ chưa (do Support buff đầu lượt)
    battleEnded = await checkAndExecuteUltimates()

    for (let slot = 0; slot < 6 && !battleEnded; slot++) {
      if (playerFirst) {
        let st = get();
        let pAttacker = st.heroes.find(h => h.slotIndex === slot && h.hp > 0);
        if (pAttacker) {
          battleEnded = await executeAttack(true, pAttacker, false);
          if (battleEnded) break;
          battleEnded = await checkAndExecuteUltimates();
          if (battleEnded) break;
        }

        st = get();
        let eAttacker = st.enemies.find(e => e.slotIndex === slot && e.hp > 0);
        if (eAttacker) {
          battleEnded = await executeAttack(false, eAttacker, false);
          if (battleEnded) break;
          battleEnded = await checkAndExecuteUltimates();
          if (battleEnded) break;
        }
      } else {
        let st = get();
        let eAttacker = st.enemies.find(e => e.slotIndex === slot && e.hp > 0);
        if (eAttacker) {
          battleEnded = await executeAttack(false, eAttacker, false);
          if (battleEnded) break;
          battleEnded = await checkAndExecuteUltimates();
          if (battleEnded) break;
        }

        st = get();
        let pAttacker = st.heroes.find(h => h.slotIndex === slot && h.hp > 0);
        if (pAttacker) {
          battleEnded = await executeAttack(true, pAttacker, false);
          if (battleEnded) break;
          battleEnded = await checkAndExecuteUltimates();
          if (battleEnded) break;
        }
      }
    }

    // Kết thúc vòng lặp 6 Slot
    let finalState = get()
    const aliveEnemies = finalState.enemies.filter(e => e.hp > 0)
    const aliveHeroes = finalState.heroes.filter(h => h.slotIndex !== -1 && h.hp > 0)

    if (aliveEnemies.length === 0) {
      audioEngine.playVictorySFX()
      let rewardGold = 10000
      if (gameMode === 'WORLD_BOSS') rewardGold = 15000
      else if (gameMode === 'PVP') rewardGold = 8000
      else if (gameMode === 'TOWER') rewardGold = 5000
      else rewardGold = CAMPAIGN_STAGES[finalState.currentStageIndex].rewardGold

      set({
        gold: finalState.gold + rewardGold,
        pvpScore: gameMode === 'PVP' ? finalState.pvpScore + 50 : finalState.pvpScore,
        maxUnlockedStage: gameMode === 'CAMPAIGN' ? Math.max(finalState.maxUnlockedStage, finalState.currentStageIndex + 1) : finalState.maxUnlockedStage,
        showVictoryModal: true,
        isAnimating: false,
        actionText: null,
        comboBanner: null
      })
      triggerAutoCloudSave()
    } else if (aliveHeroes.length === 0) {
      set({
        showDefeatModal: true,
        isAnimating: false,
        actionText: null,
        comboBanner: null
      })
    } else {
      set({
        turn: finalState.turn + 1,
        isAnimating: false,
        actionText: null,
        comboBanner: null
      })
      if (finalState.isAutoBattle && get().currentScreen === 'BATTLE') {
        setTimeout(() => get().executeTurn(), delay)
      }
    }
  }
}))

if (typeof window !== 'undefined') {
  let cloudSaveDebounce: any = null
  useGameStore.subscribe((state) => {
    saveLocalGameState(state)
    if (cloudSaveDebounce) clearTimeout(cloudSaveDebounce)
    cloudSaveDebounce = setTimeout(() => {
      cloudService.saveCloudProfile(state)
    }, 1000)
  })
}
