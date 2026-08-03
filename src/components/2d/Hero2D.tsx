import { useState, useMemo, useEffect, useRef } from 'react'
import { get2DSlotPosition, type HeroData } from '../../data/heroes'
import { useGameStore } from '../../store/gameStore'
import { getRarityTheme } from '../../utils/rarityColors'
import heroPlaceholder from '../../assets/hero.png'

interface Hero2DProps {
  data: HeroData
}

export default function Hero2D({ data }: Hero2DProps) {
  const activeAttackerId = useGameStore(state => state.activeAttackerId)
  const draggingHeroId = useGameStore(state => state.draggingHeroId)

  const isDragging = draggingHeroId === data.id
  const isAttacking = activeAttackerId === data.id
  const theme = getRarityTheme(data.rarity)
  
  // Track HP changes for Hit & Heal Floating Popups
  const prevHpRef = useRef(data.hp)
  const [isHit, setIsHit] = useState(false)
  const [hitInfo, setHitInfo] = useState<{ type: 'damage' | 'heal'; value: number; isCrit: boolean; key: number } | null>(null)

  useEffect(() => {
    if (data.hp < prevHpRef.current) {
      const dmgTaken = prevHpRef.current - data.hp
      const isCrit = dmgTaken > 600
      setIsHit(true)
      setHitInfo({ type: 'damage', value: dmgTaken, isCrit, key: Date.now() })

      const timer = setTimeout(() => setIsHit(false), 300)
      const popupTimer = setTimeout(() => setHitInfo(null), 1000)

      prevHpRef.current = data.hp
      return () => {
        clearTimeout(timer)
        clearTimeout(popupTimer)
      }
    } else if (data.hp > prevHpRef.current) {
      const healVal = data.hp - prevHpRef.current
      setHitInfo({ type: 'heal', value: healVal, isCrit: healVal > 500, key: Date.now() })
      const popupTimer = setTimeout(() => setHitInfo(null), 1000)
      prevHpRef.current = data.hp
      return () => clearTimeout(popupTimer)
    } else {
      prevHpRef.current = data.hp
    }
  }, [data.hp])

  // Calculate Base Position
  const basePos = useMemo(() => get2DSlotPosition(data.isEnemy || false, data.slotIndex), [data.isEnemy, data.slotIndex])
  
  // Apply Attack Offset
  let currentLeft = basePos.left
  if (isAttacking) {
    const leftVal = parseInt(basePos.left.replace('%', ''))
    // Lướt tới trước mặt đối thủ 1 chút
    currentLeft = data.isEnemy ? `${leftVal - 20}%` : `${leftVal + 20}%`
  }

  // Nếu đang được kéo thả (chưa code chi tiết drag event trong 2D, tạm ẩn hoặc làm mờ)
  if (isDragging) {
    return null; // Tạm thời ẩn tướng đang bị kéo trong kho (HUD xử lý drag riêng)
  }

  // Animation CSS classes
  const isUltimate = (data.rage || 0) >= (data.maxRage || 100)
  
  return (
    <div 
      className="hero-2d-card"
      style={{
        position: 'absolute',
        left: currentLeft,
        top: basePos.top,
        zIndex: isAttacking ? 100 : basePos.zIndex,
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '90px'
      }}
    >
      {/* Floating Damage & Heal Popups */}
      {hitInfo && (
        <div
          key={`popup-${hitInfo.key}`}
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: hitInfo.isCrit ? '1.45rem' : '1.15rem',
            fontWeight: 900,
            color: hitInfo.type === 'heal' ? '#2ecc71' : hitInfo.isCrit ? '#fef08a' : '#ef4444',
            textShadow: hitInfo.type === 'heal'
              ? '0 0 10px #10b981, 0 2px 4px #000'
              : hitInfo.isCrit 
                ? '0 0 12px #f59e0b, 0 2px 4px #000' 
                : '0 0 8px #dc2626, 0 2px 4px #000',
            pointerEvents: 'none',
            zIndex: 999,
            animation: 'dmgFloat 0.9s ease-out forwards',
            whiteSpace: 'nowrap',
            letterSpacing: '1px'
          }}
        >
          {hitInfo.type === 'heal' 
            ? `${hitInfo.isCrit ? '💥 CHÍ MẠNG! ' : ''}+${hitInfo.value.toLocaleString()} HP`
            : hitInfo.isCrit 
              ? `💥 CHÍ MẠNG! -${hitInfo.value.toLocaleString()}` 
              : `-${hitInfo.value.toLocaleString()}`}
        </div>
      )}

      {/* Hiệu ứng Nộ Khí (Rage Aura) nếu đầy Nộ */}
      {isUltimate && (
        <div 
          style={{
            position: 'absolute',
            top: '-10px',
            left: '-10px',
            right: '-10px',
            bottom: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(241, 196, 15, 0.6) 0%, rgba(241, 196, 15, 0) 70%)',
            animation: 'pulse 1s infinite alternate',
            zIndex: -1
          }}
        />
      )}

      {/* Ảnh Avatar Nhân Vật (Standee) */}
      <img 
        src={data.avatarUrl || heroPlaceholder} 
        alt={data.name}
        style={{
          height: '110px',
          objectFit: 'contain',
          filter: data.hp === 0 ? 'grayscale(100%) opacity(0.5)' : isHit ? 'brightness(115%) drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : 'none',
          transform: data.isEnemy ? 'scaleX(-1)' : 'none',
          animation: isHit ? 'hitShake 0.3s ease-in-out' : 'none'
        }}
      />

      {/* UI: Thanh Máu & Nộ & Rarity Badge */}
      <div style={{ width: '100%', background: 'rgba(0,0,0,0.75)', border: `1px solid ${theme.borderHex}`, borderRadius: '6px', padding: '4px', marginTop: '4px', boxShadow: theme.glowBoxShadow }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {!data.isEnemy && (
            <span style={{
              background: theme.badgeBg,
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: 900,
              padding: '0px 4px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              {theme.rarity}
            </span>
          )}
          <span style={{ fontSize: '11px', color: data.isEnemy ? '#ff4d4d' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {data.name}
          </span>
        </div>
        
        {/* HP Bar */}
        <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', marginTop: '2px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.max(0, (data.hp / data.maxHp) * 100)}%`, 
            height: '100%', 
            background: data.hp > data.maxHp * 0.3 ? '#2ecc71' : '#e74c3c',
            transition: 'width 0.3s'
          }} />
        </div>

        {/* Rage Bar */}
        <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.max(0, ((data.rage || 0) / (data.maxRage || 100)) * 100)}%`, 
            height: '100%', 
            background: '#f1c40f',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <style>
        {`
          @keyframes hitShake {
            0% { transform: ${data.isEnemy ? 'scaleX(-1)' : 'none'} translateX(0); }
            25% { transform: ${data.isEnemy ? 'scaleX(-1)' : 'none'} translateX(-5px); }
            50% { transform: ${data.isEnemy ? 'scaleX(-1)' : 'none'} translateX(5px); }
            75% { transform: ${data.isEnemy ? 'scaleX(-1)' : 'none'} translateX(-5px); }
            100% { transform: ${data.isEnemy ? 'scaleX(-1)' : 'none'} translateX(0); }
          }
          @keyframes dmgFloat {
            0% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
            40% { transform: translate(-50%, -24px) scale(1.25); opacity: 1; }
            100% { transform: translate(-50%, -48px) scale(0.9); opacity: 0; }
          }
        `}
      </style>
    </div>
  )
}
