import { useGameStore } from '../../store/gameStore'
import { getPvPOpponents, calculateTeamPower } from '../../data/pvpData'
import { X, Swords } from 'lucide-react'

export default function PvPModal() {
  const showPvPModal = useGameStore(state => state.showPvPModal)
  const setShowPvPModal = useGameStore(state => state.setShowPvPModal)
  const pvpRank = useGameStore(state => state.pvpRank)
  const pvpScore = useGameStore(state => state.pvpScore)
  const startPvPChallenge = useGameStore(state => state.startPvPChallenge)

  if (!showPvPModal) return null

  const opponents = getPvPOpponents()

  return (
    <div onClick={() => setShowPvPModal(false)} style={{
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid #e74c3c',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '800px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(231, 76, 60, 0.3)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowPvPModal(false)}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Swords color="#ff6b6b" /> Đấu Trường PvP Giả Lập Toàn Server
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Thách đấu đội hình 6 tướng phòng thủ của các Cao Thủ để đoạt vị trí Top 1 Xếp Hạng!
        </p>

        {/* Thanh Trạng Thái PvP Của Bạn */}
        <div style={{
          background: 'rgba(231, 76, 60, 0.15)',
          border: '1.5px solid #e74c3c',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem' }}>🥇</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fef08a' }}>
                Hạng Đấu Trường Hiện Tại: <strong style={{ color: '#ff6b6b' }}>HẠNG {pvpRank}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                Điểm Xếp Hạng: <strong style={{ color: '#2ecc71' }}>{pvpScore} Điểm</strong> (Thắng +50 Điểm)
              </div>
            </div>
          </div>
        </div>

        {/* Danh Sách Đối Thủ PvP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
          {opponents.map((opp) => {
            const power = calculateTeamPower(opp.defenseTeam)

            return (
              <div
                key={opp.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: opp.rank === 1 ? '#f1c40f' : opp.rank === 2 ? '#cbd5e1' : '#b45309',
                    color: opp.rank <= 2 ? '#000' : 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.1rem'
                  }}>
                    #{opp.rank}
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'white' }}>
                      {opp.playerName} <span style={{ fontSize: '0.82rem', color: '#fef08a' }}>({opp.title})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>⚔️ {power.toLocaleString()} Lực Chiến</span>
                      <span>• {opp.score} Điểm Hạng</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startPvPChallenge(opp)}
                  style={{
                    background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.5)'
                  }}
                >
                  <Swords size={16} /> Thách Đấu
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
