import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Swords, Sparkles, ShieldCheck, Users, Building2, Flame, BookOpen, Star, Zap, Trophy, Crown } from 'lucide-react'
import { getPowerScore } from './SquadModal'
import { MOUNT_BEASTS, type BeastData } from '../../data/beasts'
import { cloudService, supabase } from '../../utils/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function MainLobby() {
  const currentScreen = useGameStore(state => state.currentScreen)
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen)
  const heroes = useGameStore(state => state.heroes)
  const activeBeastId = useGameStore(state => state.activeBeastId)

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

  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(cloudService.getCurrentUser())
  const [, setTick] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (currentScreen !== 'LOBBY') return
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
      background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 70%, #020617 100%)',
      zIndex: 50,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '36px',
      boxSizing: 'border-box',
      color: 'white',
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
        border: '2px solid rgba(212, 175, 55, 0.12)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Top Header - Logo & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            background: 'linear-gradient(45deg, #fef08a, #f1c40f, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
            textShadow: '0 0 30px rgba(241, 196, 15, 0.4)'
          }}>
            VANG VỌNG SỬ VIỆT 3D
          </div>
          <div style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '2px' }}>
            Sảnh Chính Hoàng Gia • Idle Gacha Danh Nhân Lịch Sử
          </div>
        </div>

        {/* Tổng Lực Chiến, Linh Vật, User Badge & Rương Treo Máy AFK */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* User Account / Profile Badge */}
          <button
            onClick={() => setShowCloudModal(true)}
            style={{
              background: currentUser ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',
              border: currentUser ? '2px solid #22c55e' : '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '10px 16px',
              boxShadow: currentUser ? '0 0 20px rgba(34, 197, 94, 0.35)' : '0 0 20px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentUser ? 'linear-gradient(45deg, #22c55e, #10b981)' : 'linear-gradient(45deg, #f59e0b, #d97706)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#0f172a',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              {currentUser ? (currentUser.email ? currentUser.email[0].toUpperCase() : '👤') : '👤'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: currentUser ? '#86efac' : '#fef08a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {currentUser ? '🟢 CLOUD SSO' : '🟡 CHẾ ĐỘ KHÁCH'}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cloudService.getPlayerName()}
              </div>
            </div>
          </button>

          {/* Rương Treo Máy AFK Button */}
          <button
            onClick={() => setShowIdleModal(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '10px 18px',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>🎁</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 'bold' }}>RƯƠNG TREO MÁY</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>
                +{idleRewards.gold.toLocaleString()} 🪙
              </div>
            </div>
          </button>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid #f1c40f',
            borderRadius: '16px',
            padding: '12px 24px',
            boxShadow: '0 0 25px rgba(241, 196, 15, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Zap size={24} color="#f1c40f" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>TỔNG LỰC CHIẾN ĐỘI HÌNH</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fef08a' }}>{totalPower.toLocaleString()}</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid ' + activeBeast.color,
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.6rem' }}>{activeBeast.icon}</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>LINH VẬT HỘ QUỐC</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: activeBeast.color }}>{activeBeast.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Showcase 6 Tướng Xuất Trận Trực Quan */}
      <div style={{ margin: 'auto 0', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#cbd5e1', letterSpacing: '1px' }}>
          🏛️ ĐỘI HÌNH ANH HÙNG XUẤT TRẬN ({activeHeroes.length}/6 TƯỚNG)
        </h3>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {activeHeroes.map(hero => (
            <div
              key={hero.id}
              onClick={() => setSelectedHeroId(hero.id)}
              style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: `2px solid ${hero.color}`,
                borderRadius: '20px',
                width: '135px',
                padding: '16px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: `0 10px 30px ${hero.color}44`,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)'
                e.currentTarget.style.boxShadow = `0 15px 40px ${hero.color}88`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = `0 10px 30px ${hero.color}44`
              }}
            >
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: hero.color,
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '8px',
                zIndex: 2
              }}>
                {hero.rarity || 'SR'}
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
                      border: `2px solid ${hero.color}`,
                      boxShadow: `0 4px 15px ${hero.color}66`
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '2.8rem' }}>🏛️</div>
                )}
              </div>

              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: hero.color }}>{hero.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Lv.{hero.level}</div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '6px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    color={i < hero.stars ? "#f1c40f" : "#475569"} 
                    fill={i < hero.stars ? "#f1c40f" : "none"} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Control Actions & Big Khai Chiến Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {/* Sub Menu Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSquadModal(true)}
            style={{
              background: 'linear-gradient(45deg, #0284c7, #38bdf8)',
              border: '1px solid #bae6fd',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)'
            }}
          >
            <Users size={16} />
            <span>ĐỘI HÌNH</span>
          </button>

          <button
            onClick={() => setShowGachaModal(true)}
            style={{
              background: 'linear-gradient(45deg, #d97706, #f59e0b)',
              border: '1px solid #fef08a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Sparkles size={16} />
            <span>CHIÊU MỘ</span>
          </button>

          <button
            onClick={() => setShowTowerModal(true)}
            style={{
              background: 'linear-gradient(45deg, #7c3aed, #c084fc)',
              border: '1px solid #e9d5ff',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Building2 size={16} />
            <span>THÁP CỔ</span>
          </button>

          <button
            onClick={() => setShowWorldBossModal(true)}
            style={{
              background: 'linear-gradient(45deg, #9333ea, #c084fc)',
              border: '1px solid #fef08a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(147, 51, 234, 0.5)'
            }}
          >
            <Flame size={16} color="#fef08a" />
            <span>TRÙM THẾ GIỚI</span>
          </button>

          <button
            onClick={() => setShowRankModal && setShowRankModal(true)}
            style={{
              background: 'linear-gradient(45deg, #eab308, #fef08a)',
              border: '1px solid #fef08a',
              color: '#422006',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.5)'
            }}
          >
            <Crown size={16} color="#422006" />
            <span>QUAN LẠI</span>
          </button>

          <button
            onClick={() => setShowPvPModal(true)}
            style={{
              background: 'linear-gradient(45deg, #dc2626, #ef4444)',
              border: '1px solid #fef08a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)'
            }}
          >
            <Trophy size={16} color="#fef08a" />
            <span>ĐẤU TRƯỜNG</span>
          </button>

          <button
            onClick={() => setShowCodexModal(true)}
            style={{
              background: 'linear-gradient(45deg, #b45309, #f1c40f)',
              border: '1px solid #fef08a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(241, 196, 15, 0.5)'
            }}
          >
            <BookOpen size={16} />
            <span>BÁCH KHOA</span>
          </button>

          <button
            onClick={() => setShowBeastModal(true)}
            style={{
              background: 'linear-gradient(45deg, #059669, #10b981)',
              border: '1px solid #a7f3d0',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
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
            background: 'linear-gradient(45deg, #b45309, #f59e0b, #d97706)',
            border: '3px solid #fef08a',
            color: 'white',
            padding: '18px 56px',
            borderRadius: '40px',
            fontSize: '1.4rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          <Swords size={30} /> KHAI CHIẾN 3D
        </button>
      </div>

    </div>
  )
}
