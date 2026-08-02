import { useGameStore } from '../../store/gameStore'

// Spirit & Elemental VFX configuration for heroes
const HERO_VFX_MAP: Record<string, { icon: string; title: string; color: string; bgGradient: string; particles: string[] }> = {
  'h7': { // Thánh Gióng
    icon: '⚡',
    title: 'SÉT VÀNG PHÙ ĐỔNG',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.95))',
    particles: ['⚡', '🐎', '🔥', '🌾', '⚡']
  },
  'h3': { // Trần Hưng Đạo
    icon: '⚔️',
    title: 'HÀO KHÍ ĐÔNG A',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(88, 28, 135, 0.95))',
    particles: ['⚔️', '🛡️', '🐉', '✨', '🗡️']
  },
  'h4': { // Quang Trung
    icon: '🔥',
    title: 'BẮC BÌNH HỎA LONG',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(153, 27, 27, 0.95))',
    particles: ['🔥', '🐉', '💥', '💣', '🔥']
  },
  'h6': { // Bà Triệu
    icon: '🐘',
    title: 'NHỊ HA UY PHONG',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(157, 23, 77, 0.95))',
    particles: ['🐘', '🌊', '⚔️', '🛡️']
  },
  'h5': { // Hai Bà Trưng
    icon: '🐘',
    title: 'MÊ LINH KHỞI NGHĨA',
    color: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.9), rgba(159, 18, 57, 0.95))',
    particles: ['🐘', '🗡️', '🌸', '✨']
  },
  'h2': { // Nguyễn Trãi
    icon: '🍃',
    title: 'ỨC TRAI BÌNH NGÔ',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(3, 105, 161, 0.95))',
    particles: ['📜', '🍃', '✒️', '✨', '📖']
  },
  'h1': { // Lê Lợi
    icon: '🐉',
    title: 'THUẬN THIÊN KIẾM QUANG',
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.9), rgba(161, 98, 7, 0.95))',
    particles: ['🐉', '🗡️', '👑', '✨', '🔥']
  }
}

const DEFAULT_VFX = {
  icon: '⚔️',
  title: 'TUYỆT KỸ HOÀNH TRÁNG',
  color: '#f1c40f',
  bgGradient: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
  particles: ['✨', '⚔️', '💥', '🔥']
}

