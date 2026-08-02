import { useGameStore } from '../../store/gameStore'
import { Swords, Move, Map, Volume2, VolumeX, Home, Zap, Bot, Star } from 'lucide-react'
import HeroModal from './HeroModal'
import StageModal from './StageModal'
import VictoryModal from './VictoryModal'
import DefeatModal from './DefeatModal'
import GachaModal from './GachaModal'
import BeastModal from './BeastModal'
import SquadModal from './SquadModal'
import CloudSaveModal from './CloudSaveModal'
import TowerModal from './TowerModal'
import WorldBossModal from './WorldBossModal'
import CodexModal from './CodexModal'
import PvPModal from './PvPModal'
import ImperialRankModal from './ImperialRankModal'
import IdleModal from './IdleModal'
import MainLobby from './MainLobby'
import { CAMPAIGN_STAGES } from '../../data/stages'

export default function HUD() {
  const showCloudModal = useGameStore(state => state.showCloudModal)
  const setShowCloudModal = useGameStore(state => state.setShowCloudModal)

  const turn = useGameStore(state => state.turn)
  const heroes = useGameStore(state => state.heroes)
  const gameMode = useGameStore(state => state.gameMode)
  const towerFloor = useGameStore(state => state.towerFloor)
  const currentStageIndex = useGameStore(state => state.currentStageIndex)
  const isAnimating = useGameStore(state => state.isAnimating)
  const worldBossTotalDamage = useGameStore(state => state.worldBossTotalDamage)
  const isMuted = useGameStore(state => state.isMuted)
  const battleSpeed = useGameStore(state => state.battleSpeed)

  const setCurrentScreen = useGameStore(state => state.setCurrentScreen)
  const toggleMute = useGameStore(state => state.toggleMute)
  const toggleBattleSpeed = useGameStore(state => state.toggleBattleSpeed)
  const executeTurn = useGameStore(state => state.executeTurn)
  const setSelectedHeroId = useGameStore(state => state.setSelectedHeroId)
  const setShowStageSelectModal = useGameStore(state => state.setShowStageSelectModal)
  const deployHeroToSlot = useGameStore(state => state.deployHeroToSlot)
  const benchHero = useGameStore(state => state.benchHero)

  const currentStage = CAMPAIGN_STAGES[currentStageIndex]

  // Sắp xếp danh sách tất cả tướng sở hữu (Active lên trước, Dự Bị xếp theo Lực Chiến)
  const activeHeroes = heroes.filter(h => h.slotIndex >= 0)
  const reserveHeroes = heroes.filter(h => h.slotIndex === -1)
  const allOwnedHeroes = [...activeHeroes, ...reserveHeroes]

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px',
      boxSizing: 'border-box',
      color: 'white'
    }}>
      {/* Top Bar Tinh Gọn Cho Màn Hình Khai Chiến 3D */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Nút Về Sảnh Chính Hoàng Gia */}
          <button
            onClick={() => setCurrentScreen('LOBBY')}
            style={{
              background: 'linear-gradient(45deg, #0f172a, #1e293b)',
              border: '1.5px solid #f1c40f',
              color: '#fef08a',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(241, 196, 15, 0.3)'
            }}
          >
            <Home size={18} />
            <span>🏰 SẢNH CHÍNH</span>
          </button>

          {/* Nút Bật/Tắt Âm Thanh */}
          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: isMuted ? '#ef4444' : '#2ecc71',
              padding: '10px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Nút Chọn Ải Màn Chơi */}
          <div 
            onClick={() => setShowStageSelectModal(true)}
            style={{ 
              background: 'rgba(15, 23, 42, 0.85)', 
              padding: '10px 18px', 
              borderRadius: '12px', 
              border: '1.5px solid rgba(212, 175, 55, 0.8)',
              
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Map size={20} color="#f1c40f" />
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', color: '#f1c40f', letterSpacing: '1px' }}>
                {gameMode === 'PVP' ? '⚔️ ĐẤU TRƯỜNG PVP GIẢ LẬP' : gameMode === 'WORLD_BOSS' ? '🐉 TRÙM THẾ GIỚI: HẮC LONG' : gameMode === 'CAMPAIGN' ? currentStage.name : `Tháp Cổ Tầng ${towerFloor}`} ▾
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                {gameMode === 'WORLD_BOSS' ? `Tổng Dmg: ${worldBossTotalDamage.toLocaleString()}` : `Lượt đấu: ${turn}`}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.85)', 
          padding: '10px 16px', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <Move size={16} color="#f1c40f" />
          <span>Kéo thả tướng trực tiếp lên 6 ô lưới 3D để đổi vị trí</span>
        </div>
      </div>



      {/* Bottom Bar - Bể Tướng Hiển Thị Tất Cả Tướng & Cụm Nút Độc Lập Bên Phải */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'auto', gap: '20px' }}>
        {/* Danh sách Bể Tướng Sở Hữu */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1, paddingBottom: '4px' }}>
          {allOwnedHeroes.map(hero => {
            const isDeployed = hero.slotIndex >= 0

            return (
              <div 
                key={hero.id}
                onClick={() => setSelectedHeroId(hero.id)}
                style={{
                  background: isDeployed ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.7)',
                  border: isDeployed ? `2px solid ${hero.color}` : '1.5px dashed #475569',
                  borderRadius: '14px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isDeployed ? `0 4px 15px ${hero.color}44` : 'none',
                  transition: 'all 0.2s ease',
                  minWidth: '155px'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {hero.avatarUrl ? (
                  <img 
                    src={hero.avatarUrl} 
                    alt={hero.name} 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: `1.5px solid ${hero.color}`
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '1.6rem' }}>🏛️</div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: hero.color }}>
                    {hero.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Lv.{hero.level}</span>
                    <Star size={10} color="#f1c40f" fill="#f1c40f" />
                    <span>{hero.stars}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isDeployed ? '#2ecc71' : '#94a3b8', fontWeight: 'bold', marginTop: '2px' }}>
                    {isDeployed ? `Ô ${hero.slotIndex + 1}` : 'Dự Bị'}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isDeployed) {
                      benchHero(hero.id)
                    } else {
                      const occupied = new Set(activeHeroes.map(h => h.slotIndex))
                      for (let s = 0; s < 6; s++) {
                        if (!occupied.has(s)) {
                          deployHeroToSlot(hero.id, s)
                          break
                        }
                      }
                    }
                  }}
                  style={{
                    background: isDeployed ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                    border: isDeployed ? '1px solid #e74c3c' : '1px solid #2ecc71',
                    color: isDeployed ? '#ff4d4d' : '#2ecc71',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isDeployed ? 'Tháo' : 'Xuất'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Cụm Nút Độc Lập Phía Bên Phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={toggleBattleSpeed}
              style={{
                background: battleSpeed === 3 
                  ? 'linear-gradient(45deg, #dc2626, #ef4444)' 
                  : battleSpeed === 2 
                    ? 'linear-gradient(45deg, #d97706, #f59e0b)' 
                    : 'rgba(15, 23, 42, 0.9)',
                border: battleSpeed > 1 ? '1.5px solid #fef08a' : '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: battleSpeed > 1 ? '0 0 15px rgba(245, 158, 11, 0.5)' : 'none'
              }}
            >
              <Zap size={16} color={battleSpeed === 3 ? "#fef08a" : battleSpeed === 2 ? "#fef08a" : "#cbd5e1"} />
              <span>{battleSpeed}X</span>
            </button>

            <div
              style={{
                background: 'linear-gradient(45deg, #059669, #10b981)',
                border: '1.5px solid #a7f3d0',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
              }}
            >
              <Bot size={16} color="#a7f3d0" />
              <span>TỰ ĐỘNG</span>
            </div>
          </div>

            <button 
              onClick={() => {
                if (!useGameStore.getState().isAutoBattle) {
                  useGameStore.setState({ isAutoBattle: true })
                }
                executeTurn()
              }}
              disabled={isAnimating}
              style={{
                background: isAnimating 
                  ? 'linear-gradient(45deg, #475569, #64748b)'
                  : 'linear-gradient(45deg, #b45309, #f59e0b, #d97706)',
                color: '#ffffff',
                border: '2px solid #fef08a',
                padding: '14px 36px',
                fontSize: '1.15rem',
                fontWeight: 800,
                borderRadius: '30px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                boxShadow: isAnimating ? 'none' : '0 6px 25px rgba(245, 158, 11, 0.6)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '1px'
              }}
            >
              <Swords size={22} />
              {isAnimating ? 'ĐANG TỰ ĐỘNG CHIẾN ĐẤU...' : 'BẮT ĐẦU CHIẾN ĐẤU'}
            </button>
        </div>
      </div>

      {/* Main City Lobby Screen Overlay */}
      <MainLobby />

      {/* Modals UI */}
      <HeroModal />
      <StageModal />
      <VictoryModal />
      <DefeatModal />
      <GachaModal />
      <BeastModal />
      <SquadModal />
      <TowerModal />
      <WorldBossModal />
      <CodexModal />
      <PvPModal />
      <ImperialRankModal />
      <IdleModal />
      <CloudSaveModal isOpen={showCloudModal} onClose={() => setShowCloudModal(false)} />
    </div>
  )
}
