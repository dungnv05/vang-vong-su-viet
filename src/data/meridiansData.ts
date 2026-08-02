export interface MeridianNode {
  id: string
  name: string
  icon: string
  costGold: number
  statBonusText: string
  atkBonus: number
  hpBonus: number
  critBonus: number
}

export const MERIDIAN_NODES: MeridianNode[] = [
  { id: 'm_nham', name: 'Nhâm Mạch', icon: '🌀', costGold: 1000, statBonusText: '+150 ATK, +500 HP', atkBonus: 150, hpBonus: 500, critBonus: 2 },
  { id: 'm_doc', name: 'Đốc Mạch', icon: '⚡', costGold: 2500, statBonusText: '+300 ATK, +1000 HP, +5% Bạo Kích', atkBonus: 300, hpBonus: 1000, critBonus: 5 },
  { id: 'm_xung', name: 'Xung Mạch', icon: '🔥', costGold: 5000, statBonusText: '+500 ATK, +1800 HP, +8% Bạo Kích', atkBonus: 500, hpBonus: 1800, critBonus: 8 },
  { id: 'm_dai', name: 'Đái Mạch', icon: '🌟', costGold: 10000, statBonusText: '+800 ATK, +3000 HP, +12% Bạo Kích', atkBonus: 800, hpBonus: 3000, critBonus: 12 }
]
