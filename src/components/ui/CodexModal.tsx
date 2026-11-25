import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { CODEX_HEROES } from '../../data/codexData'
import { MOCK_ITEMS } from '../../data/items'
import { getRoleVietnameseInfo } from '../../data/heroes'
import { getRarityTheme } from '../../utils/rarityColors'
import { X, BookOpen, Scroll, Swords, Medal, Quote, Zap, Heart } from 'lucide-react'

export default function CodexModal() {
  const showCodexModal = useGameStore(state => state.showCodexModal)
  const setShowCodexModal = useGameStore(state => state.setShowCodexModal)
  const gameHeroes = useGameStore(state => state.heroes)

  const [activeTab, setActiveTab] = useState<'HEROES' | 'EQUIPMENT'>('HEROES')
  const [selectedCodexId, setSelectedCodexId] = useState<string>(CODEX_HEROES[0].id)
  const [selectedItemId, setSelectedItemId] = useState<string>(MOCK_ITEMS[0].id)
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'Weapon' | 'Armor' | 'Relic'>('ALL')

  if (!showCodexModal) return null

  // 1. Hero Codex Selection
  const codexHero = CODEX_HEROES.find(h => h.id === selectedCodexId) || CODEX_HEROES[0]
  const matchingGameHero = gameHeroes.find(gh => gh.name.toLowerCase().includes(codexHero.name.toLowerCase()) || codexHero.name.toLowerCase().includes(gh.name.toLowerCase()))
  const roleInfo = matchingGameHero ? getRoleVietnameseInfo(matchingGameHero.role) : null
  const partnerHero = (matchingGameHero && matchingGameHero.synergy) 
    ? gameHeroes.find(h => h.id === matchingGameHero.synergy?.partnerId) 
    : null

  // 2. Equipment Codex Selection
  const filteredItems = itemTypeFilter === 'ALL' 
    ? MOCK_ITEMS 
    : MOCK_ITEMS.filter(item => item.type === itemTypeFilter)
  
  const selectedItem = MOCK_ITEMS.find(item => item.id === selectedItemId) || MOCK_ITEMS[0]
  const selectedRarityBorder = selectedItem.rarity === 'UR' ? 'var(--vv-red-solid)' : 'var(--vv-gold-border-strong)'
  const selectedRarityText = selectedItem.rarity === 'UR' ? 'var(--vv-red)' : 'var(--vv-gold)'

  return (
    <div onClick={() => setShowCodexModal(false)} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--vv-overlay)',
      
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--vv-panel-grad)',
        border: '2px solid var(--vv-gold-border-strong)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1000px',
        height: '88vh',
        padding: '24px 28px',
        boxShadow: 'var(--vv-modal-gold-shadow)',
        color: 'var(--vv-text)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Nút Đóng Modal */}
        <button 
          onClick={() => setShowCodexModal(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--vv-close-bg)',
            border: '1px solid var(--vv-close-border)',
            borderRadius: '50%',
            padding: '6px',
            color: 'var(--vv-close-color)',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={24} />
        </button>

        {/* Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--vv-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen color="var(--vv-gold)" /> Bách Khoa Đồ Giám Lịch Sử Việt
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--vv-muted)' }}>
              Tra cứu Đồ Giám Võ Tướng, Tuyệt Kỹ Binh Pháp & Thần Khí Lịch Sử Dân Tộc.
            </p>
          </div>

          {/* Top Switcher Tabs */}
          <div style={{ display: 'flex', background: 'var(--vv-subcard-bg)', padding: '4px', borderRadius: '16px', border: '1px solid var(--vv-gold-border)' }}>
            <button
              onClick={() => setActiveTab('HEROES')}
              style={{
                background: activeTab === 'HEROES' ? 'var(--vv-menu-gold-grad)' : 'transparent',
                color: activeTab === 'HEROES' ? 'var(--vv-on-solid)' : 'var(--vv-muted)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              🏆 ĐỒ GIÁM VÕ TƯỚNG
            </button>

            <button
              onClick={() => setActiveTab('EQUIPMENT')}
              style={{
                background: activeTab === 'EQUIPMENT' ? 'var(--vv-btn-blue-grad)' : 'transparent',
                color: activeTab === 'EQUIPMENT' ? 'var(--vv-on-solid)' : 'var(--vv-muted)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              🗡️ ĐỒ GIÁM TRANG BỊ
            </button>
          </div>
        </div>

        {/* ================= TAB 1: ĐỒ GIÁM VÕ TƯỚNG ================= */}
        {activeTab === 'HEROES' && (
          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
            {/* Cột Trái: Danh Sách Võ Tướng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
              {CODEX_HEROES.map(item => {
                const isSelected = item.id === codexHero.id
                const gHero = gameHeroes.find(gh => gh.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(gh.name.toLowerCase()))
                const rInfo = gHero ? getRoleVietnameseInfo(gHero.role) : null

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCodexId(item.id)}
                    style={{
                      background: isSelected ? 'var(--vv-gold-tint-strong)' : 'var(--vv-surface-2-alpha)',
                      border: isSelected ? '1.5px solid var(--vv-gold-border-strong)' : '1px solid var(--vv-border-subtle)',
                      borderRadius: '14px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: item.color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '1.3rem',
                      boxShadow: `0 4px 12px ${item.color}44`,
                      flexShrink: 0
                    }}>
                      {rInfo ? rInfo.icon : '🏛️'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? 'var(--vv-gold-soft)' : 'var(--vv-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {gHero && (
                          <span style={{ fontSize: '0.65rem', background: gHero.color, color: 'var(--vv-on-solid)', padding: '1px 5px', borderRadius: '6px', fontWeight: 'bold' }}>
                            {gHero.rarity || 'SSR'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--vv-muted)', marginTop: '2px' }}>
                        {rInfo ? rInfo.short : item.era}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cột Phải: Chi Tiết Võ Tướng */}
            <div style={{
              backgroundImage: codexHero.backgroundUrl 
                ? `var(--vv-codex-hero-scrim), url(${codexHero.backgroundUrl})` 
                : 'none',
              backgroundColor: 'var(--vv-card-bg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
              border: `2px solid ${codexHero.color}`,
              borderRadius: '20px',
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: `0 8px 30px ${codexHero.color}33`
            }}>
              {/* Header Tướng */}
              <div style={{ background: 'var(--vv-hero-header-bg)', padding: '10px 14px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.9rem', color: codexHero.color, textShadow: 'var(--vv-text-shadow-media)', fontWeight: 900 }}>
                    {codexHero.name}
                  </h3>
                  <span style={{ background: 'var(--vv-gold-tint-banner)', border: '1px solid var(--vv-gold-border-strong)', color: 'var(--vv-dark-card-gold)', fontSize: '0.78rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '10px' }}>
                    {codexHero.era} ({codexHero.periodYear})
                  </span>
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--vv-dark-card-gold)', marginTop: '4px', fontWeight: 'bold', textShadow: 'var(--vv-text-shadow-media)' }}>
                  {codexHero.title}
                </div>
              </div>

              {/* KHUNG THÔNG TIN IN-GAME (Stats, Role & Skill) */}
              {matchingGameHero && (
                <div style={{
                  background: 'var(--vv-card-bg)',
                  border: `1.5px solid ${codexHero.color}88`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Row 1: Rarity, Class & Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: getRarityTheme(matchingGameHero.rarity).badgeBg,
                        color: 'var(--vv-on-solid)',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        padding: '3px 10px',
                        borderRadius: '8px',
                        boxShadow: getRarityTheme(matchingGameHero.rarity).glowBoxShadow
                      }}>
                        {matchingGameHero.rarity || 'SSR'} • {getRarityTheme(matchingGameHero.rarity).title}
                      </span>
                      {roleInfo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 'bold', color: roleInfo.color, background: 'var(--vv-hero-chip-bg)', padding: '2px 8px', borderRadius: '8px' }}>
                          <span>{roleInfo.icon}</span>
                          <span>{roleInfo.name}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--vv-red)', fontWeight: 'bold' }}>⚔️ ATK: {matchingGameHero.atk.toLocaleString()}</span>
                      <span style={{ color: 'var(--vv-green)', fontWeight: 'bold' }}>❤️ HP: {matchingGameHero.maxHp.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Row 2: Skill & Synergy */}
                  <div style={{ display: 'grid', gridTemplateColumns: matchingGameHero.synergy ? '1fr 1fr' : '1fr', gap: '10px' }}>
                    {/* Tuyệt Kỹ */}
                    <div style={{ background: 'var(--vv-surface-2-alpha)', padding: '10px 12px', borderRadius: '12px', borderLeft: `3px solid ${matchingGameHero.color}` }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--vv-text)' }}>
                        👑 [TUYỆT KỸ] {matchingGameHero.skill?.name || 'Vung Vũ Khí'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--vv-text-2)', marginTop: '3px' }}>
                        Gây {Math.round((matchingGameHero.skill?.damageMultiplier || 2.0) * 100)}% sát thương ATK.
                        {matchingGameHero.skill?.rageRecovery ? ` Hồi ${matchingGameHero.skill.rageRecovery} Nộ.` : ''}
                      </div>
                    </div>

                    {/* Hợp Kỹ */}
                    {matchingGameHero.synergy && (
                      <div style={{ background: 'var(--vv-gold-tint)', padding: '10px 12px', borderRadius: '12px', borderLeft: '3px solid var(--vv-gold-border-strong)' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--vv-gold-soft)' }}>
                          💥 [HỢP KỸ] {matchingGameHero.synergy.skillName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--vv-text-2)', marginTop: '3px' }}>
                          Cùng {partnerHero ? partnerHero.name : 'Đồng Đội'} ra trận bồi 150% Sát Thương!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trích Dẫn Nổi Tiếng */}
              <div style={{
                background: 'var(--vv-subcard-bg)',
                borderLeft: '4px solid var(--vv-gold-border-strong)',
                border: '1px solid var(--vv-gold-border)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontStyle: 'italic',
                color: 'var(--vv-gold-soft)',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Quote size={22} color="var(--vv-gold-border-strong)" style={{ flexShrink: 0 }} />
                <span>"{codexHero.quote}"</span>
              </div>

              {/* Trận Đánh Hiển Hách */}
              <div style={{ background: 'var(--vv-subcard-bg)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--vv-border-subtle)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--vv-sky)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Swords size={16} /> các Trận Đánh Hiển Hách Trong Lịch Sử
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {codexHero.famousBattles.map((battle, bIdx) => (
                    <span key={bIdx} style={{ background: 'var(--vv-sky-tint)', border: '1px solid var(--vv-sky)', color: 'var(--vv-sky-text)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      ⚔️ {battle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tiểu Sử Lịch Sử */}
              <div style={{ background: 'var(--vv-subcard-bg)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--vv-border-subtle)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--vv-text-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scroll size={16} /> Tiểu Sử Lịch Sử
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--vv-text-2)', lineHeight: '1.6' }}>
                  {codexHero.biography}
                </p>
              </div>

              {/* Di Sản Tôn Vinh */}
              <div style={{ background: 'var(--vv-subcard-bg)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--vv-border-subtle)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--vv-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Medal size={16} color="var(--vv-green)" /> Di Sản & Công Trạng Tôn Vinh
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--vv-green-soft)', lineHeight: '1.6' }}>
                  {codexHero.legacy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ĐỒ GIÁM TRANG BỊ & THẦN KHÍ ================= */}
        {activeTab === 'EQUIPMENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '16px' }}>
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { key: 'ALL', label: 'TẤT CẢ TRANG BỊ', icon: '🏛️' },
                { key: 'Weapon', label: 'VŨ KHÍ', icon: '⚔️' },
                { key: 'Armor', label: 'ÁO GIÁP', icon: '🛡️' },
                { key: 'Relic', label: 'THẦN KHÍ / BÁU VẬT', icon: '🏺' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setItemTypeFilter(filter.key as any)}
                  style={{
                    background: itemTypeFilter === filter.key ? 'var(--vv-blue-tint)' : 'var(--vv-surface-2-alpha)',
                    border: itemTypeFilter === filter.key ? '1.5px solid var(--vv-blue-border)' : '1px solid var(--vv-border-subtle)',
                    color: itemTypeFilter === filter.key ? 'var(--vv-blue-soft)' : 'var(--vv-text-2)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{filter.icon}</span> {filter.label}
                </button>
              ))}
            </div>

            {/* Content Grid & Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', flex: 1, overflow: 'hidden' }}>
              {/* Item Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {filteredItems.map(item => {
                  const isSelected = item.id === selectedItem.id
                  const rarityColor = item.rarity === 'UR' ? 'var(--vv-red-solid)' : item.rarity === 'SSR' ? 'var(--vv-gold-border-strong)' : 'var(--vv-purple)'
                  const rarityTint = item.rarity === 'UR' ? 'var(--vv-red-tint)' : item.rarity === 'SSR' ? 'var(--vv-gold-tint)' : 'var(--vv-purple-tint)'

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      style={{
                        background: isSelected ? rarityTint : 'var(--vv-surface-2-alpha)',
                        border: isSelected ? `2px solid ${rarityColor}` : '1px solid var(--vv-border-subtle)',
                        borderRadius: '16px',
                        padding: '14px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 20px var(--vv-shadow)' : 'none'
                      }}
                    >
                      {/* Rarity Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: rarityColor,
                        color: item.rarity === 'SSR' ? 'var(--vv-on-yellow)' : 'var(--vv-on-solid)',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: '6px'
                      }}>
                        {item.rarity}
                      </span>

                      <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>
                        {item.icon}
                      </div>

                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: isSelected ? 'var(--vv-gold-soft)' : 'var(--vv-text)', lineHeight: '1.2' }}>
                        {item.name}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: 'var(--vv-muted)', marginTop: '4px' }}>
                        {item.type === 'Weapon' ? 'Vũ Khí' : item.type === 'Armor' ? 'Áo Giáp' : 'Báu Vật'}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Selected Item Detail Panel */}
              <div style={{
                background: 'var(--vv-card-bg)',
                border: `2px solid ${selectedRarityBorder}`,
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'var(--vv-surface-2-alpha)',
                    border: `2px solid ${selectedRarityBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    boxShadow: '0 4px 15px var(--vv-shadow)'
                  }}>
                    {selectedItem.icon}
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: selectedRarityText }}>
                      {selectedItem.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ background: selectedRarityBorder, color: selectedItem.rarity === 'UR' ? 'var(--vv-on-solid)' : 'var(--vv-on-yellow)', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>
                        PHẨM {selectedItem.rarity}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--vv-text-2)' }}>
                        {selectedItem.type === 'Weapon' ? 'Vũ Khí Lịch Sử' : selectedItem.type === 'Armor' ? 'Áo Giáp Phòng Thủ' : 'Báu Vật Thần Kỳ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat Bonus Box */}
                <div style={{ background: 'var(--vv-surface-2-alpha)', borderRadius: '14px', padding: '12px 14px', border: '1px solid var(--vv-border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--vv-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CHỈ SỐ TRANG BỊ (STAT BONUS):
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {selectedItem.statBonus.atk && (
                      <div style={{ color: 'var(--vv-red)', fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={18} /> +{selectedItem.statBonus.atk} ATK
                      </div>
                    )}
                    {selectedItem.statBonus.hp && (
                      <div style={{ color: 'var(--vv-green)', fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={18} /> +{selectedItem.statBonus.hp.toLocaleString()} HP
                      </div>
                    )}
                  </div>
                </div>

                {/* Description & History Lore */}
                <div style={{ background: 'var(--vv-surface-2-alpha)', borderRadius: '14px', padding: '14px', border: '1px solid var(--vv-border-subtle)', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--vv-gold-soft)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Scroll size={16} /> NGUỒN GỐC & ĐÒN BẢO VẬT:
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--vv-text-2)', lineHeight: '1.6' }}>
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
