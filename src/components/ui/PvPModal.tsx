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
        border: '2px solid var(--vv-red-solid)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '800px',
        padding: '28px',
        boxShadow: 'var(--vv-modal-red-shadow)',
        color: 'var(--vv-text)',
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
            color: 'var(--vv-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Swords color="var(--vv-red)" /> Đấu Trường PvP Giả Lập Toàn Server
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Thách đấu đội hình 6 tướng phòng thủ của các Cao Thủ để đoạt vị trí Top 1 Xếp Hạng!
        </p>

        {/* Thanh Trạng Thái PvP Của Bạn */}
        <div style={{
          background: 'var(--vv-red-tint)',
          border: '1.5px solid var(--vv-red-solid)',
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
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--vv-gold-soft)' }}>
                Hạng Đấu Trường Hiện Tại: <strong style={{ color: 'var(--vv-red)' }}>HẠNG {pvpRank}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--vv-text-2)', marginTop: '2px' }}>
                Điểm Xếp Hạng: <strong style={{ color: 'var(--vv-green)' }}>{pvpScore} Điểm</strong> (Thắng +50 Điểm)
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
                  background: 'var(--vv-surface-2-alpha)',
                  border: '1px solid var(--vv-border-subtle)',
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
                    backgroundColor: opp.rank === 1 ? 'var(--vv-rank-1-bg)' : opp.rank === 2 ? 'var(--vv-rank-2-bg)' : 'var(--vv-rank-3-bg)',
                    color: opp.rank <= 2 ? 'var(--vv-on-rank-12)' : 'var(--vv-on-solid)',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.1rem'
                  }}>
                    #{opp.rank}
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--vv-text)' }}>
                      {opp.playerName} <span style={{ fontSize: '0.82rem', color: 'var(--vv-gold-soft)' }}>({opp.title})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--vv-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--vv-gold)', fontWeight: 'bold' }}>⚔️ {power.toLocaleString()} Lực Chiến</span>
                      <span>• {opp.score} Điểm Hạng</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startPvPChallenge(opp)}
                  style={{
                    background: 'var(--vv-menu-red-grad)',
                    border: 'none',
                    color: 'var(--vv-on-solid)',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--vv-menu-red-shadow)'
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
