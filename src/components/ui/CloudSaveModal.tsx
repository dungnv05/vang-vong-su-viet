import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  cloudService,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  supabase
} from '../../utils/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { X, CloudCheck, Database, Trophy, RefreshCw, LogIn, LogOut, UserCheck, Lock, UserPlus } from 'lucide-react'

export default function CloudSaveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const gold = useGameStore(state => state.gold)
  const currentStageIndex = useGameStore(state => state.currentStageIndex)
  const maxUnlockedStage = useGameStore(state => state.maxUnlockedStage)
  const activeBeastId = useGameStore(state => state.activeBeastId)

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString())
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Auth State
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [authEmail, setAuthEmail] = useState<string>('')
  const [authPassword, setAuthPassword] = useState<string>('')
  const [authLoading, setAuthLoading] = useState<boolean>(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    await cloudService.saveCloudProfile({
      gold,
      currentStage: currentStageIndex,
      maxUnlockedStage,
      activeBeastId
    })
    setLastSyncTime(new Date().toLocaleTimeString())
    setIsSyncing(false)
  }

  useEffect(() => {
    if (isOpen) {
      handleManualSync()
    }
  }, [isOpen])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage(null)

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(authEmail, authPassword)
        if (error) throw error
        setAuthMessage({ type: 'success', text: 'Đăng ký thành công! Bạn có thể sử dụng tài khoản này trên yundev.space.' })
      } else {
        const { data, error } = await signInWithEmail(authEmail, authPassword)
        if (error) throw error
        setCurrentUser(data.user)
        setShowAuthForm(false)
        setAuthMessage({ type: 'success', text: 'Đăng nhập thành công!' })
        handleManualSync()
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Thao tác thất bại. Vui lòng thử lại.' })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOutUser()
    setCurrentUser(null)
    setAuthMessage({ type: 'success', text: 'Đã đăng xuất tài khoản YunDev.' })
  }

  if (!isOpen) return null

  return (
    <div style={{
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
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(56, 189, 248, 0.3)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={onClose}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CloudCheck color="#38bdf8" /> Supabase Cloud Save & Synchronized SSO Auth
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Đồng bộ tài khoản & dữ liệu game trực tiếp qua Supabase PostgreSQL trên hệ sinh thái <code>*.yundev.space</code>.
        </p>

        {/* Trạng Thái Tài Khoản Supabase SSO */}
        <div style={{
          background: currentUser ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: currentUser ? '1px solid #22c55e' : '1px solid #f59e0b',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: currentUser ? '#4ade80' : '#fbbf24' }}>
              {currentUser ? <UserCheck size={20} /> : <Lock size={20} />}
              <span>{currentUser ? `Đã đăng nhập: ${currentUser.email}` : 'Tài khoản: Khách (Chưa đăng nhập)'}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              {currentUser
                ? 'Tiến trình game được đồng bộ tự động với tài khoản YunDev Ecosystem.'
                : 'Đăng nhập tài khoản YunDev để đồng bộ tiến trình game với website yundev.space.'}
            </div>
          </div>

          <div>
            {currentUser ? (
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            ) : (
              <button
                onClick={() => setShowAuthForm(!showAuthForm)}
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <LogIn size={16} /> {showAuthForm ? 'Ẩn Form Đăng Nhập' : 'Đăng Nhập / Đăng Ký'}
              </button>
            )}
          </div>
        </div>

        {/* Auth Form Form Modal inside CloudSaveModal */}
        {showAuthForm && !currentUser && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #38bdf8',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSignUp ? <UserPlus size={18} /> : <Lock size={18} />} {isSignUp ? 'Tạo Tài Khoản YunDev' : 'Đăng Nhập YunDev SSO'}
            </h3>

            {authMessage && (
              <div style={{
                background: authMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                border: authMessage.type === 'error' ? '1px solid #ef4444' : '1px solid #22c55e',
                color: authMessage.type === 'error' ? '#fca5a5' : '#86efac',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '12px'
              }}>
                {authMessage.text}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@yundev.space"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#020617',
                    border: '1px solid #334155',
                    color: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#020617',
                    border: '1px solid #334155',
                    color: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
                </button>

                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    background: 'linear-gradient(45deg, #0284c7, #38bdf8)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 'bold',
                    cursor: authLoading ? 'wait' : 'pointer'
                  }}
                >
                  {authLoading ? 'Đang xử lý...' : (isSignUp ? 'Đăng Ký' : 'Đăng Nhập')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trạng Thái Kết Nối Cloud */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#7dd3fc' }}>
              <Database size={18} /> Tên / Mã Người Chơi Cloud: <span style={{ color: '#fef08a' }}>{cloudService.getPlayerName()}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Lần đồng bộ Cloud gần nhất: <strong style={{ color: '#2ecc71' }}>{lastSyncTime}</strong> (Tự động đồng bộ khi quay Gacha & Thắng ải)
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{
              background: 'linear-gradient(45deg, #0284c7, #38bdf8)',
              border: 'none',
              color: 'white',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Ngay'}
          </button>
        </div>

        {/* Bảng Xếp Hạng Top Cao Thủ Cloud */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="#f1c40f" size={20} /> Bảng Xếp Hạng Top Cao Thủ Toàn Máy Chủ (Supabase Cloud)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1.5px solid #f1c40f',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🥇</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fef08a' }}>Minh Hoàng (Quân Vương Sử Việt)</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Màn chơi: Ải 5 (Ngọc Hồi - Đống Đa)</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#f1c40f', fontSize: '1.05rem' }}>
                ⚔️ 38,500 Lực Chiến
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🥈</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Bảo Quốc (Đại Tướng Lam Sơn)</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Màn chơi: Ải 4 (Chi Lăng)</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '1.05rem' }}>
                ⚔️ 24,100 Lực Chiến
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🥉</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{cloudService.getPlayerName()} (Bạn)</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Màn chơi: Ải {currentStageIndex + 1}</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#2ecc71', fontSize: '1.05rem' }}>
                ⚔️ Đang Xếp Hạng...
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
