import { useGameStore } from '../../store/gameStore'
import { WORLD_BOSS_DATA } from '../../data/worldBossData'
import { X, Flame, Swords, Coins, Gift } from 'lucide-react'

export default function WorldBossModal() {
  const showWorldBossModal = useGameStore(state => state.showWorldBossModal)
  const setShowWorldBossModal = useGameStore(state => state.setShowWorldBossModal)
  const startWorldBossRaid = useGameStore(state => state.startWorldBossRaid)

  if (!showWorldBossModal) return null

  return (
    <div onClick={() => setShowWorldBossModal(false)} style={{
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
        border: '2px solid var(--vv-purple)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-purple-shadow)',
        color: 'var(--vv-text)',
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
            color: 'var(--vv-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-purple-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame color="var(--vv-purple)" /> Phó Bản Trùm Thế Giới: Hắc Long Ma Tướng
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Gây tổng sát thương lớn nhất trong 10 lượt để nhận vô vàn Vàng & Rương Thần Khí Hoàng Gia!
        </p>

        {/* Trùm Thế Giới Banner */}
        <div style={{
          background: 'var(--vv-purple-tint)',
          border: '1.5px solid var(--vv-purple)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            background: 'var(--vv-purple-tint)',
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid var(--vv-purple)',
            boxShadow: 'var(--vv-menu-boss-shadow)'
          }}>
            🐉
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--vv-purple-text)' }}>
              {WORLD_BOSS_DATA.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--vv-gold-soft)', marginTop: '2px', fontWeight: 'bold' }}>
              {WORLD_BOSS_DATA.title} • Máu: Vô Hạn (100.000.000 HP)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--vv-text-2)', marginTop: '6px', fontStyle: 'italic' }}>
              "{WORLD_BOSS_DATA.description}"
            </div>
          </div>
        </div>

        {/* Mốc Thưởng Sát Thương */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--vv-gold-soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="var(--vv-gold-soft)" /> Mốc Thưởng Theo Sát Thương Gây Ra
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {WORLD_BOSS_DATA.rewards.map((tier, idx) => (
              <div 
                key={`tier-${idx}`}
                style={{
                  background: 'var(--vv-surface-2-alpha)',
                  border: '1px solid var(--vv-border-subtle)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--vv-sky-text)' }}>
                  {tier.minDamage.toLocaleString()} Sát Thương
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--vv-gold)', fontWeight: 'bold', margin: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Coins size={16} /> +{tier.gold.toLocaleString()} Vàng
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--vv-purple-text)', fontWeight: 'bold' }}>
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
              background: 'var(--vv-menu-boss-grad)',
              border: '2px solid var(--vv-btn-gold-border)',
              color: 'var(--vv-on-solid)',
              padding: '16px 48px',
              borderRadius: '30px',
              fontWeight: 900,
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: 'var(--vv-menu-boss-shadow)',
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
