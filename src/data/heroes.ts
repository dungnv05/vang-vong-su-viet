import tranHungDaoAvatar from '../assets/heroes/avatars/tran_hung_dao.png'
import quangTrungAvatar from '../assets/heroes/avatars/quang_trung.png'
import haiBaTrungAvatar from '../assets/heroes/avatars/hai_ba_trung.png'
import baTrieuAvatar from '../assets/heroes/avatars/ba_trieu.png'
import thanhGiongAvatar from '../assets/heroes/avatars/thanh_giong.png'
import leLoiAvatar from '../assets/heroes/avatars/le_loi.png'
import nguyenTraiAvatar from '../assets/heroes/avatars/nguyen_trai.png'
import boCaiDaiVuongAvatar from '../assets/heroes/avatars/bo_cai_dai_vuong.png'
import daTuongAvatar from '../assets/heroes/avatars/da_tuong.png'
import dinhTienHoangAvatar from '../assets/heroes/avatars/dinh_tien_hoang.png'
import leDaiHanhAvatar from '../assets/heroes/avatars/le_dai_hanh.png'
import lyThuongKietAvatar from '../assets/heroes/avatars/ly_thuong_kiet.png'
import ngoQuyenAvatar from '../assets/heroes/avatars/ngo_quyen.png'
import phamNguLaoAvatar from '../assets/heroes/avatars/pham_ngu_lao.png'
import tranQuocToanAvatar from '../assets/heroes/avatars/tran_quoc_toan.png'
import yetKieuAvatar from '../assets/heroes/avatars/yet_kieu.png'

import tranHungDaoBg from '../assets/heroes/backgrounds/tran_hung_dao.png'
import quangTrungBg from '../assets/heroes/backgrounds/quang_trung.png'
import haiBaTrungBg from '../assets/heroes/backgrounds/hai_ba_trung.png'
import baTrieuBg from '../assets/heroes/backgrounds/ba_trieu.png'
import thanhGiongBg from '../assets/heroes/backgrounds/thanh_giong.png'
import leLoiBg from '../assets/heroes/backgrounds/le_loi.png'
import nguyenTraiBg from '../assets/heroes/backgrounds/nguyen_trai.png'

// Monsters PNG Avatars
import toDinhAvatar from '../assets/monsters/avatars/to_dinh.png'
import luuHoangThaoAvatar from '../assets/monsters/avatars/luu_hoang_thao.png'
import oMaNhiAvatar from '../assets/monsters/avatars/o_ma_nhi.png'
import vuongThongAvatar from '../assets/monsters/avatars/vuong_thong.png'
import samNghiDongAvatar from '../assets/monsters/avatars/sam_nghi_dong.png'
import linhHanAvatar from '../assets/monsters/avatars/linh_han.png'
import kyBinhAvatar from '../assets/monsters/avatars/ky_binh.png'
import batKyAvatar from '../assets/monsters/avatars/bat_ky.png'

export const HERO_AVATAR_MAP: Record<string, string> = {
  'h3': tranHungDaoAvatar,
  'h4': quangTrungAvatar,
  'h5': haiBaTrungAvatar,
  'h6': baTrieuAvatar,
  'h7': thanhGiongAvatar,
  'h1': leLoiAvatar,
  'h2': nguyenTraiAvatar,

  'tran_hung_dao': tranHungDaoAvatar,
  'quang_trung': quangTrungAvatar,
  'hai_ba_trung': haiBaTrungAvatar,
  'ba_trieu': baTrieuAvatar,
  'thanh_giong': thanhGiongAvatar,
  'le_loi': leLoiAvatar,
  'nguyen_trai': nguyenTraiAvatar,
  'bo_cai_dai_vuong': boCaiDaiVuongAvatar,
  'da_tuong': daTuongAvatar,
  'dinh_tien_hoang': dinhTienHoangAvatar,
  'le_dai_hanh': leDaiHanhAvatar,
  'ly_thuong_kiet': lyThuongKietAvatar,
  'ngo_quyen': ngoQuyenAvatar,
  'pham_ngu_lao': phamNguLaoAvatar,
  'tran_quoc_toan': tranQuocToanAvatar,
  'yet_kieu': yetKieuAvatar,

  'Trần Hưng Đạo': tranHungDaoAvatar,
  'Quang Trung': quangTrungAvatar,
  'Hai Bà Trưng': haiBaTrungAvatar,
  'Bà Triệu': baTrieuAvatar,
  'Thánh Gióng': thanhGiongAvatar,
  'Lê Lợi': leLoiAvatar,
  'Nguyễn Trãi': nguyenTraiAvatar,
  'Bố Cái Đại Vương': boCaiDaiVuongAvatar,
  'Phùng Hưng': boCaiDaiVuongAvatar,
  'Dã Tượng': daTuongAvatar,
  'Đinh Tiên Hoàng': dinhTienHoangAvatar,
  'Lê Đại Hành': leDaiHanhAvatar,
  'Lý Thường Kiệt': lyThuongKietAvatar,
  'Ngô Quyền': ngoQuyenAvatar,
  'Phạm Ngũ Lão': phamNguLaoAvatar,
  'Trần Quốc Toản': tranQuocToanAvatar,
  'Yết Kiêu': yetKieuAvatar,

  // Monsters
  'Tô Định': toDinhAvatar,
  'Tô Định (Thái Thú Đông Hán)': toDinhAvatar,
  'Lưu Hoằng Tháo': luuHoangThaoAvatar,
  'Lưu Hoằng Tháo (Chủ Tướng)': luuHoangThaoAvatar,
  'Ô Mã Nhi': oMaNhiAvatar,
  'Ô Mã Nhi (Đại Tướng)': oMaNhiAvatar,
  'Vương Thông': vuongThongAvatar,
  'Vương Thông (Tướng Minh)': vuongThongAvatar,
  'Sầm Nghi Đống': samNghiDongAvatar,
  'Sầm Nghi Đống (Đô Đốc)': samNghiDongAvatar,
  'Lính Tiên Phong Hán': linhHanAvatar,
  'Cung Thủ Đông Hán': linhHanAvatar,
  'Pháp Sư Đông Hán': linhHanAvatar,
  'Chiến Thuyền Nam Hán': luuHoangThaoAvatar,
  'Thủy Binh Nam Hán': luuHoangThaoAvatar,
  'Chiến Hạm Chỉ Huy': luuHoangThaoAvatar,
  'Kỵ Binh Mông Cổ': kyBinhAvatar,
  'Cung Kỵ Mông Cổ': kyBinhAvatar,
  'Vu Sư Nguyên Mông': oMaNhiAvatar,
  'Thiết Giáp Binh Minh': vuongThongAvatar,
  'Pháo Binh Nhà Minh': vuongThongAvatar,
  'Mưu Sĩ Nhà Minh': vuongThongAvatar,
  'Bát Kỳ Binh Thanh': batKyAvatar,
  'Hỏa Mai Binh Thanh': batKyAvatar,
  'Đại Đô Đốc Tôn Sĩ Nghị': samNghiDongAvatar
}

