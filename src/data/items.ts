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
    description: 'Thanh kiếm báu thần kỳ Rùa Vàng ban cho Bình Định Vương Lê Lợi dấy binh Lam Sơn.',
    icon: '🗡️',
    textureUrl: '/assets/textures/equipment/sword_thuan_thien.svg'
  },
  {
    id: 'item_2',
    name: 'Nỏ Thần Liên Châu',
    type: 'Weapon',
    rarity: 'UR',
    statBonus: { atk: 220 },
    description: 'Bảo vật do tướng Cao Lỗ chế tạo cho An Dương Vương, bắn một phát ra hàng ngàn mũi tên đồng.',
    icon: '🏹',
    textureUrl: '/assets/textures/equipment/no_than_crossbow.svg'
  },
  {
    id: 'item_3',
    name: 'Trống Đồng Đông Sơn',
    type: 'Relic',
    rarity: 'SSR',
    statBonus: { hp: 1200 },
    description: 'Thần vật đúc bằng đồng thiêng đại diện cho nền văn minh Văn Lang thịnh vượng.',
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
  },
  {
    id: 'item_5',
    name: 'Bình Ngô Sách',
    type: 'Relic',
    rarity: 'UR',
    statBonus: { atk: 180, hp: 800 },
    description: 'Bộ sách chiến lược "Tâm Công" của Ức Trai Nguyễn Trãi, định đoạt đại cục Khởi Nghĩa Lam Sơn.',
    icon: '📜'
  },
  {
    id: 'item_6',
    name: 'Hỏa Long Thần Công',
    type: 'Weapon',
    rarity: 'UR',
    statBonus: { atk: 300 },
    description: 'Súng thần công hỏa long của Tây Sơn đại pháo, hủy diệt hàng rào phòng thủ giặc Thanh.',
    icon: '💣'
  },
  {
    id: 'item_7',
    name: 'Giáp Đồng Voi Chiến',
    type: 'Armor',
    rarity: 'SSR',
    statBonus: { hp: 2000 },
    description: 'Bộ giáp đồng bảo vệ voi chiến uy phong của Hai Bà Trưng & Bà Triệu ra trận.',
    icon: '🐘'
  },
  {
    id: 'item_8',
    name: 'Roi Sắt Phù Đổng',
    type: 'Weapon',
    rarity: 'SSR',
    statBonus: { atk: 200 },
    description: 'Vũ khí rèn bằng sắt tinh luyện của Thánh Gióng vung lên quạt tan quân giặc.',
    icon: '⚡'
  }
]
