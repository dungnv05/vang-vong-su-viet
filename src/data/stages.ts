import { type HeroData, rehydrateHeroes } from './heroes'

export interface StageData {
  id: number
  year: string
  name: string
  subtitle: string
  description: string
  rewardGold: number
  enemies: HeroData[]
  bossName: string
}

// Sắp xếp các Ải Màn Chơi theo đúng Tiến Trình Thời Gian Lịch Sử Việt Nam (Chronological Order)
export const RAW_CAMPAIGN_STAGES: StageData[] = [
  {
    id: 1,
    year: 'Năm 40',
    name: 'Ải 1: Khởi Nghĩa Hát Môn',
    subtitle: 'Hai Bà Trưng Phất Cờ Khởi Nghĩa - Năm 40 AD',
    description: 'Trưng Trắc & Trưng Nhị nổi dậy trả thù nhà nợ nước, đánh đuổi Thái thú Tô Định.',
    rewardGold: 1000,
    bossName: 'Tô Định',
    enemies: [
      { id: 'e1_0', name: 'Lính Tiên Phong Hán', role: 'Tank', hp: 800, maxHp: 800, atk: 50, color: '#34495e', slotIndex: 0, level: 2, stars: 1, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e1_1', name: 'Tô Định (Thái Thú Đông Hán)', role: 'DPS', hp: 2000, maxHp: 2000, atk: 100, color: '#8e44ad', slotIndex: 1, level: 3, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100, skill: { name: 'Đàn Áp Giao Chỉ', damageMultiplier: 1.5, rageRecovery: 10 } },
      { id: 'e1_2', name: 'Lính Tiên Phong Hán', role: 'Tank', hp: 800, maxHp: 800, atk: 50, color: '#34495e', slotIndex: 2, level: 2, stars: 1, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e1_3', name: 'Cung Thủ Đông Hán', role: 'DPS', hp: 600, maxHp: 600, atk: 70, color: '#7f8c8d', slotIndex: 3, level: 2, stars: 1, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e1_4', name: 'Cung Thủ Đông Hán', role: 'DPS', hp: 600, maxHp: 600, atk: 70, color: '#7f8c8d', slotIndex: 4, level: 2, stars: 1, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e1_5', name: 'Pháp Sư Đông Hán', role: 'Support', hp: 500, maxHp: 500, atk: 40, color: '#9b59b6', slotIndex: 5, level: 2, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 }
    ]
  },
  {
    id: 2,
    year: 'Năm 938',
    name: 'Ải 2: Sông Bạch Đằng 938',
    subtitle: 'Ngô Quyền Phá Quân Nam Hán - Năm 938',
    description: 'Chấm dứt 1000 năm Bắc thuộc bằng trận cọc nhọn trên sông Bạch Đằng lừng lẫy.',
    rewardGold: 1500,
    bossName: 'Lưu Hoằng Tháo',
    enemies: [
      { id: 'e2_0', name: 'Chiến Thuyền Nam Hán', role: 'Tank', hp: 1500, maxHp: 1500, atk: 80, color: '#1abc9c', slotIndex: 0, level: 5, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e2_1', name: 'Lưu Hoằng Tháo (Chủ Tướng)', role: 'DPS', hp: 3500, maxHp: 3500, atk: 160, color: '#2980b9', slotIndex: 1, level: 8, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100, skill: { name: 'Thủy Quân Nổi Giận', damageMultiplier: 1.8, rageSteal: 10 } },
      { id: 'e2_2', name: 'Chiến Thuyền Nam Hán', role: 'Tank', hp: 1500, maxHp: 1500, atk: 80, color: '#1abc9c', slotIndex: 2, level: 5, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e2_3', name: 'Thủy Binh Nam Hán', role: 'Assassin', hp: 1200, maxHp: 1200, atk: 120, color: '#16a085', slotIndex: 3, level: 6, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e2_4', name: 'Thủy Binh Nam Hán', role: 'Assassin', hp: 1200, maxHp: 1200, atk: 120, color: '#16a085', slotIndex: 4, level: 6, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e2_5', name: 'Chiến Hạm Chỉ Huy', role: 'Support', hp: 2000, maxHp: 2000, atk: 60, color: '#34495e', slotIndex: 5, level: 7, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 }
    ]
  },
  {
    id: 3,
    year: 'Năm 1288',
    name: 'Ải 3: Bạch Đằng Giang 1288',
    subtitle: 'Trần Hưng Đạo Phá Quân Nguyên Mông - Năm 1288',
    description: 'Đại phá hạm đội quân Nguyên Mông lần thứ 3, bắt sống Ô Mã Nhi trên sông Bạch Đằng.',
    rewardGold: 2200,
    bossName: 'Ô Mã Nhi',
    enemies: [
      { id: 'e3_0', name: 'Kỵ Binh Mông Cổ', role: 'Assassin', hp: 2500, maxHp: 2500, atk: 180, color: '#e67e22', slotIndex: 0, level: 10, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e3_1', name: 'Ô Mã Nhi (Đại Tướng)', role: 'Tank', hp: 5500, maxHp: 5500, atk: 220, color: '#d35400', slotIndex: 1, level: 12, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100, skill: { name: 'Thiết Kỵ Xung Phong', damageMultiplier: 1.5, rageRecovery: 20 } },
      { id: 'e3_2', name: 'Kỵ Binh Mông Cổ', role: 'Assassin', hp: 2500, maxHp: 2500, atk: 180, color: '#e67e22', slotIndex: 2, level: 10, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e3_3', name: 'Cung Kỵ Mông Cổ', role: 'DPS', hp: 2000, maxHp: 2000, atk: 200, color: '#d35400', slotIndex: 3, level: 10, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e3_4', name: 'Cung Kỵ Mông Cổ', role: 'DPS', hp: 2000, maxHp: 2000, atk: 200, color: '#d35400', slotIndex: 4, level: 10, stars: 2, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e3_5', name: 'Vu Sư Nguyên Mông', role: 'Support', hp: 2200, maxHp: 2200, atk: 120, color: '#c0392b', slotIndex: 5, level: 11, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 }
    ]
  },
  {
    id: 4,
    year: 'Năm 1427',
    name: 'Ải 4: Chiến Dịch Chi Lăng',
    subtitle: 'Lê Lợi & Nguyễn Trãi Khởi Nghĩa Lam Sơn - 1427',
    description: 'Trận Chi Lăng - Xương Giang tiệt hạ viện binh quân Minh, giành lại độc lập dân tộc.',
    rewardGold: 3200,
    bossName: 'Vương Thông',
    enemies: [
      { id: 'e4_0', name: 'Thiết Giáp Binh Minh', role: 'Tank', hp: 4500, maxHp: 4500, atk: 150, color: '#7f8c8d', slotIndex: 0, level: 14, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e4_1', name: 'Vương Thông (Tướng Minh)', role: 'Tank', hp: 8000, maxHp: 8000, atk: 300, color: '#e74c3c', slotIndex: 1, level: 16, stars: 5, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100, skill: { name: 'Thành Trì Bất Hoại', damageMultiplier: 1.2, rageRecovery: 50 } },
      { id: 'e4_2', name: 'Thiết Giáp Binh Minh', role: 'Tank', hp: 4500, maxHp: 4500, atk: 150, color: '#7f8c8d', slotIndex: 2, level: 14, stars: 3, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e4_3', name: 'Pháo Binh Nhà Minh', role: 'DPS', hp: 3500, maxHp: 3500, atk: 320, color: '#c0392b', slotIndex: 3, level: 15, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e4_4', name: 'Pháo Binh Nhà Minh', role: 'DPS', hp: 3500, maxHp: 3500, atk: 320, color: '#c0392b', slotIndex: 4, level: 15, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e4_5', name: 'Mưu Sĩ Nhà Minh', role: 'Support', hp: 3800, maxHp: 3800, atk: 180, color: '#9b59b6', slotIndex: 5, level: 15, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 }
    ]
  },
  {
    id: 5,
    year: 'Năm 1789',
    name: 'Ải 5: Ngọc Hồi - Đống Đa',
    subtitle: 'Quang Trung Khai Tốc Chiến - Năm 1789',
    description: 'Vua Quang Trung hành quân thần tốc, đại phá 29 vạn quân Thanh đêm Mùng 5 Tết.',
    rewardGold: 5000,
    bossName: 'Sầm Nghi Đống',
    enemies: [
      { id: 'e5_0', name: 'Bát Kỳ Binh Thanh', role: 'Assassin', hp: 6000, maxHp: 6000, atk: 350, color: '#f39c12', slotIndex: 0, level: 20, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e5_1', name: 'Sầm Nghi Đống (Đô Đốc)', role: 'DPS', hp: 12000, maxHp: 12000, atk: 500, color: '#c0392b', slotIndex: 1, level: 22, stars: 5, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100, skill: { name: 'Thanh Long Yển Nguyệt', damageMultiplier: 2.2, rageSteal: 30 } },
      { id: 'e5_2', name: 'Bát Kỳ Binh Thanh', role: 'Assassin', hp: 6000, maxHp: 6000, atk: 350, color: '#f39c12', slotIndex: 2, level: 20, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e5_3', name: 'Hỏa Mai Binh Thanh', role: 'DPS', hp: 5500, maxHp: 5500, atk: 450, color: '#e74c3c', slotIndex: 3, level: 21, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e5_4', name: 'Hỏa Mai Binh Thanh', role: 'DPS', hp: 5500, maxHp: 5500, atk: 450, color: '#e74c3c', slotIndex: 4, level: 21, stars: 4, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 },
      { id: 'e5_5', name: 'Đại Đô Đốc Tôn Sĩ Nghị', role: 'Support', hp: 8000, maxHp: 8000, atk: 300, color: '#8e44ad', slotIndex: 5, level: 22, stars: 5, equippedItemIds: [], isEnemy: true, rage: 0, maxRage: 100 }
    ]
  }
]

export const CAMPAIGN_STAGES: StageData[] = RAW_CAMPAIGN_STAGES.map(s => ({
  ...s,
  enemies: rehydrateHeroes(s.enemies)
}))
