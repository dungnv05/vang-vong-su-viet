export interface ItemData {
  id: string
  name: string
  type: 'Weapon' | 'Armor' | 'Relic'
  rarity: 'UR' | 'SSR' | 'SR'
  statBonus: {
    atk?: number
    hp?: number
  }
  description: string
  icon: string
  textureUrl?: string
}

export const MOCK_ITEMS: ItemData[] = [
  {
    id: 'item_1',
    name: 'Thuận Thiên Kiếm',
    type: 'Weapon',
    rarity: 'UR',
    statBonus: { atk: 250 },
    description: 'Thanh kiếm báu thần kỳ Rùa Vàng ban cho Lê Lợi dấy binh Lam Sơn.',
    icon: '🗡️',
    textureUrl: '/assets/textures/equipment/sword_thuan_thien.svg'
  },
  {
    id: 'item_2',
    name: 'Nỏ Thần An Dương Vương',
    type: 'Weapon',
    rarity: 'UR',
    statBonus: { atk: 220 },
    description: 'Bắn một phát hàng ngàn mũi tên đồng diệt sạch giặc Triệu Đà.',
    icon: '🏹',
    textureUrl: '/assets/textures/equipment/no_than_crossbow.svg'
  },
  {
    id: 'item_3',
    name: 'Trống Đồng Đông Sơn',
    type: 'Relic',
    rarity: 'SSR',
    statBonus: { hp: 1200 },
    description: 'Bảo vật linh thiêng tăng khí thế chiến đấu cho toàn đội hình.',
    icon: '🥁',
    textureUrl: '/assets/textures/equipment/trong_dong_dong_son.svg'
  },
  {
    id: 'item_4',
    name: 'Bạch Đằng Cọc Gỗ',
    type: 'Armor',
    rarity: 'SSR',
    statBonus: { hp: 1500 },
    description: 'Bảo vật cọc nhọn bọc sắt nhấn chìm hạm đội giặc Nam Hán & Nguyên Mông.',
    icon: '🪵'
  }
]
