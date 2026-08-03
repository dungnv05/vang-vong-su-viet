import { useGameStore } from '../../store/gameStore'
import { getTowerFloorData } from '../../data/towerData'
import { X, Building2, Lock, Coins, Swords, Sparkles } from 'lucide-react'

export default function TowerModal() {
  const showTowerModal = useGameStore(state => state.showTowerModal)
  const setShowTowerModal = useGameStore(state => state.setShowTowerModal)
  const towerFloor = useGameStore(state => state.towerFloor)
  const maxTowerFloor = useGameStore(state => state.maxTowerFloor)
  const startTowerFloor = useGameStore(state => state.startTowerFloor)

  if (!showTowerModal) return null

  // Sắp xếp ưu tiên: Tầng cao nhất đã mở khóa (maxTowerFloor) nằm TRÊN ĐẦU
  // Sau đó là các tầng đã mở khóa giảm dần về 1, cuối cùng mới tới các tầng chưa mở khóa tăng dần từ (maxTowerFloor + 1) -> 100
  const unlockedFloors = Array.from({ length: maxTowerFloor }, (_, i) => maxTowerFloor - i) // maxTowerFloor -> 1
  const lockedFloors = Array.from({ length: 100 - maxTowerFloor }, (_, i) => maxTowerFloor + 1 + i) // maxTowerFloor + 1 -> 100

  const sortedFloorNumbers = [...unlockedFloors, ...lockedFloors]

  return (
    <div onClick={() => setShowTowerModal(false)} style={{
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
        border: '2px solid #a855f7',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(168, 85, 247, 0.3)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowTowerModal(false)}
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
          <Building2 color="#c084fc" /> Tháp Cổ Việt Nam (Endless Trial Tower 100 Tầng)
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Tầng mở khóa mới nhất được ưu tiên hiển thị ở trên cùng để bạn khiêu chiến ngay!
        </p>

        {/* Danh sách 100 Tầng Tháp Cổ (Ưu tiên tầng mở khóa gần nhất ở trên đầu) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {sortedFloorNumbers.map((fl) => {
            const isUnlocked = fl <= maxTowerFloor
            const isCurrent = fl === towerFloor
            const isLatestUnlocked = fl === maxTowerFloor
            const floorInfo = getTowerFloorData(fl)

            return (
              <div 
                key={`tower-floor-${fl}`}
                onClick={() => isUnlocked && startTowerFloor(fl)}
                style={{
                  background: isCurrent 
                    ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.35), rgba(30, 41, 59, 0.9))' 
                    : floorInfo.isBossFloor 
                      ? 'rgba(241, 196, 15, 0.12)' 
                      : isUnlocked 
                        ? 'rgba(30, 41, 59, 0.7)' 
                        : 'rgba(15, 23, 42, 0.4)',
                  border: isLatestUnlocked 
                    ? '2px solid #f1c40f' 
                    : isCurrent 
                      ? '2px solid #c084fc' 
                      : floorInfo.isBossFloor 
                        ? '1px solid #f1c40f' 
                        : isUnlocked 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px dashed #475569',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  boxShadow: isLatestUnlocked ? '0 0 20px rgba(241, 196, 15, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: isLatestUnlocked ? '#f1c40f' : floorInfo.isBossFloor ? '#eab308' : isUnlocked ? '#a855f7' : '#334155',
                    color: (isLatestUnlocked || floorInfo.isBossFloor) ? '#000' : 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.05rem',
                    boxShadow: isLatestUnlocked ? '0 0 15px #f1c40f' : 'none'
                  }}>
                    {fl}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: isLatestUnlocked ? '#fef08a' : floorInfo.isBossFloor ? '#fef08a' : 'white', fontSize: '1rem' }}>
                        {floorInfo.name}
                      </span>
                      {isLatestUnlocked && (
                        <span style={{ background: 'linear-gradient(45deg, #b45309, #f59e0b)', color: 'white', fontSize: '0.68rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Sparkles size={12} /> TẦNG MỚI NHẤT
                        </span>
                      )}
                      {floorInfo.isBossFloor && !isLatestUnlocked && (
                        <span style={{ background: '#e74c3c', color: 'white', fontSize: '0.68rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '6px' }}>
                          👑 TRÙM THÁP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      Địch: <strong style={{ color: '#ff4d4d' }}>{floorInfo.bossName}</strong> (HP: {floorInfo.enemies[0].hp.toLocaleString()} | ATK: {floorInfo.enemies[0].atk})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: '#f1c40f', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Coins size={16} /> +{floorInfo.rewardGold.toLocaleString()} Vàng
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startTowerFloor(fl)
                      }}
                      style={{
                        background: isLatestUnlocked 
                          ? 'linear-gradient(45deg, #d97706, #f59e0b)' 
                          : 'linear-gradient(45deg, #7c3aed, #a855f7)',
                        border: isLatestUnlocked ? '1px solid #fef08a' : 'none',
                        color: 'white',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isLatestUnlocked ? '0 0 15px rgba(245, 158, 11, 0.6)' : 'none'
                      }}
                    >
                      <Swords size={15} /> Khiêu Chiến
                    </button>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={16} /> Chưa Mở Khóa
                    </div>
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
