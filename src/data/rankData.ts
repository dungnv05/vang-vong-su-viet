export interface ImperialRank {
  level: number
  title: string
  icon: string
  color: string
  reqPower: number
  statBuffText: string
  dailySalaryGold: number
}

export const IMPERIAL_RANKS: ImperialRank[] = [
  { level: 1, title: 'Cử Nhân Đồng Tiến Sĩ', icon: '📜', color: '#94a3b8', reqPower: 0, statBuffText: '+2% Máu cho toàn đội', dailySalaryGold: 500 },
  { level: 2, title: 'Hàn Lâm Viện Thị Giảng', icon: '✒️', color: '#38bdf8', reqPower: 3000, statBuffText: '+5% Máu & +3% ATK toàn đội', dailySalaryGold: 1200 },
  { level: 3, title: 'Binh Bộ Tham Tri', icon: '🛡️', color: '#2ecc71', reqPower: 8000, statBuffText: '+8% ATK toàn đội', dailySalaryGold: 2500 },
  { level: 4, title: 'Đô Đốc Thuỷ Quân', icon: '⛵', color: '#a855f7', reqPower: 15000, statBuffText: '+12% Máu & +10% ATK toàn đội', dailySalaryGold: 5000 },
  { level: 5, title: 'Đại Tướng Quân Trấn Quốc', icon: '⚔️', color: '#f1c40f', reqPower: 25000, statBuffText: '+18% ATK & +15% HP toàn đội', dailySalaryGold: 10000 },
  { level: 6, title: 'Thái Sư Tể Tướng Hoàng Gia', icon: '👑', color: '#e74c3c', reqPower: 40000, statBuffText: '+25% Tấn Công & +25% Máu toàn đội', dailySalaryGold: 25000 }
]
