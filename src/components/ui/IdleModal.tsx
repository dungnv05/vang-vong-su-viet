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
      backgroundColor: 'rgba(5, 10, 20, 0.95)',
      
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        padding: '28px',
        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
        color: 'white',
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
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Floating Chest Icon Header */}
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '8px',
          filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.8))'
        }}>
          🎁
        </div>

        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: '#fef08a', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          RƯƠNG THU HOẠCH TREO MÁY AFK
        </h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
          Chiến đội tự động tích lũy tài nguyên 24/7 dựa theo Ải {currentStage}.
        </p>

        {/* Rate & Timer Info */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          width: '100%',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#f59e0b" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>TỐC ĐỘ THU HOẠCH</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fef08a' }}>
                +{goldPerHour.toLocaleString()} Vàng/Giờ
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>THỜI GIAN TÍCH LŨY</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#7dd3fc' }}>
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
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
            border: '1.5px solid #f59e0b',
            borderRadius: '16px',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🪙</div>
            <div style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: 'bold' }}>VÀNG TÍCH LŨY</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              +{gold.toLocaleString()}
            </div>
          </div>

          {/* Shards Reward */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.1) 100%)',
            border: '1.5px solid #a855f7',
            borderRadius: '16px',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🧩</div>
            <div style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 'bold' }}>MẢNH TƯỚNG</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
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
            background: gold > 0 ? 'linear-gradient(45deg, #d97706, #f59e0b, #eab308)' : '#475569',
            border: 'none',
            color: 'white',
            padding: '14px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '1.1rem',
            cursor: gold > 0 ? 'pointer' : 'not-allowed',
            boxShadow: gold > 0 ? '0 6px 25px rgba(245, 158, 11, 0.5)' : 'none',
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
