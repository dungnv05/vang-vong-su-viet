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
        border: '2px solid #2ecc71',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        padding: '28px',
        boxShadow: '0 10px 40px rgba(46, 204, 113, 0.3)',
        color: 'white',
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
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🐉 Điện Thần Thú & Linh Vật Hộ Quốc
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
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
                    ? 'rgba(46, 204, 113, 0.15)' 
                    : 'rgba(30, 41, 59, 0.5)',
                  border: isActive 
                    ? `2px solid ${beast.color}` 
                    : '1px solid rgba(255,255,255,0.1)',
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
                  <h3 style={{ margin: '0 0 4px 0', color: beast.color, fontSize: '1.15rem' }}>{beast.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '12px' }}>
                    {beast.title}
                  </div>

                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    padding: '8px',
                    fontSize: '0.78rem',
                    color: '#fef08a',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    {beast.auraText}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.3' }}>
                    {beast.description}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {isActive ? (
                    <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> ĐANG XUẤT TRẬN
                    </span>
                  ) : (
                    <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
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
