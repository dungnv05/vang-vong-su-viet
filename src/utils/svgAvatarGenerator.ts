/**
 * Dynamic SVG Avatar & Standee Generator for Heroes & Monsters
 * Generates HD vector artwork data URIs for characters without static PNG assets.
 */

export function createSvgDataUri(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  return `data:image/svg+xml;utf8,${encoded}`
}

export function getCharacterAvatarSvg(name: string, color: string = '#f59e0b', icon: string = '⚔️'): string {
  const isMonster = name.includes('Lính') || name.includes('Thái Thú') || name.includes('Tướng') || name.includes('Đô Đốc') || name.includes('Quân') || name.includes('Tô Định') || name.includes('Ô Mã Nhi') || name.includes('Sầm Nghi Đống') || name.includes('Thuyền')
  const bgGradientStart = isMonster ? '#1e1b4b' : '#0f172a'
  const bgGradientEnd = isMonster ? '#450a0a' : '#1e1b4b'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradientStart}" />
        <stop offset="100%" stop-color="${bgGradientEnd}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="256" height="256" rx="36" fill="url(#bg)" stroke="${color}" stroke-width="4"/>
    <circle cx="128" cy="128" r="100" fill="url(#glow)"/>
    <circle cx="128" cy="128" r="70" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6,6"/>
    <text x="128" y="145" font-size="80" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <rect x="16" y="196" width="224" height="40" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="${color}" stroke-width="1.5"/>
    <text x="128" y="222" font-size="16" font-family="'Segoe UI', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">${name}</text>
  </svg>`

  return createSvgDataUri(svg)
}

// Preset custom SVG Data URIs for Heroes & Bosses
export const CUSTOM_CHARACTER_AVATARS: Record<string, string> = {
  'Thánh Gióng': getCharacterAvatarSvg('Thánh Gióng', '#f59e0b', '🐎'),
  'thanh_giong': getCharacterAvatarSvg('Thánh Gióng', '#f59e0b', '🐎'),
  'h7': getCharacterAvatarSvg('Thánh Gióng', '#f59e0b', '🐎'),

  'Nguyễn Trãi': getCharacterAvatarSvg('Nguyễn Trãi', '#38bdf8', '📜'),
  'nguyen_trai': getCharacterAvatarSvg('Nguyễn Trãi', '#38bdf8', '📜'),
  'h2': getCharacterAvatarSvg('Nguyễn Trãi', '#38bdf8', '📜'),

  'Lê Lợi': getCharacterAvatarSvg('Lê Lợi', '#eab308', '🗡️'),
  'le_loi': getCharacterAvatarSvg('Lê Lợi', '#eab308', '🗡️'),
  'h1': getCharacterAvatarSvg('Lê Lợi', '#eab308', '🗡️'),

  // Enemies & Monster Bosses
  'Tô Định': getCharacterAvatarSvg('Tô Định', '#ef4444', '🦹‍♂️'),
  'Tô Định (Thái Thú Đông Hán)': getCharacterAvatarSvg('Tô Định', '#ef4444', '🦹‍♂️'),
  'Lưu Hoằng Tháo': getCharacterAvatarSvg('Lưu Hoằng Tháo', '#06b6d4', '⛵'),
  'Lưu Hoằng Tháo (Chủ Tướng)': getCharacterAvatarSvg('Lưu Hoằng Tháo', '#06b6d4', '⛵'),
  'Ô Mã Nhi': getCharacterAvatarSvg('Ô Mã Nhi', '#f97316', '👹'),
  'Ô Mã Nhi (Đại Tướng)': getCharacterAvatarSvg('Ô Mã Nhi', '#f97316', '👹'),
  'Vương Thông': getCharacterAvatarSvg('Vương Thông', '#64748b', '🛡️'),
  'Vương Thông (Tướng Minh)': getCharacterAvatarSvg('Vương Thông', '#64748b', '🛡️'),
  'Sầm Nghi Đống': getCharacterAvatarSvg('Sầm Nghi Đống', '#dc2626', '🐯'),
  'Sầm Nghi Đống (Đô Đốc)': getCharacterAvatarSvg('Sầm Nghi Đống', '#dc2626', '🐯'),
  'Lính Tiên Phong Hán': getCharacterAvatarSvg('Lính Tiên Phong', '#475569', '🛡️'),
  'Cung Thủ Đông Hán': getCharacterAvatarSvg('Cung Thủ Hán', '#475569', '🏹'),
  'Pháp Sư Đông Hán': getCharacterAvatarSvg('Pháp Sư Hán', '#a855f7', '🔮'),
  'Chiến Thuyền Nam Hán': getCharacterAvatarSvg('Chiến Thuyền', '#0284c7', '🛶'),
  'Thủy Binh Nam Hán': getCharacterAvatarSvg('Thủy Binh', '#0284c7', '🌊'),
  'Chiến Hạm Chỉ Huy': getCharacterAvatarSvg('Hạm Chỉ Huy', '#0369a1', '⚓'),
  'Kỵ Binh Mông Cổ': getCharacterAvatarSvg('Kỵ Binh Mông Cổ', '#d97706', '🏇'),
  'Cung Kỵ Mông Cổ': getCharacterAvatarSvg('Cung Kỵ Mông Cổ', '#d97706', '🏹'),
  'Vu Sư Nguyên Mông': getCharacterAvatarSvg('Vu Sư Mông Cổ', '#9333ea', '💀'),
  'Thiết Giáp Binh Minh': getCharacterAvatarSvg('Thiết Giáp Binh', '#475569', '🛡️'),
  'Pháo Binh Nhà Minh': getCharacterAvatarSvg('Pháo Binh Minh', '#ea580c', '💣'),
  'Mưu Sĩ Nhà Minh': getCharacterAvatarSvg('Mưu Sĩ Minh', '#7c3aed', '📜'),
  'Bát Kỳ Binh Thanh': getCharacterAvatarSvg('Bát Kỳ Binh', '#ca8a04', '🐎'),
  'Hỏa Mai Binh Thanh': getCharacterAvatarSvg('Hỏa Mai Binh', '#dc2626', '💥'),
  'Đại Đô Đốc Tôn Sĩ Nghị': getCharacterAvatarSvg('Tôn Sĩ Nghị', '#991b1b', '👑')
}

export function getFallbackAvatar(nameOrId: string, color?: string): string {
  if (CUSTOM_CHARACTER_AVATARS[nameOrId]) {
    return CUSTOM_CHARACTER_AVATARS[nameOrId]
  }
  return getCharacterAvatarSvg(nameOrId, color || '#f59e0b', '⚔️')
}
