import tranHungDaoAvatar from '../assets/heroes/avatars/tran_hung_dao.png'
import quangTrungAvatar from '../assets/heroes/avatars/quang_trung.png'
import haiBaTrungAvatar from '../assets/heroes/avatars/hai_ba_trung.png'
import baTrieuAvatar from '../assets/heroes/avatars/ba_trieu.png'

import tranHungDaoBg from '../assets/heroes/backgrounds/tran_hung_dao.png'
import quangTrungBg from '../assets/heroes/backgrounds/quang_trung.png'
import haiBaTrungBg from '../assets/heroes/backgrounds/hai_ba_trung.png'
import baTrieuBg from '../assets/heroes/backgrounds/ba_trieu.png'

import { rehydrateHeroes } from './heroes'

export interface GachaHeroTemplate {
  name: string
  role: 'Tank' | 'DPS' | 'Support' | 'Assassin'
  rarity: 'UR' | 'SSR' | 'SR'
  title: string
  quote: string
  hp: number
  maxHp: number
  atk: number
  color: string
  level: number
  stars: number
  avatarUrl?: string
  backgroundUrl?: string
  rage?: number
  maxRage?: number
  skill?: {
    name: string
    damageMultiplier: number
    rageRecovery?: number
    rageSteal?: number
  }
}

