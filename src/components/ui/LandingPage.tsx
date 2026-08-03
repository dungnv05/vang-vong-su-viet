import { useState, useEffect } from 'react'
import { supabase, signInWithEmail, signUpWithEmail } from '../../utils/supabaseClient'
import { Swords, ShieldCheck, Sparkles, Lock, Mail, ArrowRight, Flame, CheckCircle2, AlertCircle } from 'lucide-react'

// Import Hero Avatars for Landing Showcase
import tranHungDaoAvatar from '../../assets/heroes/avatars/tran_hung_dao.png'
import baTrieuAvatar from '../../assets/heroes/avatars/ba_trieu.png'
import quangTrungAvatar from '../../assets/heroes/avatars/quang_trung.png'
import haiBaTrungAvatar from '../../assets/heroes/avatars/hai_ba_trung.png'

interface LandingPageProps {
  onAuthenticated?: () => void
}

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Listen to Supabase auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (onAuthenticated) onAuthenticated()
      }
    })
    return () => subscription.unsubscribe()
  }, [onAuthenticated])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu!')
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp!')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const res = await signUpWithEmail(email, password)
        if (res.error) {
          setErrorMsg(res.error.message)
        } else {
          setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.')
          setIsSignUp(false)
        }
      } else {
        const res = await signInWithEmail(email, password)
        if (res.error) {
          setErrorMsg(res.error.message)
        } else if (res.data?.session) {
          setSuccessMsg('Đăng nhập thành công! Đang vào game...')
          if (onAuthenticated) onAuthenticated()
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đã xảy ra lỗi kết nối!')
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Account Auto-Fill / Auto-Login for Instant Testing
  const handleQuickDemoLogin = async () => {
    setEmail('demo@yundev.space')
    setPassword('123456')
    setLoading(true)
    setErrorMsg(null)
    try {
      let res = await signInWithEmail('demo@yundev.space', '123456')
      if (res.error) {
        // Try sign up if demo account does not exist yet
        await signUpWithEmail('demo@yundev.space', '123456')
        res = await signInWithEmail('demo@yundev.space', '123456')
      }
      if (res.data?.session && onAuthenticated) {
        onAuthenticated()
      }
    } catch {
      setErrorMsg('Không thể tự động đăng nhập demo, vui lòng tự nhập email!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: '#ffffff'
    }}>
      {/* Background Ambient Glow & Sparks */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.15) 50%, transparent 80%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Decorative Floating Hero Cards Showcase */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px'
      }}>
        {/* Left Side Hero Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', transform: 'rotate(-6deg)' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '2px solid #ef4444', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
            <img src={quangTrungAvatar} alt="Quang Trung" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>Quang Trung</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Hỏa Tốc Tiến Công</div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '2px solid #f59e0b', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)' }}>
            <img src={haiBaTrungAvatar} alt="Hai Bà Trưng" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 900 }}>🟡 SSR • TUYỆT PHẨM</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>Hai Bà Trưng</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Mê Linh Khởi Nghĩa</div>
            </div>
          </div>
        </div>

        {/* Right Side Hero Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', transform: 'rotate(6deg)' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '2px solid #ef4444', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
            <img src={tranHungDaoAvatar} alt="Trần Hưng Đạo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>Trần Hưng Đạo</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Vạn Kiếp Tông Bí Truyền</div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '2px solid #ef4444', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
            <img src={baTrieuAvatar} alt="Bà Triệu" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>Bà Triệu</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Đạp Luồng Sóng Dữ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        zIndex: 10,
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Game Logo Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <Swords size={32} color="#f59e0b" />
            <Flame size={32} color="#ef4444" />
            <ShieldCheck size={32} color="#22c55e" />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.6rem',
            fontWeight: 900,
            background: 'linear-gradient(45deg, #fef08a, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            textShadow: '0 0 40px rgba(245, 158, 11, 0.5)'
          }}>
            VANG VỌNG SỬ VIỆT 3D
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
            Idle Gacha Danh Nhân Lịch Sử • Tái Hiện Hào Khí Đông A
          </p>
        </div>

        {/* Auth Form Glassmorphic Card */}
        <div style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.2)'
        }}>
          {/* Tab Switcher: Sign In / Sign Up */}
          <div style={{
            display: 'flex',
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                background: !isSignUp ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: !isSignUp ? '#ffffff' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: !isSignUp ? '0 2px 10px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              🔑 ĐĂNG NHẬP
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                background: isSignUp ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: isSignUp ? '#ffffff' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSignUp ? '0 2px 10px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              📝 ĐĂNG KÝ MỚI
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.82rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid #22c55e',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.82rem',
              color: '#86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email Field */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
                EMAIL TÀI KHOẢN
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nhap_email@yundev.space"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
                MẬT KHẨU
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
                  XÁC NHẬN MẬT KHẨU
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(45deg, #f59e0b, #d97706, #b45309)',
                border: '1px solid #fef08a',
                borderRadius: '14px',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <span>ĐANG XỬ LÝ...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'TẠO TÀI KHOẢN & VÀO GAME' : 'ĐĂNG NHẬP VÀO GAME'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Experience Button */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#86efac',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={16} color="#86efac" />
              <span>Dùng Tài Khoản Demo Nhập Nhập Nhanh</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Đồng bộ đăng nhập SSO dùng chung hệ thống <span style={{ color: '#38bdf8' }}>*.yundev.space</span>
        </div>
      </div>
    </div>
  )
}
