import { useState, useEffect } from 'react'
import Arena2D from './components/2d/Arena2D'
import HUD from './components/ui/HUD'
import LandingPage from './components/ui/LandingPage'
import { cloudService, supabase } from './utils/supabaseClient'
import { useGameStore } from './store/gameStore'
import type { User } from '@supabase/supabase-js'

export default function App() {
  const [user, setUser] = useState<User | null>(cloudService.getCurrentUser())
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true)

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoadingAuth(false)
    })

    // Listen to real-time auth changes (Login / Logout / SignUp)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      setLoadingAuth(false)
      
      if (currentUser) {
        // Tự động khôi phục dữ liệu tiến trình từ Supabase Cloud khi vừa đăng nhập thành công
        cloudService.fetchCloudProfile().then(cloudProfile => {
          if (cloudProfile && cloudProfile.fullStateJson) {
            useGameStore.getState().importGameState(cloudProfile.fullStateJson)
          }
        }).catch(err => console.warn('Cloud restore on auth change fallback:', err))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // If still checking initial auth session
  if (loadingAuth) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#020617',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#f59e0b',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        ⏳ ĐANG XÁC THỰC TÀI KHOẢN GAME...
      </div>
    )
  }

  // Khách chưa đăng nhập -> Chỉ hiển thị Landing Page Đăng nhập / Đăng ký
  if (!user) {
    return <LandingPage onAuthenticated={() => setLoadingAuth(false)} />
  }

  // Đã đăng nhập -> Bắt đầu chơi Game
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', position: 'relative' }}>
      {/* Lớp chiến trường 2D thuần túy */}
      <Arena2D />

      {/* Lớp hiển thị UI 2D đè lên trên (HUD/Gacha/Codex) */}
      <HUD />
    </div>
  )
}
