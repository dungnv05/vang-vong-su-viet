import { useGameStore } from '../../store/gameStore'
import { WORLD_BOSS_DATA } from '../../data/worldBossData'
import { X, Flame, Swords, Coins, Gift } from 'lucide-react'

export default function WorldBossModal() {
  const showWorldBossModal = useGameStore(state => state.showWorldBossModal)
  const setShowWorldBossModal = useGameStore(state => state.setShowWorldBossModal)
  const startWorldBossRaid = useGameStore(state => state.startWorldBossRaid)

  if (!showWorldBossModal) return null

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
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: '2px solid #9333ea',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(147, 51, 234, 0.35)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowWorldBossModal(false)}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame color="#a855f7" /> Phó Bản Trùm Thế Giới: Hắc Long Ma Tướng
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Gây tổng sát thương lớn nhất trong 10 lượt để nhận vô vàn Vàng & Rương Thần Khí Hoàng Gia!
        </p>

        {/* Trùm Thế Giới Banner */}
        <div style={{
          background: 'rgba(147, 51, 234, 0.15)',
          border: '1.5px solid #9333ea',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            background: 'rgba(147, 51, 234, 0.25)',
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #c084fc',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)'
          }}>
            🐉
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#c084fc' }}>
              {WORLD_BOSS_DATA.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fef08a', marginTop: '2px', fontWeight: 'bold' }}>
              {WORLD_BOSS_DATA.title} • Máu: Vô Hạn (100.000.000 HP)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', fontStyle: 'italic' }}>
              "{WORLD_BOSS_DATA.description}"
            </div>
          </div>
        </div>

        {/* Mốc Thưởng Sát Thương */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="#fef08a" /> Mốc Thưởng Theo Sát Thương Gây Ra
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {WORLD_BOSS_DATA.rewards.map((tier, idx) => (
              <div 
                key={`tier-${idx}`}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#38bdf8' }}>
                  {tier.minDamage.toLocaleString()} Sát Thương
                </div>
                <div style={{ fontSize: '0.9rem', color: '#f1c40f', fontWeight: 'bold', margin: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Coins size={16} /> +{tier.gold.toLocaleString()} Vàng
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 'bold' }}>
                  {tier.rewardName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút Khiêu Chiến */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={startWorldBossRaid}
            style={{
              background: 'linear-gradient(45deg, #7c3aed, #9333ea, #c084fc)',
              border: '2px solid #fef08a',
              color: 'white',
              padding: '16px 48px',
              borderRadius: '30px',
              fontWeight: 900,
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 6px 30px rgba(147, 51, 234, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              letterSpacing: '1px'
            }}
          >
            <Swords size={24} /> KHIÊU CHIẾN TRÙM THẾ GIỚI
          </button>
        </div>

      </div>
    </div>
  )
}
