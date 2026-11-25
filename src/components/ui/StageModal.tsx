import { useGameStore } from '../../store/gameStore'
import { CAMPAIGN_STAGES } from '../../data/stages'
import { X, Lock, MapPin, Coins, Calendar } from 'lucide-react'

export default function StageModal() {
  const showStageSelectModal = useGameStore(state => state.showStageSelectModal)
  const setShowStageSelectModal = useGameStore(state => state.setShowStageSelectModal)
  const currentStageIndex = useGameStore(state => state.currentStageIndex)
  const maxUnlockedStage = useGameStore(state => state.maxUnlockedStage)
  const selectStage = useGameStore(state => state.selectStage)

  if (!showStageSelectModal) return null

  return (
    <div onClick={() => setShowStageSelectModal(false)} style={{
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
        borderRadius: '20px',
        width: '100%',
        maxWidth: '720px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-gold-shadow)',
        color: 'var(--vv-text)',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowStageSelectModal(false)}
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
          <MapPin color="var(--vv-gold)" /> Tiến Trình Màn Chơi Dòng Chảy Lịch Sử
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Tái hiện các mốc lịch sử hào hùng của dân tộc Việt Nam theo thứ tự thời gian từ thời Bắc Thuộc đến Tây Sơn.
        </p>

        {/* Danh sách Ải Màn Chơi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
          {CAMPAIGN_STAGES.map((stage, idx) => {
            const isUnlocked = idx <= maxUnlockedStage
            const isCurrent = idx === currentStageIndex

            return (
              <div 
                key={stage.id}
                onClick={() => isUnlocked && selectStage(idx)}
                style={{
                  background: isCurrent 
                    ? 'var(--vv-stage-current-bg)' 
                    : isUnlocked 
                      ? 'var(--vv-surface-2-alpha)' 
                      : 'var(--vv-slot-empty-bg)',
                  border: isCurrent 
                    ? '2px solid var(--vv-gold-border-strong)' 
                    : isUnlocked 
                      ? '1px solid var(--vv-border-subtle)' 
                      : '1px dashed var(--vv-border-strong)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'var(--vv-gold-tint-strong)',
                      color: 'var(--vv-gold-soft)',
                      border: '1px solid var(--vv-gold-border-strong)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar size={12} /> {stage.year}
                    </span>
                    <h3 style={{ margin: 0, color: isCurrent ? 'var(--vv-gold-soft)' : isUnlocked ? 'var(--vv-text)' : 'var(--vv-subtle)', fontSize: '1.15rem' }}>
                      {stage.name}
                    </h3>
                    {isCurrent && (
                      <span style={{ background: 'var(--vv-gold-solid)', color: 'var(--vv-on-gold)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        ĐANG KHIÊU CHIẾN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--vv-text-2)', marginTop: '6px', fontStyle: 'italic' }}>
                    {stage.subtitle}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--vv-muted)', marginTop: '4px' }}>
                    Trùm: <strong style={{ color: 'var(--vv-red)' }}>{stage.bossName}</strong> | {stage.description}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {isUnlocked ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vv-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      <Coins size={16} /> +{stage.rewardGold} Vàng
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vv-subtle)', fontSize: '0.9rem' }}>
                      <Lock size={16} /> Đã Khóa
                    </div>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--vv-sky-text)', fontWeight: 'bold' }}>Bấm Để Chọn Ải ➔</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
