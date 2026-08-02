import { type HeroData } from './heroes'
import { getPowerScore } from '../components/ui/SquadModal'

export interface PvPOpponent {
  id: string
  rank: number
  playerName: string
  title: string
  score: number
  defenseTeam: HeroData[]
}

export function getPvPOpponents(): PvPOpponent[] {
  return [
    {
      id: 'pvp_1',
      rank: 1,
      playerName: 'Minh Hoàng',
      title: '👑 Vô Song Hưng Đạo',
      score: 2850,
      defenseTeam: [
        { id: 'pvp_h1', name: 'Trần Hưng Đạo', role: 'DPS', rarity: 'UR', hp: 3200, maxHp: 3200, atk: 450, color: '#9333ea', slotIndex: 1, level: 25, stars: 5, equippedItemIds: ['item_1', 'item_2'] },
        { id: 'pvp_h2', name: 'Quang Trung', role: 'DPS', rarity: 'UR', hp: 2900, maxHp: 2900, atk: 420, color: '#e74c3c', slotIndex: 0, level: 22, stars: 4, equippedItemIds: ['item_1'] },
        { id: 'pvp_h3', name: 'Ngô Quyền', role: 'Tank', rarity: 'SSR', hp: 3500, maxHp: 3500, atk: 280, color: '#2ecc71', slotIndex: 2, level: 20, stars: 4, equippedItemIds: ['item_4'] }
      ]
    },
    {
      id: 'pvp_2',
      rank: 2,
      playerName: 'Bảo Quốc',
      title: '⚔️ Lam Sơn Quân Vương',
      score: 2410,
      defenseTeam: [
        { id: 'pvp_h4', name: 'Lê Lợi', role: 'DPS', rarity: 'SSR', hp: 2200, maxHp: 2200, atk: 310, color: '#d4af37', slotIndex: 1, level: 18, stars: 4, equippedItemIds: ['item_1'] },
        { id: 'pvp_h5', name: 'Nguyễn Trãi', role: 'Support', rarity: 'SSR', hp: 1800, maxHp: 1800, atk: 240, color: '#38bdf8', slotIndex: 3, level: 16, stars: 3, equippedItemIds: ['item_3'] },
        { id: 'pvp_h6', name: 'Hai Bà Trưng', role: 'DPS', rarity: 'SSR', hp: 2000, maxHp: 2000, atk: 290, color: '#ec4899', slotIndex: 0, level: 15, stars: 3, equippedItemIds: [] }
      ]
    },
    {
      id: 'pvp_3',
      rank: 3,
      playerName: 'Hồng Hạnh',
      title: '🌸 Hát Môn Nữ Vương',
      score: 1950,
      defenseTeam: [
        { id: 'pvp_h7', name: 'Lý Thường Kiệt', role: 'Support', rarity: 'SSR', hp: 1900, maxHp: 1900, atk: 250, color: '#38bdf8', slotIndex: 1, level: 14, stars: 3, equippedItemIds: [] },
        { id: 'pvp_h8', name: 'Phạm Ngũ Lão', role: 'DPS', rarity: 'SR', hp: 1600, maxHp: 1600, atk: 210, color: '#2ecc71', slotIndex: 0, level: 12, stars: 2, equippedItemIds: [] }
      ]
    }
  ]
}

export function calculateTeamPower(team: HeroData[]): number {
  return team.reduce((sum, hero) => sum + getPowerScore(hero), 0)
}
