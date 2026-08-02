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
        border: '2px solid #d4af37',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '720px',
        padding: '28px',
        boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)',
        color: 'white',
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
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin color="#f1c40f" /> Tiến Trình Màn Chơi Dòng Chảy Lịch Sử
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
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
                    ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.25), rgba(30, 41, 59, 0.8))' 
                    : isUnlocked 
                      ? 'rgba(30, 41, 59, 0.6)' 
                      : 'rgba(15, 23, 42, 0.4)',
                  border: isCurrent 
                    ? '2px solid #f1c40f' 
                    : isUnlocked 
                      ? '1px solid rgba(255,255,255,0.15)' 
                      : '1px dashed #475569',
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
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#fef08a',
                      border: '1px solid #d4af37',
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
                    <h3 style={{ margin: 0, color: isCurrent ? '#fef08a' : isUnlocked ? 'white' : '#64748b', fontSize: '1.15rem' }}>
                      {stage.name}
                    </h3>
                    {isCurrent && (
                      <span style={{ background: '#f1c40f', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        ĐANG KHIÊU CHIẾN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px', fontStyle: 'italic' }}>
                    {stage.subtitle}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                    Trùm: <strong style={{ color: '#e74c3c' }}>{stage.bossName}</strong> | {stage.description}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {isUnlocked ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f1c40f', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      <Coins size={16} /> +{stage.rewardGold} Vàng
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem' }}>
                      <Lock size={16} /> Đã Khóa
                    </div>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>Bấm Để Chọn Ải ➔</span>
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