const RAW_GACHA_HERO_POOL: GachaHeroTemplate[] = [
  // HẠNG UR (CỰC PHẨM THÁI BÌNH)
  {
    name: 'Trần Hưng Đạo',
    role: 'DPS',
    rarity: 'UR',
    title: 'Hưng Đạo Đại Vương',
    quote: 'Bệ hạ chém đầu tôi trước rồi hãy hàng!',
    hp: 2800,
    maxHp: 2800,
    atk: 380,
    color: '#9333ea',
    level: 1,
    stars: 1,
    avatarUrl: tranHungDaoAvatar,
    backgroundUrl: tranHungDaoBg,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Vạn Kiếp Tông Bí Truyền', damageMultiplier: 2.2, rageRecovery: 10 }
  },
  {
    name: 'Quang Trung',
    role: 'DPS',
    rarity: 'UR',
    title: 'Bắc Bình Vương',
    quote: 'Đánh cho lịch sử biết rằng nước Nam ta là có chủ!',
    hp: 2600,
    maxHp: 2600,
    atk: 400,
    color: '#e74c3c',
    level: 1,
    stars: 1,
    avatarUrl: quangTrungAvatar,
    backgroundUrl: quangTrungBg,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Hỏa Tốc Tiến Công', damageMultiplier: 2.5 }
  },
  {
    name: 'Bà Triệu',
    role: 'Tank',
    rarity: 'UR',
    title: 'Nhị Ha Nữ Vương',
    quote: 'Tôi muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông!',
    hp: 3400,
    maxHp: 3400,
    atk: 320,
    color: '#ec4899',
    level: 1,
    stars: 1,
    avatarUrl: baTrieuAvatar,
    backgroundUrl: baTrieuBg,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Đạp Luồng Sóng Dữ', damageMultiplier: 1.8, rageSteal: 15 }
  },
  {
    name: 'Đinh Tiên Hoàng',
    role: 'DPS',
    rarity: 'UR',
    title: 'Vạn Thắng Vương',
    quote: 'Dẹp loạn 12 sứ quân, dựng nền độc lập Đại Cồ Việt!',
    hp: 3000,
    maxHp: 3000,
    atk: 370,
    color: '#f1c40f',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Vạn Thắng Cờ Lau', damageMultiplier: 2.0, rageRecovery: 20 }
  },
  {
    name: 'Trần Quốc Toản',
    role: 'Assassin',
    rarity: 'UR',
    title: 'Hoài Văn Hou',
    quote: 'Phá cờ đại nghĩa, sát giặc lập công!',
    hp: 2500,
    maxHp: 2500,
    atk: 390,
    color: '#ef4444',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Phá Cường Địch', damageMultiplier: 2.3 }
  },

  // HẠNG SSR (THIÊN HẠ DANH TƯỚNG)
  {
    name: 'Ngô Quyền',
    role: 'Tank',
    rarity: 'SSR',
    title: 'Tiền Ngô Vương',
    quote: 'Cắm cọc nhọn bọc sắt diệt quân Nam Hán!',
    hp: 2400,
    maxHp: 2400,
    atk: 220,
    color: '#2ecc71',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Bạch Đằng Phục Kích', damageMultiplier: 1.8, rageSteal: 10 }
  },
  {
    name: 'Lê Lợi',
    role: 'DPS',
    rarity: 'SSR',
    title: 'Bình Định Vương',
    quote: 'Nương mình chốn hoang dại, dốc lòng vì nước!',
    hp: 1800,
    maxHp: 1800,
    atk: 250,
    color: '#d4af37',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Lam Sơn Kiếm Pháp', damageMultiplier: 2.0, rageRecovery: 20 }
  },
  {
    name: 'Nguyễn Trãi',
    role: 'Support',
    rarity: 'SSR',
    title: 'Ức Trai Tiên Sinh',
    quote: 'Việc nhân nghĩa cốt ở yên dân!',
    hp: 1500,
    maxHp: 1500,
    atk: 180,
    color: '#38bdf8',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Bình Ngô Sách', damageMultiplier: 1.5, rageSteal: 20 }
  },
  {
    name: 'Hai Bà Trưng',
    role: 'DPS',
    rarity: 'SSR',
    title: 'Trưng Vương',
    quote: 'Một xin rửa sạch nợ nước, hai xin dựng lại nghiệp xưa họ Hùng!',
    hp: 1700,
    maxHp: 1700,
    atk: 240,
    color: '#ec4899',
    level: 1,
    stars: 1,
    avatarUrl: haiBaTrungAvatar,
    backgroundUrl: haiBaTrungBg,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Mê Linh Khởi Nghĩa', damageMultiplier: 2.0, rageRecovery: 30 }
  },
  {
    name: 'Lý Thường Kiệt',
    role: 'Support',
    rarity: 'SSR',
    title: 'Thái Úy Quốc Công',
    quote: 'Nam quốc sơn hà Nam đế cư!',
    hp: 1600,
    maxHp: 1600,
    atk: 210,
    color: '#38bdf8',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Nam Quốc Sơn Hà', damageMultiplier: 1.6, rageSteal: 15 }
  },
  {
    name: 'Lê Đại Hành',
    role: 'Tank',
    rarity: 'SSR',
    title: 'Lê Hoàn Hoàng Đế',
    quote: 'Phá Tống bình Chiêm, bảo vệ bờ cõi!',
    hp: 2300,
    maxHp: 2300,
    atk: 200,
    color: '#059669',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Phá Tống Bình Chiêm', damageMultiplier: 1.9, rageRecovery: 15 }
  },
  {
    name: 'Bố Cái Đại Vương',
    role: 'Tank',
    rarity: 'SSR',
    title: 'Phùng Hưng',
    quote: 'Sức quật hổ đánh voi, giành lại Đường Lâm!',
    hp: 2500,
    maxHp: 2500,
    atk: 190,
    color: '#10b981',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Quật Khởi Đường Lâm', damageMultiplier: 1.7, rageSteal: 5 }
  },

  // HẠNG SR (DANH TƯỚNG DŨNG CẢM)
  {
    name: 'Phạm Ngũ Lão',
    role: 'DPS',
    rarity: 'SR',
    title: 'Điện Thần Tướng Quân',
    quote: 'Múa giáo đâm trâu, lập công báo quốc!',
    hp: 1400,
    maxHp: 1400,
    atk: 180,
    color: '#2ecc71',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Múa Giáo Đâm Trâu', damageMultiplier: 2.1 }
  },
  {
    name: 'Yết Kiêu',
    role: 'Assassin',
    rarity: 'SR',
    title: 'Thần Thủy Chiến',
    quote: 'Lặn sâu đục thuyền giặc Mông Cổ!',
    hp: 1300,
    maxHp: 1300,
    atk: 160,
    color: '#0284c7',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Thần Thủy Đục Thuyền', damageMultiplier: 1.6, rageSteal: 20 }
  },
  {
    name: 'Dã Tượng',
    role: 'Tank',
    rarity: 'SR',
    title: 'Tướng Quân Huấn Luyện Voi',
    quote: 'Điều khiển bầy voi chiến xông trận!',
    hp: 1800,
    maxHp: 1800,
    atk: 140,
    color: '#65a30d',
    level: 1,
    stars: 1,
    rage: 0,
    maxRage: 100,
    skill: { name: 'Tượng Binh Xung Kích', damageMultiplier: 1.7, rageRecovery: 10 }
  }
]

export const GACHA_HERO_POOL: GachaHeroTemplate[] = rehydrateHeroes(RAW_GACHA_HERO_POOL)
