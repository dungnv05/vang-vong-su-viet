export interface BeastData {
  id: string
  name: string
  title: string
  icon: string
  color: string
  auraText: string
  statBonus: {
    hpPercent?: number
    atkPercent?: number
  }
  description: string
  position: [number, number, number]
}

export const MOUNT_BEASTS: BeastData[] = [
  {
    id: 'beast_kim_quy',
    name: 'Rùa Vàng Kim Quy',
    title: 'Thần Thú Bảo Quốc',
    icon: '🐢',
    color: '#f1c40f', // Vàng Kim
    auraText: '+20% Máu Tối Đa cho toàn đội hình',
    statBonus: { hpPercent: 0.2 },
    description: 'Thần Kim Quy trao Nỏ Thần và gươm báu hộ quốc, ban kim quang che chở cho toàn quân.',
    position: [-5, 1, 2]
  },
  {
    id: 'beast_ngua_sat',
    name: 'Ngựa Sắt Thánh Gióng',
    title: 'Thần Thú Phù Đổng',
    icon: '🐎',
    color: '#e74c3c', // Đỏ Lửa
    auraText: '+15% Sức Tấn Công cho toàn đội hình',
    statBonus: { atkPercent: 0.15 },
    description: 'Ngựa sắt đúc bằng đồng lửa của Thánh Gióng, hí vang trời phun lửa thiêu rụi giặc Ân.',
    position: [-5, 1, 2]
  },
  {
    id: 'beast_voi_chien',
    name: 'Voi Chiến 9 Ngà',
    title: 'Linh Thú Sơn Tinh',
    icon: '🐘',
    color: '#2ecc71', // Xanh Lọc Sơn Lâm
    auraText: '+15% Giáp & Máu cho toàn đội hình',
    statBonus: { hpPercent: 0.15, atkPercent: 0.05 },
    description: 'Voi thần 9 ngà trong truyền thuyết Sơn Tinh, đồng hành cùng quân tướng dẫm nát trận đồ địch.',
    position: [-5, 1, 2]
  }
]
