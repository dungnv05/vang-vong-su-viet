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
      background: 'var(--vv-landing-bg)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: 'var(--vv-text)'
    }}>
      {/* Background Ambient Glow & Sparks */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'var(--vv-landing-glow)',
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
          <div style={{ background: 'var(--vv-surface-glass)', border: '2px solid var(--vv-red)', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--vv-glow-red)' }}>
            <img src={quangTrungAvatar} alt="Quang Trung" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--vv-red)', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--vv-text)' }}>Quang Trung</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)' }}>Hỏa Tốc Tiến Công</div>
            </div>
          </div>

          <div style={{ background: 'var(--vv-surface-glass)', border: '2px solid var(--vv-gold-solid)', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--vv-glow-gold)' }}>
            <img src={haiBaTrungAvatar} alt="Hai Bà Trưng" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--vv-gold)', fontWeight: 900 }}>🟡 SSR • TUYỆT PHẨM</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--vv-text)' }}>Hai Bà Trưng</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)' }}>Mê Linh Khởi Nghĩa</div>
            </div>
          </div>
        </div>

        {/* Right Side Hero Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', transform: 'rotate(6deg)' }}>
          <div style={{ background: 'var(--vv-surface-glass)', border: '2px solid var(--vv-red)', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--vv-glow-red)' }}>
            <img src={tranHungDaoAvatar} alt="Trần Hưng Đạo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--vv-red)', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--vv-text)' }}>Trần Hưng Đạo</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)' }}>Vạn Kiếp Tông Bí Truyền</div>
            </div>
          </div>

          <div style={{ background: 'var(--vv-surface-glass)', border: '2px solid var(--vv-red)', borderRadius: '20px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--vv-glow-red)' }}>
            <img src={baTrieuAvatar} alt="Bà Triệu" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--vv-red)', fontWeight: 900 }}>🔴 UR • THƯỢNG CỔ</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--vv-text)' }}>Bà Triệu</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)' }}>Đạp Luồng Sóng Dữ</div>
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
            <Swords size={32} color="var(--vv-gold)" />
            <Flame size={32} color="var(--vv-red)" />
            <ShieldCheck size={32} color="var(--vv-green)" />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.6rem',
            fontWeight: 900,
            background: 'var(--vv-title-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            textShadow: 'var(--vv-title-shadow)'
          }}>
            VANG VỌNG SỬ VIỆT 3D
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--vv-muted)', fontWeight: 500 }}>
            Idle Gacha Danh Nhân Lịch Sử • Tái Hiện Hào Khí Đông A
          </p>
        </div>

        {/* Auth Actions Glassmorphic Card */}
        <div style={{
          width: '100%',
          background: 'var(--vv-card-bg)',
          backdropFilter: 'blur(16px)',
          border: '2px solid var(--vv-gold-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--vv-card-shadow)',
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
              background: 'var(--vv-btn-gold-grad)',
              border: '1px solid var(--vv-btn-gold-border)',
              borderRadius: '14px',
              color: 'var(--vv-on-solid)',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: 'var(--vv-btn-gold-shadow)',
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
              background: 'var(--vv-sky-tint)',
              border: '1px solid var(--vv-sky-border)',
              borderRadius: '14px',
              color: 'var(--vv-sky-text)',
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
                border: '1px solid var(--vv-secondary-border)',
                borderRadius: '14px',
                color: 'var(--vv-text-2)',
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
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--vv-muted)' }}>
              Tiến trình lưu trên trình duyệt này.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--vv-subtle)' }}>
          Đăng nhập dùng chung với <span style={{ color: 'var(--vv-sky)' }}>YunDev.space</span>
        </div>
      </div>
    </div>
  )
}
