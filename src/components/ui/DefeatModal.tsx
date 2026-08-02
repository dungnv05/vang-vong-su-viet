import { useGameStore } from '../../store/gameStore'
import { ArrowLeft, RotateCcw } from 'lucide-react'

export default function DefeatModal() {
  const showDefeatModal = useGameStore(state => state.showDefeatModal)
  const setShowDefeatModal = useGameStore(state => state.setShowDefeatModal)
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen)
  const selectStage = useGameStore(state => state.selectStage)
  const currentStageIndex = useGameStore(state => state.currentStageIndex)
  const gameMode = useGameStore(state => state.gameMode)

  if (!showDefeatModal) return null

  const handleRetry = () => {
    setShowDefeatModal(false)
    if (gameMode === 'CAMPAIGN') {
      selectStage(currentStageIndex)
    } else {
      setCurrentScreen('LOBBY')
    }
  }

  const handleReturnLobby = () => {
    setShowDefeatModal(false)
    setCurrentScreen('LOBBY')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4a0404 0%, #1a0202 100%)',
        border: '3px solid #e74c3c',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '480px',
        padding: '36px',
        boxShadow: '0 10px 60px rgba(231, 76, 60, 0.4)',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Banner Thất Bại */}
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>☠️</div>
        <h1 style={{
          margin: 0,
          fontSize: '2.4rem',
          fontWeight: 900,
          background: 'linear-gradient(45deg, #ff6b6b, #e74c3c, #c0392b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          TỬ TRẬN SA TRƯỜNG!
        </h1>

        <p style={{ margin: '10px 0 32px 0', fontSize: '1rem', color: '#cbd5e1' }}>
          Đội hình của bạn đã bị tiêu diệt hoàn toàn. Hãy cường hóa trang bị, nâng cấp tướng và thử lại!
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <button
            onClick={handleRetry}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #c0392b, #e74c3c)',
              border: '2px solid #ff6b6b',
              color: 'white',
              padding: '16px',
              borderRadius: '30px',
              fontSize: '1.15rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(231, 76, 60, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <RotateCcw size={20} />
            <span>THỬ LẠI LẦN NỮA</span>
          </button>

          <button
            onClick={handleReturnLobby}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#cbd5e1',
              padding: '16px',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <ArrowLeft size={20} />
            <span>RÚT QUÂN VỀ SẢNH CHÍNH</span>
          </button>
        </div>
      </div>
    </div>
  )
}
