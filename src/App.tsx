import { useEffect } from 'react'
import Arena2D from './components/2d/Arena2D'
import HUD from './components/ui/HUD'
import { cloudService } from './utils/supabaseClient'
import { useGameStore } from './store/gameStore'

export default function App() {
  useEffect(() => {
    // Tự động khôi phục dữ liệu tiến trình mới nhất từ Supabase Cloud khi người chơi mở lại trang
    async function restoreCloudOnAppStart() {
      try {
        const cloudProfile = await cloudService.fetchCloudProfile()
        if (cloudProfile && cloudProfile.fullStateJson) {
          useGameStore.getState().importGameState(cloudProfile.fullStateJson)
        }
      } catch (err) {
        console.warn('Auto restore on startup fallback:', err)
      }
    }
    restoreCloudOnAppStart()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', position: 'relative' }}>
      {/* Lớp chiến trường 2D thuần túy */}
      <Arena2D />

      {/* Lớp hiển thị UI 2D đè lên trên (HUD/Gacha/Codex) */}
      <HUD />
    </div>
  )
}