export default function ComboVFX2D() {
  const currentScreen = useGameStore(state => state.currentScreen)
  const comboBanner = useGameStore(state => state.comboBanner)
  const activeAttackerId = useGameStore(state => state.activeAttackerId)
  const actionText = useGameStore(state => state.actionText)
  const heroes = useGameStore(state => state.heroes)
  const enemies = useGameStore(state => state.enemies)

  if (currentScreen !== 'BATTLE') return null

  // Find attacker hero data
  const attackerHero = [...heroes, ...enemies].find(h => h.id === activeAttackerId)
  const isSynergy = comboBanner?.includes('[HỢP KỸ]')
  const isUltimate = comboBanner?.includes('[TUYỆT KỸ]') || isSynergy

  const vfx = attackerHero ? (HERO_VFX_MAP[attackerHero.id] || DEFAULT_VFX) : DEFAULT_VFX

  return (
    <>
      {/* 1. HERO CUT-IN PORTRAIT POPUP (Anime / Gacha RPG Style) */}
      {isUltimate && attackerHero && (
        <div 
          key={`cutin-${attackerHero.id}-${comboBanner}`}
          style={{
            position: 'absolute',
            top: '32%',
            left: attackerHero.isEnemy ? 'auto' : '5%',
            right: attackerHero.isEnemy ? '5%' : 'auto',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 10000,
            pointerEvents: 'none',
            animation: 'cutInSlide 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Backdrop Slanted Badge */}
          <div style={{
            background: vfx.bgGradient,
            border: `2px solid ${vfx.color}`,
            borderRadius: '20px',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: `0 8px 32px ${vfx.color}80`,
            transform: 'skewX(-12deg)',
            color: 'white'
          }}>
            {/* Hero Portrait */}
            <div style={{
              transform: 'skewX(12deg)',
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: `2px solid #fff`,
              background: '#0f172a',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {attackerHero.avatarUrl ? (
                <img 
                  src={attackerHero.avatarUrl} 
                  alt={attackerHero.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '2.2rem' }}>{vfx.icon}</span>
              )}
            </div>

            {/* Hero & Skill Title Info */}
            <div style={{ transform: 'skewX(12deg)', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fef08a',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {isSynergy ? '💥 HỢP KỸ DÂN TỘC' : '👑 TUYỆT KỸ TƯỚNG'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic' }}>
                  {vfx.title}
                </span>
              </div>

              <h2 style={{
                margin: '4px 0 0 0',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                letterSpacing: '1px'
              }}>
                {attackerHero.name}
              </h2>

              <div style={{ fontSize: '0.9rem', color: '#fef08a', fontWeight: 'bold', marginTop: '2px' }}>
                {comboBanner}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELEMENTAL SPIRIT PARTICLES OVERLAY */}
      {isUltimate && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 99,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {vfx.particles.map((p, idx) => (
            <div 
              key={`p-${idx}-${p}`}
              style={{
                position: 'absolute',
                top: `${20 + idx * 15}%`,
                left: `${15 + (idx * 18) % 70}%`,
                fontSize: `${2.5 + (idx % 3) * 0.8}rem`,
                animation: `particleFloat ${1.2 + idx * 0.2}s ease-out forwards`,
                filter: 'drop-shadow(0 0 10px rgba(241, 196, 15, 0.8))',
                opacity: 0.9
              }}
            >
              {p}
            </div>
          ))}
        </div>
      )}

      {/* 3. SYNERGY BEAM CONNECT OVERLAY */}
      {isSynergy && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '6px',
          background: 'linear-gradient(90deg, transparent, #f1c40f, #38bdf8, #f1c40f, transparent)',
          boxShadow: '0 0 25px #f1c40f, 0 0 45px #38bdf8',
          zIndex: 98,
          pointerEvents: 'none',
          animation: 'synergyBeam 0.8s ease-in-out'
        }} />
      )}

      {/* 4. MAIN BANNER OVERLAY */}
      {comboBanner && (
        <div 
          key={`combo-${comboBanner}`}
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10000,
            pointerEvents: 'none',
            animation: 'floatUp 1.5s ease-out forwards'
          }}>
          <div style={{
            background: 'linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.95), transparent)',
            width: '100vw',
            padding: '14px 0',
            textAlign: 'center',
            borderTop: `2px solid ${vfx.color}`,
            borderBottom: `2px solid ${vfx.color}`
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#fef08a',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              letterSpacing: '3px',
              fontStyle: 'italic',
              textTransform: 'uppercase'
            }}>
              {comboBanner}
            </h1>
          </div>
        </div>
      )}

      {/* 5. SLASH & ATTACK OVERLAY */}
      {activeAttackerId && (
        <div 
          key={`slash-${activeAttackerId}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            width: '150%',
            height: '20px',
            background: `linear-gradient(90deg, transparent, ${vfx.color}, transparent)`,
            zIndex: 95,
            pointerEvents: 'none',
            animation: 'slash 0.2s ease-in-out'
          }}
        />
      )}

      {/* 6. ACTION DAMAGE TEXT OVERLAY */}
      {actionText && (
        <div 
          key={`action-${actionText}`}
          style={{
            position: 'absolute',
            top: '16%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(239,68,68,0.8)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'floatUp 1s ease-out forwards'
          }}
        >
          {actionText}
        </div>
      )}

      <style>
        {`
          @keyframes cutInSlide {
            0% { transform: translateY(-50%) translateX(-80px) scale(0.8); opacity: 0; }
            20% { transform: translateY(-50%) translateX(0) scale(1.05); opacity: 1; }
            80% { transform: translateY(-50%) translateX(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50%) translateX(40px) scale(0.95); opacity: 0; }
          }
          @keyframes particleFloat {
            0% { transform: translateY(20px) scale(0.5); opacity: 0; }
            30% { transform: translateY(-10px) scale(1.3); opacity: 1; }
            100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
          }
          @keyframes synergyBeam {
            0% { transform: translateY(-50%) scaleY(0); opacity: 0; }
            50% { transform: translateY(-50%) scaleY(2); opacity: 1; }
            100% { transform: translateY(-50%) scaleY(0); opacity: 0; }
          }
          @keyframes slash {
            0% { transform: translate(-50%, -50%) rotate(-45deg) scaleX(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) rotate(-45deg) scaleX(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) rotate(-45deg) scaleX(0); opacity: 0; }
          }
          @keyframes floatUp {
            0% { top: 18%; opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { top: 10%; opacity: 0; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </>
  )
}
