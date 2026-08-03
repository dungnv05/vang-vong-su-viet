export type HeroRarity = 'UR' | 'SSR' | 'SR' | 'R'

export interface RarityTheme {
  rarity: HeroRarity
  title: string           // Phẩm chất tiếng Việt (Thượng Cổ, Tuyệt Phẩm, Danh Tướng)
  hex: string             // Màu chủ đạo HEX
  rgb: string             // RGB string cho opacity (e.g. "239, 68, 68")
  textGradient: string    // CSS text gradient
  badgeBg: string         // CSS badge background
  borderHex: string       // Màu viền khung
  glowBoxShadow: string   // Hiệu ứng phát sáng
  avatarBorder: string    // Viền khung đại diện
  background: string      // Gradient nền thẻ card
}

export function getRarityTheme(rarity?: string): RarityTheme {
  const r = (rarity || 'SR').toUpperCase() as HeroRarity

  if (r === 'UR') {
    return {
      rarity: 'UR',
      title: 'THƯỢNG CỔ',
      hex: '#ef4444',
      rgb: '239, 68, 68',
      textGradient: 'linear-gradient(45deg, #ff7b7b, #ef4444, #b91c1c)',
      badgeBg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      borderHex: '#ef4444',
      glowBoxShadow: '0 0 25px rgba(239, 68, 68, 0.65)',
      avatarBorder: '2px solid #ef4444',
      background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)'
    }
  }

  if (r === 'SSR') {
    return {
      rarity: 'SSR',
      title: 'TUYỆT PHẨM',
      hex: '#f59e0b',
      rgb: '245, 158, 11',
      textGradient: 'linear-gradient(45deg, #fef08a, #f59e0b, #b45309)',
      badgeBg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
      borderHex: '#f59e0b',
      glowBoxShadow: '0 0 25px rgba(245, 158, 11, 0.65)',
      avatarBorder: '2px solid #f59e0b',
      background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)'
    }
  }

  // Default SR
  return {
    rarity: 'SR',
    title: 'DANH TƯỚNG',
    hex: '#a855f7',
    rgb: '168, 85, 247',
    textGradient: 'linear-gradient(45deg, #e9d5ff, #a855f7, #6b21a8)',
    badgeBg: 'linear-gradient(135deg, #9333ea 0%, #581c87 100%)',
    borderHex: '#a855f7',
    glowBoxShadow: '0 0 20px rgba(168, 85, 247, 0.55)',
    avatarBorder: '2px solid #a855f7',
    background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)'
  }
}
