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
    <div onClick={() => setShowDefeatModal(false)} style={{
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
        background: 'var(--vv-defeat-panel-grad)',
        border: '3px solid var(--vv-red-solid)',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '480px',
        padding: '36px',
        boxShadow: 'var(--vv-defeat-shadow)',
        color: 'var(--vv-text)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Banner Thất Bại */}
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>☠️</div>
        <h1 style={{
          margin: 0,
          fontSize: '2.4rem',
          fontWeight: 900,
          background: 'var(--vv-defeat-title-grad)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          TỬ TRẬN SA TRƯỜNG!
        </h1>

        <p style={{ margin: '10px 0 32px 0', fontSize: '1rem', color: 'var(--vv-text-2)' }}>
          Đội hình của bạn đã bị tiêu diệt hoàn toàn. Hãy cường hóa trang bị, nâng cấp tướng và thử lại!
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <button
            onClick={handleRetry}
            style={{
              width: '100%',
              background: 'var(--vv-menu-red-grad)',
              border: '2px solid var(--vv-btn-red-border)',
              color: 'var(--vv-on-solid)',
              padding: '16px',
              borderRadius: '30px',
              fontSize: '1.15rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: 'var(--vv-menu-red-shadow)',
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
              background: 'var(--vv-secondary-bg)',
              border: '1px solid var(--vv-secondary-border)',
              color: 'var(--vv-text-2)',
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
