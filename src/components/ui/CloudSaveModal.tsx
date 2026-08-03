import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  cloudService,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  supabase,
  isSupabaseConfigured
} from '../../utils/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { X, CloudCheck, Database, Trophy, LogIn, LogOut, UserCheck, Lock, UserPlus, UploadCloud, DownloadCloud, AlertCircle } from 'lucide-react'

export default function CloudSaveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const importGameState = useGameStore(state => state.importGameState)

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString())
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

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

  const loadLeaderboard = async () => {
    const data = await cloudService.fetchLeaderboard()
    if (data && data.length > 0) {
      setLeaderboard(data)
    }
  }

  const handleSaveToCloud = async () => {
    setIsSyncing(true)
    setSyncStatusMsg({ type: 'info', text: 'Đang tải toàn bộ dữ liệu lên Supabase Cloud...' })
    
    const fullState = useGameStore.getState()
    const success = await cloudService.saveCloudProfile(fullState)

    if (success) {
      setLastSyncTime(new Date().toLocaleTimeString())
      setSyncStatusMsg({ type: 'success', text: 'Đã lưu toàn bộ tiến trình game lên Supabase Cloud thành công!' })
      loadLeaderboard()
    } else {
      setSyncStatusMsg({ type: 'error', text: 'Không thể lưu lên Supabase Cloud. Vui lòng kiểm tra lại kết nối mạng.' })
    }
    setIsSyncing(false)
  }

  const handleLoadFromCloud = async () => {
    setIsSyncing(true)
    setSyncStatusMsg({ type: 'info', text: 'Đang kết nối Supabase Cloud để tải bản lưu...' })

    const cloudData = await cloudService.fetchCloudProfile()
    if (cloudData) {
      if (cloudData.fullStateJson) {
        importGameState(cloudData.fullStateJson)
      } else {
        importGameState({
          gold: cloudData.gold,
          currentStageIndex: cloudData.currentStageIndex,
          maxUnlockedStage: cloudData.maxUnlockedStage,
          towerFloor: cloudData.towerFloor,
          maxTowerFloor: cloudData.maxTowerFloor,
          pvpScore: cloudData.pvpScore,
          worldBossTotalDamage: cloudData.worldBossTotalDamage,
          activeBeastId: cloudData.activeBeastId
        })
      }
      setSyncStatusMsg({ type: 'success', text: `Khôi phục thành công dữ liệu của ${cloudData.playerName} từ Supabase!` })
    } else {
      setSyncStatusMsg({ type: 'error', text: 'Không tìm thấy dữ liệu lưu đám mây cho tài khoản này.' })
    }
    setIsSyncing(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
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
        handleSaveToCloud()
        onClose()
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

        {/* Trạng Thái & Nút Thao Tác Đồng Bộ Cloud */}
        {syncStatusMsg && (
          <div style={{
            background: syncStatusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : syncStatusMsg.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
            border: syncStatusMsg.type === 'error' ? '1px solid #ef4444' : syncStatusMsg.type === 'success' ? '1px solid #22c55e' : '1px solid #38bdf8',
            color: syncStatusMsg.type === 'error' ? '#fca5a5' : syncStatusMsg.type === 'success' ? '#86efac' : '#7dd3fc',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{syncStatusMsg.text}</span>
          </div>
        )}

        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#7dd3fc', fontSize: '1.05rem' }}>
                <Database size={20} /> Tài Khoản Cloud: <span style={{ color: '#fef08a' }}>{cloudService.getPlayerName()}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                Đồng bộ lần cuối: <strong style={{ color: '#2ecc71' }}>{lastSyncTime}</strong> {isSupabaseConfigured ? '🟢 Supabase Cloud Active' : '🟡 Local Storage Active'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSaveToCloud}
              disabled={isSyncing}
              style={{
                flex: 1,
                minWidth: '200px',
                background: 'linear-gradient(45deg, #0284c7, #38bdf8)',
                border: 'none',
                color: 'white',
                borderRadius: '12px',
                padding: '12px 18px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
              }}
            >
              <UploadCloud size={20} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Đang Lưu...' : '⬆️ Tải Tiến Trình Lên Cloud'}
            </button>

            <button
              onClick={handleLoadFromCloud}
              disabled={isSyncing}
              style={{
                flex: 1,
                minWidth: '200px',
                background: 'linear-gradient(45deg, #059669, #10b981)',
                border: 'none',
                color: 'white',
                borderRadius: '12px',
                padding: '12px 18px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <DownloadCloud size={20} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Đang Tải...' : '⬇️ Khôi Phục Dữ Liệu Từ Cloud'}
            </button>
          </div>
        </div>

        {/* Bảng Xếp Hạng Top Cao Thủ Cloud */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="#f1c40f" size={20} /> Bảng Xếp Hạng Cao Thủ Toàn Máy Chủ (Supabase Cloud)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((player, idx) => (
                <div key={player.id || idx} style={{
                  background: idx === 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                  border: idx === 0 ? '1.5px solid #f1c40f' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: idx === 0 ? '#fef08a' : '#e2e8f0' }}>{player.player_name || 'Cao Thủ Sử Việt'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Màn chơi: Ải {player.max_unlocked_stage + 1} | Vàng: {Number(player.gold || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: idx === 0 ? '#f1c40f' : '#38bdf8', fontSize: '1.05rem' }}>
                    ⚔️ {player.pvp_score || 1250} Điểm PvP
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}>
                Chưa có dữ liệu bảng xếp hạng từ Supabase Cloud. Bấm "⬆️ Tải Tiến Trình Lên Cloud" để ghi danh đầu tiên!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
