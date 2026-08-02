import { type HeroData } from './heroes'

export interface TowerFloorData {
  floor: number
  name: string
  rewardGold: number
  isBossFloor: boolean
  bossName: string
  enemies: HeroData[]
}

// Hàm sinh tự động 100 Tầng Tháp Cổ Việt Nam với độ khó tăng dần
export function getTowerFloorData(floor: number): TowerFloorData {
  const isBoss = floor % 5 === 0
  const hpScaling = Math.floor(1800 * Math.pow(1.18, floor - 1))
  const atkScaling = Math.floor(110 * Math.pow(1.15, floor - 1))
  const rewardGold = Math.floor(600 * floor * (isBoss ? 2.5 : 1))

  const bossNames = [
    'Tướng Quỷ Ân Giặc',
    'Thái Thú Đông Hán Cuồng Nộ',
    'Ma Tướng Nam Hán',
    'Chủ Tướng Nguyên Mông Hắc Long',
    'Vương Thông Thức Tỉnh',
    'Đô Đốc Quân Thanh Vương Ma'
  ]

  const bossName = isBoss 
    ? bossNames[(Math.floor(floor / 5) - 1) % bossNames.length] 
    : `Quân Ma Vượt Tầng ${floor}`

  return {
    floor,
    name: isBoss ? `TẦNG ${floor}: BOSS ${bossName.toUpperCase()}` : `Tầng ${floor}: Thử Thách Tháp Cổ`,
    rewardGold,
    isBossFloor: isBoss,
    bossName,
    enemies: [
      {
        id: `tower_e_${floor}`,
        name: bossName,
        role: isBoss ? 'Tank' : 'DPS',
        hp: hpScaling,
        maxHp: hpScaling,
        atk: atkScaling,
        color: isBoss ? '#9b59b6' : '#e74c3c',
        slotIndex: 1,
        level: Math.min(100, floor * 2),
        stars: isBoss ? Math.min(5, Math.floor(floor / 10) + 1) : 1,
        equippedItemIds: [],
        isEnemy: true
      }
    ]
  }
}
