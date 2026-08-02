import tranHungDaoAvatar from '../assets/heroes/avatars/tran_hung_dao.png'
import quangTrungAvatar from '../assets/heroes/avatars/quang_trung.png'
import haiBaTrungAvatar from '../assets/heroes/avatars/hai_ba_trung.png'
import baTrieuAvatar from '../assets/heroes/avatars/ba_trieu.png'

import tranHungDaoBg from '../assets/heroes/backgrounds/tran_hung_dao.png'
import quangTrungBg from '../assets/heroes/backgrounds/quang_trung.png'
import haiBaTrungBg from '../assets/heroes/backgrounds/hai_ba_trung.png'
import baTrieuBg from '../assets/heroes/backgrounds/ba_trieu.png'

export interface HeroData {
  id: string
  name: string
  role: 'Tank' | 'DPS' | 'Support' | 'Assassin'
  rarity?: 'UR' | 'SSR' | 'SR'
  title?: string
  hp: number
  maxHp: number
  atk: number
  color: string
  slotIndex: number // 0-5 cho vị trí ra trận, -1 cho vị trí dự bị
  level: number
  stars: number
  equippedItemIds: string[]
  avatarUrl?: string
  backgroundUrl?: string
  isEnemy?: boolean
  rage?: number
  maxRage?: number
  isMounted?: boolean
  hasFlamingBamboo?: boolean
  skill?: {
    name: string
    damageMultiplier: number
    rageRecovery?: number
    rageSteal?: number
  }
  synergy?: {
    partnerId: string
    skillName: string
  }
}

export const getRoleVietnameseInfo = (role: 'Tank' | 'DPS' | 'Support' | 'Assassin' | string) => {
  switch (role) {
    case 'Tank':
      return { 
        name: 'Vệ Binh (Phòng Thủ)', 
        short: 'Vệ Binh', 
        icon: '🛡️', 
        color: '#3b82f6', 
        desc: 'Đứng hàng trước chống chịu, có tỷ lệ Phản Kích khi bị tấn công.' 
      }
    case 'DPS':
      return { 
        name: 'Chủ Lực (Tấn Công)', 
        short: 'Chủ Lực', 
        icon: '⚔️', 
        color: '#ef4444', 
        desc: 'Gây sát thương lớn, tăng 35% tỷ lệ nổ Chí Mạng.' 
      }
    case 'Assassin':
      return { 
        name: 'Thích Khách (Bạo Kích)', 
        short: 'Thích Khách', 
        icon: '🗡️', 
        color: '#a855f7', 
        desc: '+60 Nộ khởi đầu, kích sát dứt điểm mục tiêu +50 Nộ.' 
      }
    case 'Support':
      return { 
        name: 'Hỗ Trợ (Trị Thương)', 
        short: 'Hỗ Trợ', 
        icon: '🌿', 
        color: '#10b981', 
        desc: 'Tăng nộ toàn đội đầu trận, đánh thường trị thương cho đồng đội.' 
      }
    default:
      return { 
        name: 'Võ Tướng', 
        short: 'Võ Tướng', 
        icon: '⚔️', 
        color: '#f1c40f', 
        desc: 'Võ tướng Đại Việt.' 
      }
  }
}

export const TEAM_GRID_SLOTS: [number, number, number][] = [
  // Frontline (closer to own side)
  [-1.8, 0.5, 2],
  [0, 0.5, 2],
  [1.8, 0.5, 2],
  // Backline (farther from own side)
  [-1.8, 0.5, 3.5],
  [0, 0.5, 3.5],
  [1.8, 0.5, 3.5],
];

export const get2DSlotPosition = (isEnemy: boolean, slotIndex: number): { left: string, top: string, zIndex: number } => {
  // Y coordinates (top): 25%, 50%, 75% for columns
  const tops = ['30%', '50%', '70%'];
  const colIndex = slotIndex % 3;
  const isBackline = slotIndex >= 3;
  
  if (isEnemy) {
    return {
      left: isBackline ? '85%' : '70%',
      top: tops[colIndex],
      zIndex: 10 + colIndex
    };
  } else {
    return {
      left: isBackline ? '15%' : '30%',
      top: tops[colIndex],
      zIndex: 10 + colIndex
    };
  }
}

