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
          onClick={() => setShowTowerModal(false)}
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
          <Building2 color="var(--vv-purple-text)" /> Tháp Cổ Việt Nam (Endless Trial Tower 100 Tầng)
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
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
                    ? 'var(--vv-tower-current-bg)' 
                    : floorInfo.isBossFloor 
                      ? 'var(--vv-tower-boss-bg)' 
                      : isUnlocked 
                        ? 'var(--vv-surface-2-alpha)' 
                        : 'var(--vv-subcard-bg)',
                  border: isLatestUnlocked 
                    ? '2px solid var(--vv-gold-border-strong)' 
                    : isCurrent 
                      ? '2px solid var(--vv-purple-text)' 
                      : floorInfo.isBossFloor 
                        ? '1px solid var(--vv-gold-border-strong)' 
                        : isUnlocked 
                          ? '1px solid var(--vv-border-subtle)' 
                          : '1px dashed var(--vv-border-strong)',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  boxShadow: isLatestUnlocked ? 'var(--vv-glow-gold)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: isLatestUnlocked ? 'var(--vv-gold-border-strong)' : floorInfo.isBossFloor ? 'var(--vv-gold-solid)' : isUnlocked ? 'var(--vv-purple)' : 'var(--vv-surface-3)',
                    color: (isLatestUnlocked || floorInfo.isBossFloor) ? 'var(--vv-on-yellow)' : isUnlocked ? 'var(--vv-on-solid)' : 'var(--vv-muted)',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.05rem',
                    boxShadow: isLatestUnlocked ? 'var(--vv-glow-gold)' : 'none'
                  }}>
                    {fl}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: isLatestUnlocked ? 'var(--vv-gold)' : floorInfo.isBossFloor ? 'var(--vv-gold)' : 'var(--vv-text)', fontSize: '1rem' }}>
                        {floorInfo.name}
                      </span>
                      {isLatestUnlocked && (
                        <span style={{ background: 'var(--vv-menu-gold-grad)', color: 'var(--vv-on-solid)', fontSize: '0.68rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Sparkles size={12} /> TẦNG MỚI NHẤT
                        </span>
                      )}
                      {floorInfo.isBossFloor && !isLatestUnlocked && (
                        <span style={{ background: 'var(--vv-red-solid)', color: 'var(--vv-on-solid)', fontSize: '0.68rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '6px' }}>
                          👑 TRÙM THÁP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--vv-muted)', marginTop: '2px' }}>
                      Địch: <strong style={{ color: 'var(--vv-red)' }}>{floorInfo.bossName}</strong> (HP: {floorInfo.enemies[0].hp.toLocaleString()} | ATK: {floorInfo.enemies[0].atk})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--vv-gold)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                          ? 'var(--vv-btn-gold-grad-short)' 
                          : 'var(--vv-menu-purple-grad)',
                        border: isLatestUnlocked ? '1px solid var(--vv-btn-gold-border)' : 'none',
                        color: 'var(--vv-on-solid)',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isLatestUnlocked ? 'var(--vv-btn-gold-shadow)' : 'none'
                      }}
                    >
                      <Swords size={15} /> Khiêu Chiến
                    </button>
                  ) : (
                    <div style={{ color: 'var(--vv-subtle)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
