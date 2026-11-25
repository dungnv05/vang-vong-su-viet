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
    <div onClick={() => setShowSquadModal(false)} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--vv-overlay)',
      
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--vv-panel-grad)',
        border: '2px solid var(--vv-sky)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-sky-shadow)',
        color: 'var(--vv-text)',
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
            color: 'var(--vv-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-sky)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="var(--vv-sky)" /> Quản Lý Đội Hình Xuất Trận ({activeHeroes.length}/6)
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Sắp xếp vị trí 6 ô lưới bàn cờ và chọn các vị tướng có Lực Chiến cao nhất vào đội hình.
        </p>

        {/* Thanh Duyên Phận / Synergy Status */}
        <div style={{
          background: isLamSonActive ? 'var(--vv-gold-tint)' : 'var(--vv-surface-2-alpha)',
          border: isLamSonActive ? '1px solid var(--vv-gold-border-strong)' : '1px solid var(--vv-border-subtle)',
          borderRadius: '14px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Zap color={isLamSonActive ? "var(--vv-gold-border-strong)" : "var(--vv-subtle)"} />
          <div>
            <div style={{ fontWeight: 'bold', color: isLamSonActive ? 'var(--vv-gold-soft)' : 'var(--vv-muted)', fontSize: '0.95rem' }}>
              Duyên Phận Hợp Kích: Lam Sơn Nghĩa Khí (Lê Lợi + Nguyễn Trãi)
            </div>
            <div style={{ fontSize: '0.8rem', color: isLamSonActive ? 'var(--vv-green)' : 'var(--vv-subtle)', marginTop: '2px' }}>
              {isLamSonActive ? '✅ ĐÃ KÍCH HOẠT: Mở khóa chiêu Hợp Kích lật kèo 3D toàn bản đồ!' : '❌ Chưa đủ tướng: Cần cả Lê Lợi & Nguyễn Trãi cùng ra trận.'}
            </div>
          </div>
        </div>

        {/* Đội Hình Chiến Đấu 6 Ô Lưới */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--vv-gold-soft)' }}>
            ⚔️ Vị Trí Ô Lưới Trên Bàn Cờ 3D (Hàng Trước & Hàng Sau)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {Array.from({ length: 6 }).map((_, slotIdx) => {
              const heroInSlot = activeHeroes.find(h => h.slotIndex === slotIdx)

              return (
                <div 
                  key={`squad-slot-${slotIdx}`}
                  style={{
                    background: heroInSlot ? 'var(--vv-card-bg)' : 'var(--vv-slot-empty-bg)',
                    border: heroInSlot ? `2px solid ${heroInSlot.color}` : '1.5px dashed var(--vv-border-strong)',
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--vv-muted)', fontWeight: 'bold' }}>
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
                      <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: heroInSlot.color, background: 'var(--vv-hero-chip-bg)', padding: '1px 6px', borderRadius: '6px' }}>
                        {heroInSlot.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--vv-gold)', fontWeight: 'bold', marginTop: '2px' }}>
                        ⚔️ {getPowerScore(heroInSlot).toLocaleString()}
                      </div>
                      <button
                        onClick={() => benchHero(heroInSlot.id)}
                        style={{
                          marginTop: '6px',
                          background: 'var(--vv-red-tint)',
                          border: '1px solid var(--vv-red-solid)',
                          color: 'var(--vv-red)',
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--vv-subtle)', margin: 'auto' }}>
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
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--vv-text-2)' }}>
              📦 Kho Tướng Dự Bị ({reserveHeroes.length} Tướng)
            </h3>

            {/* Thanh Bộ Lọc Màu Phẩm Chất (Rarity Filter Bar) */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[
                { key: 'ALL', label: 'Tất Cả', color: 'var(--vv-muted)' },
                { key: 'UR', label: '🔴 UR (Thượng Cổ)', color: 'var(--vv-red)' },
                { key: 'SSR', label: '🟡 SSR (Tuyệt Phẩm)', color: 'var(--vv-gold-solid)' },
                { key: 'SR', label: '🟣 SR (Danh Tướng)', color: 'var(--vv-purple)' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setRarityFilter(f.key as any)}
                  style={{
                    background: rarityFilter === f.key ? f.color : 'var(--vv-surface-2-alpha)',
                    color: rarityFilter === f.key ? 'var(--vv-on-solid)' : 'var(--vv-text-2)',
                    border: `1px solid ${rarityFilter === f.key ? f.color : 'var(--vv-border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: rarityFilter === f.key ? '0 2px 8px var(--vv-shadow)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {reserveHeroes.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--vv-subtle)', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
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
                            color: 'var(--vv-on-solid)',
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            padding: '1px 5px',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px var(--vv-shadow)'
                          }}>
                            {hero.rarity || 'SR'}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: theme.hex }}>
                            {hero.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--vv-dark-card-gold)', marginTop: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Swords size={12} color="var(--vv-dark-card-gold)" /> {power.toLocaleString()}
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
                        background: 'var(--vv-menu-green-grad)',
                        border: 'none',
                        color: 'var(--vv-on-solid)',
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
