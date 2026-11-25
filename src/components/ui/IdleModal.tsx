import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { X, Sparkles, Clock, Zap } from 'lucide-react'

export default function IdleModal() {
  const showIdleModal = useGameStore(state => state.showIdleModal)
  const setShowIdleModal = useGameStore(state => state.setShowIdleModal)
  const getIdleRewards = useGameStore(state => state.getIdleRewards)
  const claimIdleRewards = useGameStore(state => state.claimIdleRewards)
  const currentStage = useGameStore(state => state.currentStageIndex) + 1

  const [, setTick] = useState(0)

  useEffect(() => {
    if (!showIdleModal) return
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [showIdleModal])

  if (!showIdleModal) return null

  const rewards = getIdleRewards ? getIdleRewards() : { gold: 0, shards: 0, elapsedSec: 0, goldRatePerSec: 5 }
  const gold = rewards.gold || 0
  const shards = rewards.shards || 0
  const elapsedSec = rewards.elapsedSec || 0
  const goldRatePerSec = rewards.goldRatePerSec || 5

  // Format HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const goldPerHour = goldRatePerSec * 3600

  return (
    <div onClick={() => setShowIdleModal(false)} style={{
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
        border: '2px solid var(--vv-gold-solid)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-gold-shadow)',
        color: 'var(--vv-text)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Close Button */}
        <button 
          onClick={() => setShowIdleModal(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--vv-close-bg)',
            borderRadius: '50%',
            padding: '6px',
            border: '1px solid var(--vv-close-border)',
            color: 'var(--vv-close-color)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Floating Chest Icon Header */}
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '8px',
          filter: 'var(--vv-drop-glow-gold)'
        }}>
          🎁
        </div>

        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: 'var(--vv-gold)', textShadow: 'var(--vv-text-shadow-dark)' }}>
          RƯƠNG THU HOẠCH TREO MÁY AFK
        </h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--vv-muted)' }}>
          Chiến đội tự động tích lũy tài nguyên 24/7 dựa theo Ải {currentStage}.
        </p>

        {/* Rate & Timer Info */}
        <div style={{
          background: 'var(--vv-subcard-bg)',
          border: '1px solid var(--vv-gold-border)',
          borderRadius: '16px',
          width: '100%',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--vv-gold-solid)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--vv-muted)' }}>TỐC ĐỘ THU HOẠCH</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--vv-gold)' }}>
                +{goldPerHour.toLocaleString()} Vàng/Giờ
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--vv-divider)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--vv-sky)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--vv-muted)' }}>THỜI GIAN TÍCH LŨY</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--vv-sky-text)' }}>
                {formatTime(elapsedSec)} / 12:00:00
              </div>
            </div>
          </div>
        </div>

        {/* Pending Rewards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          width: '100%',
          marginBottom: '24px'
        }}>
          {/* Gold Reward */}
          <div style={{
            background: 'var(--vv-btn-gold-tint)',
            border: '1.5px solid var(--vv-gold-solid)',
            borderRadius: '16px',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--vv-glow-gold)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🪙</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--vv-gold-soft)', fontWeight: 'bold' }}>VÀNG TÍCH LŨY</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--vv-text)', marginTop: '2px' }}>
              +{gold.toLocaleString()}
            </div>
          </div>

          {/* Shards Reward */}
          <div style={{
            background: 'var(--vv-purple-tint)',
            border: '1.5px solid var(--vv-purple)',
            borderRadius: '16px',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--vv-modal-purple-shadow)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🧩</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--vv-purple-soft)', fontWeight: 'bold' }}>MẢNH TƯỚNG</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--vv-text)', marginTop: '2px' }}>
              +{shards} Mảnh
            </div>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={claimIdleRewards}
          disabled={gold <= 0}
          style={{
            width: '100%',
            background: gold > 0 ? 'var(--vv-btn-gold-grad)' : 'var(--vv-btn-disabled-bg)',
            border: 'none',
            color: gold > 0 ? 'var(--vv-on-solid)' : 'var(--vv-btn-disabled-text)',
            padding: '14px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            cursor: gold > 0 ? 'pointer' : 'not-allowed',
            boxShadow: gold > 0 ? 'var(--vv-btn-gold-shadow)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            letterSpacing: '1px'
          }}
        >
          <Sparkles size={20} />
          {gold > 0 ? 'NHẬN TOÀN BỘ VÀNG TREO MÁY' : 'ĐANG TÍCH LŨY VÀNG...'}
        </button>
      </div>
    </div>
  )
}
