import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { X, Users, Zap, Swords } from 'lucide-react'
import { type HeroData } from '../../data/heroes'
import { getRarityTheme } from '../../utils/rarityColors'

// Hàm tính Lực Chiến (Combat Power Score)
export function getPowerScore(hero: HeroData): number {
  const rarityBonus = hero.rarity === 'UR' ? 2000 : hero.rarity === 'SSR' ? 1000 : 0
  return (hero.atk * 4) + hero.maxHp + (hero.stars * 500) + (hero.level * 100) + rarityBonus
}

// Trọng số phẩm cấp Rarity
const RARITY_WEIGHT: Record<string, number> = {
  'UR': 3,
  'SSR': 2,
  'SR': 1
}

export default function SquadModal() {
  const showSquadModal = useGameStore(state => state.showSquadModal)
  const setShowSquadModal = useGameStore(state => state.setShowSquadModal)
  const heroes = useGameStore(state => state.heroes)
  const deployHeroToSlot = useGameStore(state => state.deployHeroToSlot)
  const benchHero = useGameStore(state => state.benchHero)

  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'UR' | 'SSR' | 'SR'>('ALL')

  if (!showSquadModal) return null

  // Tướng đang trong 6 ô chiến đấu
  const activeHeroes = heroes.filter(h => h.slotIndex >= 0)
  
  // Tướng dự bị (Slot -1) -> SẮP XẾP MẶC ĐỊNH THEO ĐỘ HIẾM VÀ LỰC CHIẾN (Giảm dần)
  const reserveHeroes = heroes
    .filter(h => h.slotIndex === -1)
    .filter(h => rarityFilter === 'ALL' || (h.rarity || 'SR') === rarityFilter)
    .sort((a, b) => {
      const rarityA = RARITY_WEIGHT[a.rarity || 'SR'] || 1
      const rarityB = RARITY_WEIGHT[b.rarity || 'SR'] || 1

      // 1. So sánh Độ Hiếm Rarity (UR > SSR > SR)
      if (rarityB !== rarityA) {
        return rarityB - rarityA
      }
      // 2. Nếu cùng Độ Hiếm, so sánh Lực Chiến giảm dần
      return getPowerScore(b) - getPowerScore(a)
    })

  // Kiểm tra kích hoạt Duyên Phận / Hợp Kích
  const hasLeLoi = activeHeroes.some(h => h.name.includes('Lê Lợi'))
  const hasNguyenTrai = activeHeroes.some(h => h.name.includes('Nguyễn Trãi'))
  const isLamSonActive = hasLeLoi && hasNguyenTrai

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 10, 20, 0.95)',
      
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(56, 189, 248, 0.25)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowSquadModal(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="#38bdf8" /> Quản Lý Đội Hình Xuất Trận ({activeHeroes.length}/6)
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Sắp xếp vị trí 6 ô lưới bàn cờ và chọn các vị tướng có Lực Chiến cao nhất vào đội hình.
        </p>

        {/* Thanh Duyên Phận / Synergy Status */}
        <div style={{
          background: isLamSonActive ? 'rgba(241, 196, 15, 0.15)' : 'rgba(30, 41, 59, 0.5)',
          border: isLamSonActive ? '1px solid #f1c40f' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Zap color={isLamSonActive ? "#f1c40f" : "#64748b"} />
          <div>
            <div style={{ fontWeight: 'bold', color: isLamSonActive ? '#fef08a' : '#94a3b8', fontSize: '0.95rem' }}>
              Duyên Phận Hợp Kích: Lam Sơn Nghĩa Khí (Lê Lợi + Nguyễn Trãi)
            </div>
            <div style={{ fontSize: '0.8rem', color: isLamSonActive ? '#2ecc71' : '#64748b', marginTop: '2px' }}>
              {isLamSonActive ? '✅ ĐÃ KÍCH HOẠT: Mở khóa chiêu Hợp Kích lật kèo 3D toàn bản đồ!' : '❌ Chưa đủ tướng: Cần cả Lê Lợi & Nguyễn Trãi cùng ra trận.'}
            </div>
          </div>
        </div>

        {/* Đội Hình Chiến Đấu 6 Ô Lưới */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#fef08a' }}>
            ⚔️ Vị Trí Ô Lưới Trên Bàn Cờ 3D (Hàng Trước & Hàng Sau)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {Array.from({ length: 6 }).map((_, slotIdx) => {
              const heroInSlot = activeHeroes.find(h => h.slotIndex === slotIdx)

              return (
                <div 
                  key={`squad-slot-${slotIdx}`}
                  style={{
                    background: heroInSlot ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.4)',
                    border: heroInSlot ? `2px solid ${heroInSlot.color}` : '1.5px dashed #475569',
                    borderRadius: '14px',
                    padding: '12px 6px',
                    textAlign: 'center',
                    minHeight: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>
                    Ô {slotIdx + 1} {slotIdx < 3 ? '(Tiền)' : '(Hậu)'}
                  </div>

                  {heroInSlot ? (
                    <div>
                      {heroInSlot.avatarUrl ? (
                        <img 
                          src={heroInSlot.avatarUrl} 
                          alt={heroInSlot.name} 
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: `1.5px solid ${heroInSlot.color}`,
                            margin: '4px 0'
                          }} 
                        />
                      ) : (
                        <div style={{ fontSize: '1.6rem' }}>🏛️</div>
                      )}
                      <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: heroInSlot.color }}>
                        {heroInSlot.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#f1c40f', fontWeight: 'bold', marginTop: '2px' }}>
                        ⚔️ {getPowerScore(heroInSlot).toLocaleString()}
                      </div>
                      <button
                        onClick={() => benchHero(heroInSlot.id)}
                        style={{
                          marginTop: '6px',
                          background: 'rgba(231, 76, 60, 0.2)',
                          border: '1px solid #e74c3c',
                          color: '#ff4d4d',
                          borderRadius: '8px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Tháo
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', margin: 'auto' }}>
                      (Trống)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Kho Tướng Dự Bị (Phân loại theo Màu Phẩm Chất Rarity & Lực Chiến) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#cbd5e1' }}>
              📦 Kho Tướng Dự Bị ({reserveHeroes.length} Tướng)
            </h3>

            {/* Thanh Bộ Lọc Màu Phẩm Chất (Rarity Filter Bar) */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[
                { key: 'ALL', label: 'Tất Cả', color: '#94a3b8' },
                { key: 'UR', label: '🔴 UR (Thượng Cổ)', color: '#ef4444' },
                { key: 'SSR', label: '🟡 SSR (Tuyệt Phẩm)', color: '#f59e0b' },
                { key: 'SR', label: '🟣 SR (Danh Tướng)', color: '#a855f7' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setRarityFilter(f.key as any)}
                  style={{
                    background: rarityFilter === f.key ? f.color : 'rgba(30, 41, 59, 0.6)',
                    color: rarityFilter === f.key ? '#ffffff' : '#cbd5e1',
                    border: `1px solid ${rarityFilter === f.key ? f.color : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: rarityFilter === f.key ? `0 0 10px ${f.color}66` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {reserveHeroes.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
              Không có tướng thuộc phẩm chất này trong kho dự bị!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '170px', overflowY: 'auto', paddingRight: '4px' }}>
              {reserveHeroes.map(hero => {
                const power = getPowerScore(hero)
                const theme = getRarityTheme(hero.rarity)

                return (
                  <div 
                    key={hero.id}
                    style={{
                      background: theme.background,
                      border: `1.5px solid ${theme.borderHex}`,
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      justifyContent: 'space-between',
                      boxShadow: theme.glowBoxShadow
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hero.avatarUrl ? (
                        <img 
                          src={hero.avatarUrl} 
                          alt={hero.name} 
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: `1.5px solid ${theme.borderHex}`
                          }} 
                        />
                      ) : (
                        <div style={{ fontSize: '1.4rem' }}>🏛️</div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            background: theme.badgeBg,
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            padding: '1px 5px',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                          }}>
                            {hero.rarity || 'SR'}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: theme.hex }}>
                            {hero.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#fef08a', marginTop: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Swords size={12} color="#f1c40f" /> {power.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const occupied = new Set(activeHeroes.map(h => h.slotIndex))
                        for (let s = 0; s < 6; s++) {
                          if (!occupied.has(s)) {
                            deployHeroToSlot(hero.id, s)
                            break
                          }
                        }
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #059669, #10b981)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Xuất
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