export const MOCK_HEROES: HeroData[] = [
  {
    id: 'h7',
    name: 'Thánh Gióng',
    role: 'Assassin',
    rarity: 'UR',
    title: 'Phù Đổng Thiên Vương',
    hp: 4200,
    maxHp: 4200,
    atk: 580,
    color: '#e67e22',
    slotIndex: 0, // Xuất trận vị trí Ô 1 (Hàng trước)
    level: 30,
    stars: 5,
    equippedItemIds: ['item_1', 'item_2'],
    rage: 60,
    maxRage: 100,
    skill: {
      name: 'Phù Đổng Đoạt Mệnh',
      damageMultiplier: 3.2,
      rageRecovery: 30
    }
  },
  {
    id: 'h3',
    name: 'Trần Hưng Đạo',
    role: 'DPS',
    rarity: 'UR',
    title: 'Hưng Đạo Đại Vương',
    hp: 3800,
    maxHp: 3800,
    atk: 450,
    color: '#9333ea',
    slotIndex: 1, // Vị trí Ô 2
    level: 30,
    stars: 5,
    equippedItemIds: ['item_1', 'item_2'],
    avatarUrl: tranHungDaoAvatar,
    backgroundUrl: tranHungDaoBg,
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Vạn Kiếp Tông Bí Truyền',
      damageMultiplier: 2.5,
      rageRecovery: 20
    },
    synergy: {
      partnerId: 'h4', // Quang Trung
      skillName: 'Hào Khí Đại Việt'
    }
  },
  {
    id: 'h6',
    name: 'Bà Triệu',
    role: 'Tank',
    rarity: 'UR',
    title: 'Nhị Ha Nữ Vương',
    hp: 4500,
    maxHp: 4500,
    atk: 380,
    color: '#ec4899',
    slotIndex: 2, // Vị trí Ô 3
    level: 30,
    stars: 5,
    equippedItemIds: ['item_4'],
    avatarUrl: baTrieuAvatar,
    backgroundUrl: baTrieuBg,
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Đạp Luồng Sóng Dữ',
      damageMultiplier: 2.0,
      rageSteal: 20
    },
    synergy: {
      partnerId: 'h5', // Hai Bà Trưng
      skillName: 'Nữ Tướng Uy Phong'
    }
  },
  {
    id: 'h4',
    name: 'Quang Trung',
    role: 'DPS',
    rarity: 'UR',
    title: 'Bắc Bình Vương',
    hp: 3900,
    maxHp: 3900,
    atk: 480,
    color: '#e74c3c',
    slotIndex: 3, // Vị trí Ô 4
    level: 30,
    stars: 5,
    equippedItemIds: ['item_1'],
    avatarUrl: quangTrungAvatar,
    backgroundUrl: quangTrungBg,
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Hỏa Tốc Tiến Công',
      damageMultiplier: 2.8
    },
    synergy: {
      partnerId: 'h3', // Trần Hưng Đạo
      skillName: 'Hào Khí Đại Việt'
    }
  },
  {
    id: 'h5',
    name: 'Hai Bà Trưng',
    role: 'DPS',
    rarity: 'SSR',
    title: 'Trưng Vương',
    hp: 3200,
    maxHp: 3200,
    atk: 360,
    color: '#ec4899',
    slotIndex: 4, // Vị trí Ô 5
    level: 30,
    stars: 5,
    equippedItemIds: [],
    avatarUrl: haiBaTrungAvatar,
    backgroundUrl: haiBaTrungBg,
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Mê Linh Khởi Nghĩa',
      damageMultiplier: 2.2,
      rageRecovery: 30
    },
    synergy: {
      partnerId: 'h6', // Bà Triệu
      skillName: 'Nữ Tướng Uy Phong'
    }
  },
  {
    id: 'h2',
    name: 'Nguyễn Trãi',
    role: 'Support',
    rarity: 'SSR',
    title: 'Ức Trai Tiên Sinh',
    hp: 3000,
    maxHp: 3000,
    atk: 320,
    color: '#38bdf8',
    slotIndex: 5, // Vị trí Ô 6
    level: 30,
    stars: 5,
    equippedItemIds: ['item_3'],
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Bình Ngô Sách',
      damageMultiplier: 1.8,
      rageSteal: 25
    },
    synergy: {
      partnerId: 'h1', // Lê Lợi
      skillName: 'Bình Ngô Đại Cáo'
    }
  },
  {
    id: 'h1',
    name: 'Lê Lợi',
    role: 'DPS',
    rarity: 'SSR',
    title: 'Bình Định Vương',
    hp: 3400,
    maxHp: 3400,
    atk: 390,
    color: '#d4af37',
    slotIndex: -1, // Dự Bị sẵn sàng thay đổi bất cứ lúc nào
    level: 30,
    stars: 5,
    equippedItemIds: ['item_1'],
    rage: 0,
    maxRage: 100,
    skill: {
      name: 'Lam Sơn Kiếm Pháp',
      damageMultiplier: 2.2,
      rageRecovery: 20
    },
    synergy: {
      partnerId: 'h2', // Nguyễn Trãi
      skillName: 'Bình Ngô Đại Cáo'
    }
  }
]
