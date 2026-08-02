import { create } from 'zustand'
import { MOCK_HEROES, type HeroData } from '../data/heroes'
import { MOCK_ITEMS, type ItemData } from '../data/items'
import { CAMPAIGN_STAGES } from '../data/stages'
import { GACHA_HERO_POOL, type GachaHeroTemplate } from '../data/gachaPool'
import { getTowerFloorData } from '../data/towerData'
import { WORLD_BOSS_DATA } from '../data/worldBossData'
import { type PvPOpponent } from '../data/pvpData'
import { audioEngine } from '../utils/audioEngine'

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
  executeTurn: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  heroes: MOCK_HEROES,
  enemies: CAMPAIGN_STAGES[0].enemies,
  inventory: MOCK_ITEMS,
  shards: { 'Lê Lợi': 20, 'Nguyễn Trãi': 10 },
  gold: 5000,
  turn: 1,
  currentScreen: 'LOBBY',
  gameMode: 'CAMPAIGN',
  currentStageIndex: 0,
  maxUnlockedStage: 0,
  towerFloor: 1,
  maxTowerFloor: 1,
  worldBossTotalDamage: 0,
  pvpRank: 8,
  pvpScore: 1250,
  rankLevel: 1,
  activeBeastId: 'beast_kim_quy',
  isMuted: false,
  isAnimating: false,
  battleSpeed: 1,
  isAutoBattle: false,
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

  setCurrentScreen: (screen) => {
    audioEngine.playClick()
    set({ currentScreen: screen })
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

  nextStage: () => set((state) => {
    audioEngine.playClick()
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
        comboBanner: 'TẦNG THÁP MỚI'
      }
    } else if (state.gameMode === 'WORLD_BOSS') {
      return {
        enemies: [{ ...WORLD_BOSS_DATA.bossEnemy, hp: WORLD_BOSS_DATA.bossEnemy.maxHp, rage: 0 }],
        heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
        turn: 1,
        worldBossTotalDamage: 0,
        showVictoryModal: false,
        comboBanner: 'THẢO PHẠT BOSS'
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
        comboBanner: 'ẢI TIẾP THEO'
      }
    }
  }),

  startTowerFloor: (floor) => set((state) => {
    if (floor > state.maxTowerFloor) return state
    audioEngine.playClick()
    const towerData = getTowerFloorData(floor)

    return {
      gameMode: 'TOWER',
      towerFloor: floor,
      enemies: towerData.enemies.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      currentScreen: 'BATTLE',
      showTowerModal: false,
      showVictoryModal: false,
      showDefeatModal: false
    }
  }),

  startWorldBossRaid: () => set((state) => {
    audioEngine.playClick()
    return {
      gameMode: 'WORLD_BOSS',
      enemies: [{ ...WORLD_BOSS_DATA.bossEnemy, hp: WORLD_BOSS_DATA.bossEnemy.maxHp, rage: 0 }],
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      worldBossTotalDamage: 0,
      currentScreen: 'BATTLE',
      showWorldBossModal: false,
      showVictoryModal: false,
      showDefeatModal: false
    }
  }),

  startPvPChallenge: (opponent) => set((state) => {
    audioEngine.playClick()
    return {
      gameMode: 'PVP',
      enemies: opponent.defenseTeam.map(e => ({ ...e, hp: e.maxHp, rage: 0 })),
      heroes: state.heroes.map(h => ({ ...h, rage: 0 })),
      turn: 1,
      currentScreen: 'BATTLE',
      showPvPModal: false,
      showVictoryModal: false,
      showDefeatModal: false
    }
  }),

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

    return {
      gold: state.gold - cost,
      heroes: newHeroesList,
      shards: newShards,
      gachaResults: results
    }
  }),

  executeTurn: async () => {
    const state = get()
    if (state.isAnimating) return

    set({ isAnimating: true, actionText: 'Lượt đánh bắt đầu!' })

    const { battleSpeed, isAutoBattle, gameMode } = state
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
      
      if (isUltimate) {
        audioEngine.playComboSFX()
        const mult = attacker.skill?.damageMultiplier || 2.0
        const rageBonus = 1 + (excessRage * 0.01) // +1% sát thương mỗi điểm nộ dư
        dmg = Math.floor(dmg * mult * rageBonus)
        actionMsg = `[TUYỆT KỸ] ${attacker.skill?.name || 'Vung Vũ Khí'}!`
        
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
        actionMsg = `${attacker.name} chém ${target.name}`
        newAttackerRage = newAttackerRage + (attacker.role === 'DPS' ? 60 : 40)
      }

      // Check Counter-attack (Phản công)
      let isCounter = false
      if (!isUltimate && target.role === 'Tank' && Math.random() < 0.3) {
         isCounter = true
         actionMsg += ` ⚔️ Bị Phản đòn!`
      }

      let targetHpBefore = target.hp
      let finalTargetHp = Math.max(0, targetHpBefore - dmg)
      let isKill = finalTargetHp === 0

      // Snowball Kích sát hồi nộ
      if (isKill && (attacker.role === 'DPS' || attacker.role === 'Assassin')) {
        newAttackerRage += 50
        actionMsg += ` (Đoạt Mệnh +50 Nộ)`
      }

      // Hợp Kích (Synergy Assist)
      let assistAttacker = attackerList.find(a => a.role === 'Support' && a.id !== attacker!.id && a.hp > 0)
      let assistDmg = 0
      if (isUltimate && assistAttacker && !isKill && Math.random() < 0.5) {
         assistDmg = Math.floor(assistAttacker.atk * 0.8)
         actionMsg += ` + Hợp Kích!`
         finalTargetHp = Math.max(0, finalTargetHp - assistDmg)
         isKill = finalTargetHp === 0
      }

      // Cập nhật máu và nộ cho attacker
      let updatedAttackerList = attackerList.map(a => {
        if (a.id === attacker!.id) {
           return { ...a, rage: Math.min(a.maxRage || 100, newAttackerRage) }
        }
        if (isKill && a.role === 'Support') { 
           // Support hồi nộ khi đồng đội kết thúc lượt/giết địch
           return { ...a, rage: Math.min(a.maxRage || 100, (a.rage || 0) + 5) }
        }
        return a
      })

      // Cập nhật máu và nộ cho target
      let updatedTargetList = targetList.map(t => {
        if (t.id === target!.id) {
           let r = (t.rage || 0) + 15 + targetRageDelta
           if (t.role === 'Tank') r += 15 // Tank bị đánh + thêm nộ
           return { ...t, hp: finalTargetHp, rage: Math.max(0, Math.min(t.maxRage || 100, r)) }
        }
        return t
      })

      // Phản đòn trừ máu attacker
      if (isCounter) {
        let counterDmg = Math.floor(target.atk * 0.5)
        updatedAttackerList = updatedAttackerList.map(a => {
           if (a.id === attacker!.id) {
             return { ...a, hp: Math.max(0, a.hp - counterDmg) }
           }
           return a
        })
      }

      // Lưu State
      if (isPlayerAttacking) {
        set({ 
          heroes: st.heroes.map(h => updatedAttackerList.find(a => a.id === h.id) || h), 
          enemies: updatedTargetList, 
          actionText: actionMsg, 
          comboBanner: isUltimate ? actionMsg : null 
        })
      } else {
        set({ 
          enemies: updatedAttackerList, 
          heroes: st.heroes.map(h => updatedTargetList.find(t => t.id === h.id) || h), 
          actionText: actionMsg, 
          comboBanner: isUltimate ? actionMsg : null 
        })
      }

      await sleep(delay * 0.8)
      set({ activeAttackerId: null }) // Lùi về
      await sleep(delay * 0.4)
      
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
      if (finalState.isAutoBattle) {
        setTimeout(() => get().executeTurn(), delay)
      }
    }
  }
}))
