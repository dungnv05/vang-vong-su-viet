import { wwwAuthUrl } from '../../utils/supabaseClient'
import { Swords, ShieldCheck, ArrowRight, Flame, LogIn, UserPlus } from 'lucide-react'

// Import Hero Avatars for Landing Showcase
import tranHungDaoAvatar from '../../assets/heroes/avatars/tran_hung_dao.png'
import baTrieuAvatar from '../../assets/heroes/avatars/ba_trieu.png'
import quangTrungAvatar from '../../assets/heroes/avatars/quang_trung.png'
import haiBaTrungAvatar from '../../assets/heroes/avatars/hai_ba_trung.png'

interface LandingPageProps {
  onPlayAsGuest: () => void
}

export default function LandingPage({ onPlayAsGuest }: LandingPageProps) {
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

        {/* Auth Actions Glassmorphic Card */}
        <div style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Primary: Sign In via YunDev */}
          <button
            type="button"
            onClick={() => window.location.assign(wwwAuthUrl('signin'))}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(45deg, #f59e0b, #d97706, #b45309)',
              border: '1px solid #fef08a',
              borderRadius: '14px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={20} />
            <span>ĐĂNG NHẬP BẰNG TÀI KHOẢN YUNDEV</span>
            <ArrowRight size={20} />
          </button>

          {/* Secondary: Sign Up via YunDev */}
          <button
            type="button"
            onClick={() => window.location.assign(wwwAuthUrl('signup'))}
            style={{
              width: '100%',
              padding: '13px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '14px',
              color: '#7dd3fc',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={18} />
            <span>TẠO TÀI KHOẢN YUNDEV</span>
          </button>

          {/* Tertiary / Outline: Guest Mode */}
          <div style={{ marginTop: '4px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onPlayAsGuest}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: '14px',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>CHƠI NGAY (CHẾ ĐỘ KHÁCH)</span>
            </button>
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
              Tiến trình lưu trên trình duyệt này.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Đăng nhập dùng chung với <span style={{ color: '#38bdf8' }}>YunDev.space</span>
        </div>
      </div>
    </div>
  )
}
