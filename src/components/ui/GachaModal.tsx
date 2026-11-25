import { useGameStore } from '../../store/gameStore'
import { Sparkles, X, Coins } from 'lucide-react'
import { getRarityTheme } from '../../utils/rarityColors'
import { getRoleVietnameseInfo } from '../../data/heroes'

export default function GachaModal() {
  const showGachaModal = useGameStore(state => state.showGachaModal)
  const setShowGachaModal = useGameStore(state => state.setShowGachaModal)
  const gold = useGameStore(state => state.gold)
  const pullGacha = useGameStore(state => state.pullGacha)
  const gachaResults = useGameStore(state => state.gachaResults)
  const clearGachaResults = useGameStore(state => state.clearGachaResults)

  if (!showGachaModal) return null

  return (
    <div onClick={() => setShowGachaModal(false)} style={{
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
        border: '2px solid var(--vv-gold-border-strong)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-gold-shadow)',
        color: 'var(--vv-text)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={() => {
            clearGachaResults()
            setShowGachaModal(false)
          }}
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

        {/* Modal Title */}
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: 'var(--vv-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="var(--vv-gold)" /> Đài Chiêu Mộ Anh Hùng Sử Việt
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Triệu hồi các Vị Tướng Lịch Sử (UR, SSR, SR) cùng xuất trận dẹp loạn ngoại xâm!
        </p>

        {/* Gacha Banner Graphic */}
        <div style={{
          background: 'var(--vv-gacha-banner-bg)',
          border: '1.5px solid var(--vv-gold-border)',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--vv-gold-soft)' }}>
              BỂ CHIÊU MỘ HOÀNG GIA - TỶ LỆ UR 10%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--vv-text-2)', marginTop: '4px' }}>
              Tướng trùng lặp tự động quy đổi thành <strong>+30 Mảnh Tướng</strong> để Tăng Sao!
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--vv-muted)' }}>VÀNG HIỆN CÓ</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--vv-gold)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Coins size={18} /> {gold.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Gacha Results Display (Nút Quay Thẻ Animation & Avatar Image) */}
        {gachaResults ? (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--vv-green)', textAlign: 'center' }}>
              ✨ KẾT QUẢ CHIÊU MỘ ANH HÙNG ✨
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: gachaResults.length === 1 ? '1fr' : 'repeat(5, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              maxHeight: '340px',
              overflowY: 'auto'
            }}>
              {gachaResults.map((result, idx) => {
                const theme = getRarityTheme(result.rarity)
                return (
                  <div
                    key={result.id}
                    style={{
                      background: theme.background,
                      border: `2px solid ${theme.borderHex}`,
                      borderRadius: '16px',
                      padding: '14px 10px',
                      textAlign: 'center',
                      boxShadow: theme.glowBoxShadow,
                      animation: `fadeInCard 0.4s ease forwards ${idx * 0.08}s`,
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: theme.badgeBg,
                      color: 'var(--vv-on-solid)',
                      fontSize: '0.65rem',
                      fontWeight: '900',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      zIndex: 2,
                      boxShadow: '0 2px 4px var(--vv-shadow)'
                    }}>
                      {theme.rarity}
                    </span>

                  {/* Avatar 2D Image */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                    {result.avatarUrl ? (
                      <img 
                        src={result.avatarUrl} 
                        alt={result.name} 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: `1.5px solid ${result.color}`,
                          boxShadow: `0 4px 15px ${result.color}66`
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '2.5rem' }}>🏛️</div>
                    )}
                  </div>

                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: result.color }}>{result.name}</div>
                  
                  {result.isDuplicate ? (
                    <div style={{ background: 'var(--vv-gold-tint-strong)', border: '1px solid var(--vv-gold-border-strong)', color: 'var(--vv-dark-card-gold)', fontSize: '0.68rem', fontWeight: 'bold', padding: '2px', borderRadius: '6px', marginTop: '6px' }}>
                      +30 MẢNH
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: 'var(--vv-dark-card-text)', marginTop: '4px', fontWeight: '500' }}>
                      {getRoleVietnameseInfo(result.role).icon} {getRoleVietnameseInfo(result.role).short}
                    </div>
                  )}
                </div>
              )
            })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={clearGachaResults}
                style={{
                  background: 'var(--vv-menu-sky-grad)',
                  border: 'none',
                  color: 'var(--vv-on-solid)',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                XÁC NHẬN & QUAY THÊM
              </button>
            </div>
          </div>
        ) : (
          /* Pull Actions */
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => pullGacha(1)}
              disabled={gold < 300}
              style={{
                flex: 1,
                maxWidth: '240px',
                background: gold >= 300 ? 'var(--vv-btn-blue-grad)' : 'var(--vv-btn-disabled-bg)',
                border: '1.5px solid var(--vv-btn-blue-border)',
                color: gold >= 300 ? 'var(--vv-on-solid)' : 'var(--vv-btn-disabled-text)',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: gold >= 300 ? 'pointer' : 'not-allowed',
                boxShadow: gold >= 300 ? 'var(--vv-glow-blue)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>CHIÊU MỘ X1</span>
              <span style={{ fontSize: '0.8rem', color: gold >= 300 ? 'var(--vv-on-solid)' : 'var(--vv-btn-disabled-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} /> 300 Vàng
              </span>
            </button>

            <button
              onClick={() => pullGacha(10)}
              disabled={gold < 2700}
              style={{
                flex: 1,
                maxWidth: '240px',
                background: gold >= 2700 ? 'var(--vv-cta-grad)' : 'var(--vv-btn-disabled-bg)',
                border: '2px solid var(--vv-btn-gold-border)',
                color: gold >= 2700 ? 'var(--vv-on-solid)' : 'var(--vv-btn-disabled-text)',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: gold >= 2700 ? 'pointer' : 'not-allowed',
                boxShadow: gold >= 2700 ? 'var(--vv-btn-gold-shadow)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>CHIÊU MỘ X10 (ƯU ĐÃI)</span>
              <span style={{ fontSize: '0.8rem', color: gold >= 2700 ? 'var(--vv-dark-card-gold)' : 'var(--vv-btn-disabled-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} /> 2,700 Vàng
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
