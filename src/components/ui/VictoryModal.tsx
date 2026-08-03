import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Coins, ArrowRight, Home } from 'lucide-react'
import { MOCK_ITEMS, type ItemData } from '../../data/items'
import { CAMPAIGN_STAGES } from '../../data/stages'

export default function VictoryModal() {
  const showVictoryModal = useGameStore(state => state.showVictoryModal)
  const setShowVictoryModal = useGameStore(state => state.setShowVictoryModal)
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen)
  const nextStage = useGameStore(state => state.nextStage)
  const gameMode = useGameStore(state => state.gameMode)
  const towerFloor = useGameStore(state => state.towerFloor)
  const currentStageIndex = useGameStore(state => state.currentStageIndex)
  const worldBossTotalDamage = useGameStore(state => state.worldBossTotalDamage)

  const [droppedItem, setDroppedItem] = useState<ItemData | null>(null)

  useEffect(() => {
    if (showVictoryModal) {
      // Khi thắng trận, rớt ngẫu nhiên 1 Mảnh Trang Bị / Thần Khí
      const randomItem = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)]
      setDroppedItem(randomItem)
    }
  }, [showVictoryModal])

  if (!showVictoryModal) return null

  const currentStage = CAMPAIGN_STAGES[currentStageIndex]
  let victoryRewardGold = 1000
  if (gameMode === 'WORLD_BOSS') victoryRewardGold = 15000
  else if (gameMode === 'PVP') victoryRewardGold = 8000
  else if (gameMode === 'TOWER') victoryRewardGold = 5000
  else victoryRewardGold = currentStage ? currentStage.rewardGold : 1000

  const handleReturnLobby = () => {
    setShowVictoryModal(false)
    setCurrentScreen('LOBBY')
  }

  return (
    <div onClick={() => setShowVictoryModal(false)} style={{
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
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: '3px solid #f1c40f',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '520px',
        padding: '36px',
        boxShadow: '0 10px 60px rgba(241, 196, 15, 0.4)',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Banner Khải Hoàn */}
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>👑</div>
        <h1 style={{
          margin: 0,
          fontSize: '2.4rem',
          fontWeight: 900,
          background: 'linear-gradient(45deg, #fef08a, #f1c40f, #d97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          ĐẠI THẮNG KHẢI HOÀN!
        </h1>

        <p style={{ margin: '6px 0 24px 0', fontSize: '0.95rem', color: '#cbd5e1' }}>
          {gameMode === 'WORLD_BOSS' 
            ? `Đã hoàn thành Phó Bản Trùm! Tổng Sát Thương: ${worldBossTotalDamage.toLocaleString()}` 
            : gameMode === 'TOWER' 
              ? `Vượt Tháp Cổ Tầng ${towerFloor} Thành Công!` 
              : 'Đánh Bại Quân Địch, Thu Hồi Bờ Cõi Dân Tộc!'}
        </p>

        {/* Khung Phần Thưởng Rớt Trang Bị & Vàng */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1.5px solid rgba(241, 196, 15, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#fef08a', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
            🎁 CHIẾN LỢI PHẨM RỚT RA TỪ ẢI
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={24} color="#f1c40f" />
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fef08a' }}>+{victoryRewardGold.toLocaleString()} Vàng</span>
            </div>

            {droppedItem && (
              <div style={{
                background: 'rgba(241, 196, 15, 0.15)',
                border: '1px solid #f1c40f',
                borderRadius: '12px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.4rem' }}>{droppedItem.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fef08a' }}>{droppedItem.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#2ecc71' }}>Rớt Thần Khí!</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cụm Nút Hành Động */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={nextStage}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #b45309, #f59e0b, #d97706)',
              border: '2px solid #fef08a',
              color: 'white',
              padding: '14px',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(245, 158, 11, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>TIẾP TỤC ẢI TIẾP THEO</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={handleReturnLobby}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#cbd5e1',
              padding: '14px',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Home size={18} />
            <span>QUAY VỀ SẢNH CHÍNH</span>
          </button>
        </div>

      </div>
    </div>
  )
}
