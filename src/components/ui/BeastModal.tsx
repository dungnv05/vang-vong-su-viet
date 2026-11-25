import { useGameStore } from '../../store/gameStore'
import { MOUNT_BEASTS } from '../../data/beasts'
import { X, CheckCircle2 } from 'lucide-react'

export default function BeastModal() {
  const showBeastModal = useGameStore(state => state.showBeastModal)
  const setShowBeastModal = useGameStore(state => state.setShowBeastModal)
  const activeBeastId = useGameStore(state => state.activeBeastId)
  const selectBeast = useGameStore(state => state.selectBeast)

  if (!showBeastModal) return null

  return (
    <div onClick={() => setShowBeastModal(false)} style={{
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
        border: '2px solid var(--vv-green)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-green-shadow)',
        color: 'var(--vv-text)',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowBeastModal(false)}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🐉 Điện Thần Thú & Linh Vật Hộ Quốc
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Lựa chọn Linh Vật Thượng Cổ xuất trận để kích hoạt Aura gia tăng sức mạnh toàn đội hình.
        </p>

        {/* Danh sách Linh Vật */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {MOUNT_BEASTS.map((beast) => {
            const isActive = beast.id === activeBeastId

            return (
              <div 
                key={beast.id}
                onClick={() => selectBeast(beast.id)}
                style={{
                  background: isActive 
                    ? 'var(--vv-green-tint)' 
                    : 'var(--vv-surface-2-alpha)',
                  border: isActive 
                    ? `2px solid ${beast.color}` 
                    : '1px solid var(--vv-border-subtle)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isActive ? `0 0 20px ${beast.color}44` : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{beast.icon}</div>
                  <h3 style={{ margin: '0 0 4px 0', color: beast.color, fontSize: '1.15rem' }}>
                    <span style={{ background: 'var(--vv-hero-chip-bg)', padding: '2px 8px', borderRadius: '8px', display: 'inline-block' }}>
                      {beast.name}
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--vv-text-2)', fontStyle: 'italic', marginBottom: '12px' }}>
                    {beast.title}
                  </div>

                  <div style={{
                    background: 'var(--vv-subcard-bg)',
                    borderRadius: '10px',
                    padding: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--vv-gold-soft)',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    {beast.auraText}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--vv-muted)', lineHeight: '1.3' }}>
                    {beast.description}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {isActive ? (
                    <span style={{ color: 'var(--vv-green)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> ĐANG XUẤT TRẬN
                    </span>
                  ) : (
                    <span style={{ color: 'var(--vv-sky-text)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Chọn Xuất Trận ➔
                    </span>
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
