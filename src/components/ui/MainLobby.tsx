import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Swords, Sparkles, ShieldCheck, Users, Building2, Flame, BookOpen, Star, Zap, Trophy, Crown, Coins, Volume2, VolumeX } from 'lucide-react'
import { getPowerScore } from './SquadModal'
import { MOUNT_BEASTS, type BeastData } from '../../data/beasts'
import { cloudService, type WwwUser } from '../../utils/supabaseClient'
import { getRarityTheme } from '../../utils/rarityColors'

export default function MainLobby() {
  const currentScreen = useGameStore(state => state.currentScreen)
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen)
  const heroes = useGameStore(state => state.heroes)
  const gold = useGameStore(state => state.gold)
  const activeBeastId = useGameStore(state => state.activeBeastId)
  const isMuted = useGameStore(state => state.isMuted)
  const toggleMute = useGameStore(state => state.toggleMute)

  const setShowSquadModal = useGameStore(state => state.setShowSquadModal)
  const setShowGachaModal = useGameStore(state => state.setShowGachaModal)
  const setShowTowerModal = useGameStore(state => state.setShowTowerModal)
  const setShowBeastModal = useGameStore(state => state.setShowBeastModal)
  const setShowWorldBossModal = useGameStore(state => state.setShowWorldBossModal)
  const setShowCodexModal = useGameStore(state => state.setShowCodexModal)
  const setShowPvPModal = useGameStore(state => state.setShowPvPModal)
  const setShowRankModal = useGameStore(state => (state as any).setShowRankModal)
  const setShowIdleModal = useGameStore(state => state.setShowIdleModal)
  const setShowCloudModal = useGameStore(state => state.setShowCloudModal)
  const getIdleRewards = useGameStore(state => state.getIdleRewards)
  const setSelectedHeroId = useGameStore(state => state.setSelectedHeroId)

  const [currentUser, setCurrentUser] = useState<WwwUser | null>(() => cloudService.getCurrentUser())
  const [, setTick] = useState(0)

  useEffect(() => {
    if (currentScreen !== 'LOBBY') return
    setCurrentUser(cloudService.getCurrentUser())
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [currentScreen])

  if (currentScreen !== 'LOBBY') return null

  const activeHeroes = heroes.filter(h => h.slotIndex >= 0)
  const totalPower = activeHeroes.reduce((sum, h) => sum + getPowerScore(h), 0)
  const activeBeast = MOUNT_BEASTS.find((b: BeastData) => b.id === activeBeastId) || MOUNT_BEASTS[0]
  const idleRewards = getIdleRewards ? getIdleRewards() : { gold: 0, shards: 0, elapsedSec: 0, goldRatePerSec: 5 }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'var(--vv-lobby-bg)',
      zIndex: 50,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '36px',
      boxSizing: 'border-box',
      color: 'var(--vv-text)',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Vietnamese Motifs */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        border: '2px solid var(--vv-motif-border)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Top Header - Logo & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            background: 'var(--vv-lobby-title-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
            textShadow: 'var(--vv-title-shadow)'
          }}>
            VANG VỌNG SỬ VIỆT 3D
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--vv-muted)', marginTop: '2px' }}>
            Sảnh Chính Hoàng Gia • Idle Gacha Danh Nhân Lịch Sử
          </div>
        </div>

        {/* Tổng Lực Chiến, Linh Vật, User Badge & Rương Treo Máy AFK */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* Nút Bật / Tắt Âm Thanh */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: isMuted
                ? 'var(--vv-btn-red-tint)'
                : 'var(--vv-btn-blue-tint)',
              border: isMuted ? '2px solid var(--vv-red)' : '2px solid var(--vv-blue)',
              borderRadius: '16px',
              padding: '10px 16px',
              boxShadow: isMuted ? 'var(--vv-glow-red)' : 'var(--vv-glow-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--vv-text)',
              transition: 'all 0.2s ease'
            }}
          >
            {isMuted ? <VolumeX size={22} color="var(--vv-red-soft)" /> : <Volume2 size={22} color="var(--vv-blue-soft)" />}
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isMuted ? 'var(--vv-red-soft)' : 'var(--vv-blue-soft)' }}>
              {isMuted ? 'TẮT ÂM' : 'BẬT ÂM'}
            </span>
          </button>

          {/* User Account / Profile Badge */}
          <button
            onClick={() => setShowCloudModal(true)}
            style={{
              background: currentUser ? 'var(--vv-btn-green-tint)' : 'var(--vv-btn-gold-tint)',
              border: currentUser ? '2px solid var(--vv-green)' : '2px solid var(--vv-gold-solid)',
              borderRadius: '16px',
              padding: '10px 16px',
              boxShadow: currentUser ? 'var(--vv-glow-green)' : 'var(--vv-glow-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'var(--vv-text)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentUser ? 'var(--vv-badge-green-grad)' : 'var(--vv-badge-gold-grad)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: 'var(--vv-on-gold)',
              boxShadow: '0 2px 8px var(--vv-shadow)'
            }}>
              {currentUser ? (currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '👤') : '👤'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: currentUser ? 'var(--vv-green-soft)' : 'var(--vv-gold-soft)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {currentUser ? '🟢 YUNDEV' : '🟡 CHẾ ĐỘ KHÁCH'}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--vv-text)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cloudService.getPlayerName()}
              </div>
            </div>
          </button>

          {/* Số Vàng Hiện Có */}
          <div style={{
            background: 'var(--vv-btn-gold-tint)',
            border: '2px solid var(--vv-gold-border-strong)',
            borderRadius: '16px',
            padding: '10px 18px',
            boxShadow: 'var(--vv-glow-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Coins size={26} color="var(--vv-gold-soft)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--vv-gold-soft)', textTransform: 'uppercase', fontWeight: 'bold' }}>VÀNG SỞ HỮU</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--vv-text)' }}>
                {gold.toLocaleString()} 🪙
              </div>
            </div>
          </div>

          {/* Rương Treo Máy AFK Button */}
          <button
            onClick={() => setShowIdleModal(true)}
            style={{
              background: 'var(--vv-btn-gold-tint)',
              border: '2px solid var(--vv-gold-solid)',
              borderRadius: '16px',
              padding: '10px 18px',
              boxShadow: 'var(--vv-glow-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'var(--vv-text)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>🎁</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--vv-gold-soft)', fontWeight: 'bold' }}>RƯƠNG TREO MÁY</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--vv-text)' }}>
                +{idleRewards.gold.toLocaleString()} 🪙
              </div>
            </div>
          </button>

          <div style={{
            background: 'var(--vv-card-bg)',
            border: '2px solid var(--vv-gold-border-strong)',
            borderRadius: '16px',
            padding: '12px 24px',
            boxShadow: 'var(--vv-glow-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Zap size={24} color="var(--vv-gold-solid)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)', textTransform: 'uppercase', fontWeight: 'bold' }}>TỔNG LỰC CHIẾN ĐỘI HÌNH</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--vv-gold-soft)' }}>{totalPower.toLocaleString()}</div>
            </div>
          </div>

          <div style={{
            background: 'var(--vv-card-bg)',
            border: '1.5px solid ' + activeBeast.color,
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.6rem' }}>{activeBeast.icon}</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vv-text-2)' }}>LINH VẬT HỘ QUỐC</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: activeBeast.color }}>{activeBeast.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Showcase 6 Tướng Xuất Trận Trực Quan */}
      <div style={{ margin: 'auto 0', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'var(--vv-text-2)', letterSpacing: '1px' }}>
          🏛️ ĐỘI HÌNH ANH HÙNG XUẤT TRẬN ({activeHeroes.length}/6 TƯỚNG)
        </h3>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {activeHeroes.map(hero => {
            const theme = getRarityTheme(hero.rarity)
            return (
              <div
                key={hero.id}
                onClick={() => setSelectedHeroId(hero.id)}
                style={{
                  background: theme.background,
                  border: `2px solid ${theme.borderHex}`,
                  borderRadius: '24px',
                  width: '135px',
                  padding: '16px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: theme.glowBoxShadow,
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)'
                  e.currentTarget.style.boxShadow = `0 15px 40px ${theme.hex}88`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = theme.glowBoxShadow
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: theme.badgeBg,
                  color: 'var(--vv-on-solid)',
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  zIndex: 2,
                  boxShadow: '0 2px 4px var(--vv-shadow)'
                }}>
                  {theme.rarity}
                </span>

                {/* Avatar Image 2D hiển thị sắc nét */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                  {hero.avatarUrl ? (
                    <img
                      src={hero.avatarUrl}
                      alt={hero.name}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        border: `2px solid ${theme.borderHex}`,
                        boxShadow: `0 4px 15px ${theme.hex}66`
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '2.8rem' }}>🏛️</div>
                  )}
                </div>

                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: theme.hex }}>{hero.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--vv-muted)', marginTop: '2px' }}>Lv.{hero.level}</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '6px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      color={i < hero.stars ? "var(--vv-gold-solid)" : "var(--vv-border-strong)"}
                      fill={i < hero.stars ? "var(--vv-gold-solid)" : "none"}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Control Actions & Big Khai Chiến Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {/* Sub Menu Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSquadModal(true)}
            style={{
              background: 'var(--vv-menu-sky-grad)',
              border: '1px solid var(--vv-menu-sky-border)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-sky-shadow)'
            }}
          >
            <Users size={16} />
            <span>ĐỘI HÌNH</span>
          </button>

          <button
            onClick={() => setShowGachaModal(true)}
            style={{
              background: 'var(--vv-menu-gold-grad)',
              border: '1px solid var(--vv-gold-border-soft)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-gold-shadow)'
            }}
          >
            <Sparkles size={16} />
            <span>CHIÊU MỘ</span>
          </button>

          <button
            onClick={() => setShowTowerModal(true)}
            style={{
              background: 'var(--vv-menu-purple-grad)',
              border: '1px solid var(--vv-menu-purple-border)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-purple-shadow)'
            }}
          >
            <Building2 size={16} />
            <span>THÁP CỔ</span>
          </button>

          <button
            onClick={() => setShowWorldBossModal(true)}
            style={{
              background: 'var(--vv-menu-boss-grad)',
              border: '1px solid var(--vv-gold-border-soft)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-boss-shadow)'
            }}
          >
            <Flame size={16} color="var(--vv-gold-border-soft)" />
            <span>TRÙM THẾ GIỚI</span>
          </button>

          <button
            onClick={() => setShowRankModal && setShowRankModal(true)}
            style={{
              background: 'var(--vv-menu-yellow-grad)',
              border: '1px solid var(--vv-gold-border-soft)',
              color: 'var(--vv-on-yellow)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-yellow-shadow)'
            }}
          >
            <Crown size={16} color="var(--vv-on-yellow)" />
            <span>QUAN LẠI</span>
          </button>

          <button
            onClick={() => setShowPvPModal(true)}
            style={{
              background: 'var(--vv-menu-red-grad)',
              border: '1px solid var(--vv-gold-border-soft)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-red-shadow)'
            }}
          >
            <Trophy size={16} color="var(--vv-gold-border-soft)" />
            <span>ĐẤU TRƯỜNG</span>
          </button>

          <button
            onClick={() => setShowCodexModal(true)}
            style={{
              background: 'var(--vv-menu-codex-grad)',
              border: '1px solid var(--vv-gold-border-soft)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-codex-shadow)'
            }}
          >
            <BookOpen size={16} />
            <span>BÁCH KHOA</span>
          </button>

          <button
            onClick={() => setShowBeastModal(true)}
            style={{
              background: 'var(--vv-menu-green-grad)',
              border: '1px solid var(--vv-menu-green-border)',
              color: 'var(--vv-on-solid)',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--vv-menu-green-shadow)'
            }}
          >
            <ShieldCheck size={16} />
            <span>LINH VẬT</span>
          </button>
        </div>

        {/* Nút KHAI CHIẾN Lớn Sang Trọng */}
        <button
          onClick={() => setCurrentScreen('BATTLE')}
          style={{
            background: 'var(--vv-cta-grad)',
            border: '3px solid var(--vv-gold-border-soft)',
            color: 'var(--vv-on-solid)',
            padding: '18px 56px',
            borderRadius: '40px',
            fontSize: '1.4rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: 'var(--vv-cta-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          <Swords size={30} /> KHAI CHIẾN
        </button>
      </div>

    </div>
  )
}
