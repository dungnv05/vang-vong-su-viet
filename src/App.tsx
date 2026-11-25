import { useState, useEffect, useRef } from 'react'
import Arena2D from './components/2d/Arena2D'
import HUD from './components/ui/HUD'
import LandingPage from './components/ui/LandingPage'
import ThemeToggle from './components/ui/ThemeToggle'
import { cloudService, fetchWwwUser, type WwwUser } from './utils/supabaseClient'
import { getSyncController } from './cloud/runtime'

export default function App() {
  const [user, setUser] = useState<WwwUser | null>(() => cloudService.getCurrentUser())
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true)
  const [guest, setGuest] = useState<boolean>(() => localStorage.getItem('vv_guest_mode') === '1')
  const syncedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true
    let lastCheck = Date.now()

    const syncAuthUser = (u: WwwUser | null) => {
      try {
        if (u) {
          if (syncedUserIdRef.current !== u.id) {
            syncedUserIdRef.current = u.id
            void getSyncController().start(u.id)
          }
        } else {
          syncedUserIdRef.current = null
          getSyncController().stop()
        }
      } catch {
        // Ignore sync controller errors
      }
    }

    fetchWwwUser().then(u => {
      if (!mounted) return
      cloudService.setCurrentUser(u)
      syncAuthUser(u)
      setUser(u)
      setLoadingAuth(false)
    })

    const recheckAuth = () => {
      const now = Date.now()
      if (now - lastCheck < 30_000) return
      lastCheck = now
      fetchWwwUser().then(u => {
        if (!mounted) return
        cloudService.setCurrentUser(u)
        syncAuthUser(u)
        setUser(u)
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recheckAuth()
      }
    }

    window.addEventListener('focus', recheckAuth)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      window.removeEventListener('focus', recheckAuth)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const renderScreen = () => {
    // If still checking initial auth session
    if (loadingAuth) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: 'var(--vv-bg)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--vv-gold)',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          ⏳ ĐANG XÁC THỰC TÀI KHOẢN GAME...
        </div>
      )
    }

    // Khách chưa đăng nhập và chưa chọn chế độ khách -> Hiển thị Landing Page
    if (!user && !guest) {
      return (
        <LandingPage
          onPlayAsGuest={() => {
            localStorage.setItem('vv_guest_mode', '1')
            setGuest(true)
          }}
        />
      )
    }

    // Đã đăng nhập hoặc chơi chế độ khách -> Bắt đầu chơi Game
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--vv-canvas-bg)', position: 'relative' }}>
        {/* Lớp chiến trường 2D thuần túy */}
        <Arena2D />

        {/* Lớp hiển thị UI 2D đè lên trên (HUD/Gacha/Codex) */}
        <HUD />
      </div>
    )
  }

  const showFloatingToggle = loadingAuth || (!user && !guest)

  return (
    <>
      {showFloatingToggle && <ThemeToggle variant="floating" />}
      {renderScreen()}
    </>
  )
}
