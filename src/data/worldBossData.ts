import { type HeroData } from './heroes'

export interface WorldBossData {
  id: string
  name: string
  title: string
  icon: string
  color: string
  totalHp: number
  description: string
  rewards: {
    minDamage: number
    gold: number
    rewardName: string
  }[]
  bossEnemy: HeroData
}

export const WORLD_BOSS_DATA: WorldBossData = {
  id: 'world_boss_hac_long',
  name: 'Hắc Long Ma Tướng',
  title: 'Thần Thú Ma Hóa Chi Vương',
  icon: '🐉',
  color: '#9333ea', // Tím ma thuật
  totalHp: 100000000, // 100 Triệu Máu (Vô hạn)
  description: 'Hắc LongMa Tướng ngàn năm thức tỉnh từ vực thẫm, hấp thụ ma khí ngoại xâm gieo rắc tai ốm cho nhân dân. Hãy dẫn dắt dàn Danh Nhân Lịch Sử gây tổng sát thương lớn nhất!',
  rewards: [
    { minDamage: 10000, gold: 3000, rewardName: '📦 Rương Thần Khí SR' },
    { minDamage: 50000, gold: 10000, rewardName: '👑 Rương Bảo Vật SSR' },
    { minDamage: 150000, gold: 30000, rewardName: '✨ Rương Thần Khí UR Hoàng Gia' }
  ],
  bossEnemy: {
    id: 'e_world_boss',
    name: 'Hắc Long Ma Tướng (Trùm Thế Giới)',
    role: 'Tank',
    hp: 100000000,
    maxHp: 100000000,
    atk: 350,
    color: '#9333ea',
    slotIndex: 1,
    level: 100,
    stars: 5,
    equippedItemIds: [],
    isEnemy: true
  }
}
