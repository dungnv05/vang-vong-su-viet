import { useGameStore } from '../../store/gameStore'
import { IMPERIAL_RANKS } from '../../data/rankData'
import { getPowerScore } from './SquadModal'
import { X, Crown, Coins, Award, Sparkles } from 'lucide-react'

export default function ImperialRankModal() {
  const showRankModal = useGameStore(state => (state as any).showRankModal)
  const setShowRankModal = useGameStore(state => (state as any).setShowRankModal)
  const rankLevel = useGameStore(state => (state as any).rankLevel || 1)
  const setRankLevel = useGameStore(state => (state as any).setRankLevel)
  const heroes = useGameStore(state => state.heroes)

  if (!showRankModal) return null

  const activeHeroes = heroes.filter(h => h.slotIndex >= 0)
  const totalPower = activeHeroes.reduce((sum, h) => sum + getPowerScore(h), 0)

  const currentRank = IMPERIAL_RANKS.find(r => r.level === rankLevel) || IMPERIAL_RANKS[0]
  const nextRank = IMPERIAL_RANKS.find(r => r.level === rankLevel + 1)

  return (
    <div onClick={() => setShowRankModal(false)} style={{
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
        maxWidth: '750px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-gold-shadow)',
        color: 'var(--vv-text)',
        position: 'relative'
      }}>
        <button 
          onClick={() => setShowRankModal(false)}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crown color="var(--vv-gold)" /> Hệ Thống Quan Lại & Cấp Bậc Triều Đình
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Thăng Quan Tiến Chức tăng Buff % chỉ số cho toàn bộ Tướng xuất trận và nhận Bổng Lộc Hàng Ngày!
        </p>

        {/* Khung Phẩm Cấp Hiện Tại */}
        <div style={{
          background: 'var(--vv-gold-tint)',
          border: '2px solid var(--vv-gold-border-strong)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ fontSize: '3rem' }}>{currentRank.icon}</div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--vv-text-2)', textTransform: 'uppercase', fontWeight: 'bold' }}>CẤP BẬC QUAN LẠI HIỆN TẠI</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: currentRank.color, marginTop: '2px' }}>
                <span style={{ background: 'var(--vv-hero-chip-bg)', padding: '2px 8px', borderRadius: '8px', display: 'inline-block' }}>
                  {currentRank.title}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--vv-green)', fontWeight: 'bold', marginTop: '4px' }}>
                ⚡ Buff Triều Đình: {currentRank.statBuffText}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--vv-muted)' }}>BỔNG LỘC HÀNG NGÀY</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--vv-gold-soft)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
              <Coins size={18} /> +{currentRank.dailySalaryGold.toLocaleString()} Vàng
            </div>
          </div>
        </div>

        {/* Tiến Trình Thăng Quan tiếp theo */}
        {nextRank ? (
          <div style={{
            background: 'var(--vv-surface-2-alpha)',
            border: '1px solid var(--vv-border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--vv-sky-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} /> Cấp Bậc Tiếp Theo: <span style={{ color: nextRank.color, background: 'var(--vv-hero-chip-bg)', padding: '2px 8px', borderRadius: '8px' }}>{nextRank.title}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--vv-text-2)', marginBottom: '12px' }}>
              Yêu cầu Tổng Lực Chiến: <strong>{totalPower.toLocaleString()} / {nextRank.reqPower.toLocaleString()}</strong>
            </div>

            {/* Thanh Progress */}
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'var(--vv-secondary-bg)',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                width: `${Math.min(100, (totalPower / nextRank.reqPower) * 100)}%`,
                height: '100%',
                backgroundColor: 'var(--vv-gold-border-strong)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <button
              onClick={() => {
                if (totalPower >= nextRank.reqPower && setRankLevel) {
                  setRankLevel(nextRank.level)
                }
              }}
              disabled={totalPower < nextRank.reqPower}
              style={{
                width: '100%',
                background: totalPower >= nextRank.reqPower ? 'var(--vv-btn-gold-grad-short)' : 'var(--vv-btn-disabled-bg)',
                border: 'none',
                color: totalPower >= nextRank.reqPower ? 'var(--vv-on-solid)' : 'var(--vv-btn-disabled-text)',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: totalPower >= nextRank.reqPower ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} /> {totalPower >= nextRank.reqPower ? 'THĂNG QUAN TIẾN CHỨC NGAY' : 'CHƯA ĐỦ LỰC CHIẾN MỞ KHÓA'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--vv-green)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            👑 BẠN ĐÃ ĐẠT CẤP BẬC QUAN LẠI CAO NHẤT (THÁI SƯ TỂ TƯỚNG)!
          </div>
        )}

      </div>
    </div>
  )
}
