import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { X, Zap, Heart, Star, ArrowUpCircle, Flame, Sparkles } from 'lucide-react'
import MeridiansModal from './MeridiansModal'
import heroPlaceholder from '../../assets/hero.png'
import { getRoleVietnameseInfo } from '../../data/heroes'
import { getRarityTheme } from '../../utils/rarityColors'

export default function HeroModal() {
  const [showMeridians, setShowMeridians] = useState<boolean>(false)

  const selectedHeroId = useGameStore(state => state.selectedHeroId)
  const setSelectedHeroId = useGameStore(state => state.setSelectedHeroId)
  const heroes = useGameStore(state => state.heroes)
  const inventory = useGameStore(state => state.inventory)
  const shards = useGameStore(state => state.shards)
  const gold = useGameStore(state => state.gold)
  const levelUpHero = useGameStore(state => state.levelUpHero)
  const starUpHero = useGameStore(state => state.starUpHero)
  const toggleEquipItem = useGameStore(state => state.toggleEquipItem)

  if (!selectedHeroId) return null

  const hero = heroes.find(h => h.id === selectedHeroId)
  if (!hero) return null

  const theme = getRarityTheme(hero.rarity)
  const roleInfo = getRoleVietnameseInfo(hero.role)
  const partnerHero = hero.synergy ? heroes.find(h => h.id === hero.synergy?.partnerId) : null
  const currentShards = shards[hero.name] || 0
  const requiredShards = hero.stars * 20
  const canStarUp = hero.stars < 5 && currentShards >= requiredShards && gold >= 1000

  return (
    <div onClick={() => setSelectedHeroId(null)} style={{
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
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: `2px solid ${hero.color}`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: `0 10px 40px ${hero.color}44`,
        color: 'white',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={() => setSelectedHeroId(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0,0,0,0.5)',
            
            borderRadius: '50%',
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <X size={20} />
        </button>

        {/* Hero Compact Showcase Banner */}
        <div style={{
          width: '100%',
          height: '160px',
          borderRadius: '16px',
          background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
          border: `2px solid ${hero.color}`,
          boxShadow: `0 8px 32px ${hero.color}44`,
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '16px'
        }}>
          <img 
            src={hero.backgroundUrl || hero.avatarUrl || heroPlaceholder} 
            alt={hero.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
          />

          {/* Overlay Info (Name, Level, Stars) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            padding: '20px 16px 12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: theme.hex, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{hero.name}</h2>
                <span style={{
                  background: theme.badgeBg,
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  boxShadow: theme.glowBoxShadow
                }}>
                  {theme.rarity} • {theme.title}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                Cấp {hero.level} • {roleInfo.icon} {roleInfo.name}
              </p>
            </div>
            
            {/* Stars */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  color={i < hero.stars ? "#f1c40f" : "#475569"} 
                  fill={i < hero.stars ? "#f1c40f" : "none"} 
                  style={{ filter: i < hero.stars ? 'drop-shadow(0 0 4px rgba(241,196,15,0.6))' : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Class Info Block */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: `1.5px solid ${roleInfo.color}66`,
          borderRadius: '16px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '1.8rem',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `${roleInfo.color}22`,
            border: `1px solid ${roleInfo.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {roleInfo.icon}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>LỚP VÕ TƯỚNG (CLASS):</span>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: roleInfo.color }}>{roleInfo.name}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.3' }}>
              {roleInfo.desc}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '12px 16px',
          borderRadius: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#e74c3c" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TẤN CÔNG (ATK)</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#e74c3c' }}>{hero.atk.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="#2ecc71" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SINH LỰC (HP)</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#2ecc71' }}>{hero.hp.toLocaleString()}/{hero.maxHp.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Skill & Synergy Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(241, 196, 15, 0.3)',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#fef08a', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#f1c40f" />
            <span>KỸ NĂNG & HỢP KỸ DÂN TỘC</span>
          </div>

          {/* Tuyệt Kỹ */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '12px', borderLeft: `3px solid ${hero.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#ffffff' }}>
                👑 [TUYỆT KỸ] {hero.skill?.name || 'Vung Vũ Khí'}
              </div>
              <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                {Math.round((hero.skill?.damageMultiplier || 2.0) * 100)}% ATK
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
              Gây {Math.round((hero.skill?.damageMultiplier || 2.0) * 100)}% sát thương lên mục tiêu.
              {hero.skill?.rageRecovery ? ` Hồi ${hero.skill.rageRecovery} Nộ sau khi xuất chiêu.` : ''}
              {hero.skill?.rageSteal ? ` Hút ${hero.skill.rageSteal} Nộ của kẻ địch.` : ''}
            </div>
          </div>

          {/* Hợp Kỹ (nếu có) */}
          {hero.synergy && (
            <div style={{ background: 'rgba(234, 179, 8, 0.12)', padding: '10px 12px', borderRadius: '12px', borderLeft: '3px solid #f1c40f' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fef08a' }}>
                  💥 [HỢP KỸ] {hero.synergy.skillName}
                </div>
                <span style={{ fontSize: '0.75rem', background: '#d97706', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                  Phối Hợp: {partnerHero ? partnerHero.name : 'Đồng Đội'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '4px', lineHeight: '1.4' }}>
                Khi cùng {partnerHero ? partnerHero.name : 'Đồng Đội'} ra trận, bồi đòn Hợp Kích gây 150% Sát Thương Hợp Kỹ lên kẻ địch!
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar - Level Up, Star Up & Meridians */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => levelUpHero(hero.id)}
            disabled={gold < 200}
            style={{
              flex: 1,
              background: gold >= 200 ? 'linear-gradient(45deg, #2563eb, #3b82f6)' : '#475569',
              border: 'none',
              color: 'white',
              padding: '10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: gold >= 200 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowUpCircle size={16} /> Tăng Cấp (200 Vàng)
          </button>

          <button
            onClick={() => starUpHero(hero.id)}
            disabled={!canStarUp}
            style={{
              flex: 1,
              background: canStarUp ? 'linear-gradient(45deg, #d97706, #f59e0b)' : '#475569',
              border: 'none',
              color: 'white',
              padding: '10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: canStarUp ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Star size={16} /> Tăng Sao ({currentShards}/{requiredShards})
          </button>

          <button
            onClick={() => setShowMeridians(true)}
            style={{
              background: 'linear-gradient(45deg, #7c3aed, #c084fc)',
              border: 'none',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Flame size={16} /> KINHS MẠCH
          </button>
        </div>

        {/* Equipment Section */}
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#f1c40f' }}>TRANG BỊ THẦN KHÍ LỊCH SỬ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {inventory.map(item => {
              const isEquipped = hero.equippedItemIds.includes(item.id)

              return (
                <div
                  key={item.id}
                  onClick={() => toggleEquipItem(hero.id, item.id)}
                  style={{
                    background: isEquipped ? 'rgba(241, 196, 15, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                    border: isEquipped ? '1.5px solid #f1c40f' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isEquipped ? '#fef08a' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {item.statBonus.atk ? `+${item.statBonus.atk} ATK` : ''} {item.statBonus.hp ? `+${item.statBonus.hp} HP` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Meridians Sub-Modal */}
      {showMeridians && (
        <MeridiansModal heroId={hero.id} onClose={() => setShowMeridians(false)} />
      )}
    </div>
  )
}