export const HERO_BACKGROUND_MAP: Record<string, string> = {
  'h3': tranHungDaoBg,
  'h4': quangTrungBg,
  'h5': haiBaTrungBg,
  'h6': baTrieuBg,
  'h7': thanhGiongBg,
  'h1': leLoiBg,
  'h2': nguyenTraiBg,

  'tran_hung_dao': tranHungDaoBg,
  'quang_trung': quangTrungBg,
  'hai_ba_trung': haiBaTrungBg,
  'ba_trieu': baTrieuBg,
  'thanh_giong': thanhGiongBg,
  'le_loi': leLoiBg,
  'nguyen_trai': nguyenTraiBg,

  'Trần Hưng Đạo': tranHungDaoBg,
  'Quang Trung': quangTrungBg,
  'Hai Bà Trưng': haiBaTrungBg,
  'Bà Triệu': baTrieuBg,
  'Thánh Gióng': thanhGiongBg,
  'Lê Lợi': leLoiBg,
  'Nguyễn Trãi': nguyenTraiBg
}

import { getFallbackAvatar } from '../utils/svgAvatarGenerator'

export function getHeroAvatarUrl(heroIdOrName?: string, color?: string): string | undefined {
  if (!heroIdOrName) return undefined
  const mapped = HERO_AVATAR_MAP[heroIdOrName] || HERO_AVATAR_MAP[heroIdOrName.toLowerCase()]
  if (mapped) return mapped
  return getFallbackAvatar(heroIdOrName, color)
}

export function getHeroBackgroundUrl(heroIdOrName?: string): string | undefined {
  if (!heroIdOrName) return undefined
  return HERO_BACKGROUND_MAP[heroIdOrName] || HERO_BACKGROUND_MAP[heroIdOrName.toLowerCase()]
}

export function rehydrateHero<T extends { id?: string; name?: string; color?: string; avatarUrl?: string; backgroundUrl?: string }>(hero: T): T {
  const realAvatar = (hero.name ? HERO_AVATAR_MAP[hero.name] : undefined) || (hero.id ? HERO_AVATAR_MAP[hero.id] : undefined)
  const realBg = (hero.name ? HERO_BACKGROUND_MAP[hero.name] : undefined) || (hero.id ? HERO_BACKGROUND_MAP[hero.id] : undefined)

  const avatar = realAvatar || getHeroAvatarUrl(hero.name, hero.color) || getHeroAvatarUrl(hero.id, hero.color) || hero.avatarUrl
  const bg = realBg || getHeroBackgroundUrl(hero.name) || getHeroBackgroundUrl(hero.id) || hero.backgroundUrl || avatar

  return {
    ...hero,
    avatarUrl: avatar,
    backgroundUrl: bg
  }
}

export function rehydrateHeroes<T extends { id?: string; name?: string; avatarUrl?: string; backgroundUrl?: string }>(heroes: T[]): T[] {
  if (!Array.isArray(heroes)) return []
  return heroes.map(rehydrateHero)
}

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

const RAW_MOCK_HEROES: HeroData[] = [
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
    avatarUrl: thanhGiongAvatar,
    backgroundUrl: thanhGiongBg,
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
    avatarUrl: nguyenTraiAvatar,
    backgroundUrl: nguyenTraiBg,
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
    avatarUrl: leLoiAvatar,
    backgroundUrl: leLoiBg,
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

export const MOCK_HEROES: HeroData[] = rehydrateHeroes(RAW_MOCK_HEROES)
