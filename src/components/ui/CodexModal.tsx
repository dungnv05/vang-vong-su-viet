import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { CODEX_HEROES } from '../../data/codexData'
import { MOCK_ITEMS } from '../../data/items'
import { getRoleVietnameseInfo } from '../../data/heroes'
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
        border: '2px solid #f1c40f',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1000px',
        height: '88vh',
        padding: '24px 28px',
        boxShadow: '0 10px 50px rgba(241, 196, 15, 0.25)',
        color: 'white',
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
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            padding: '6px',
            color: '#cbd5e1',
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
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen color="#f1c40f" /> Bách Khoa Đồ Giám Lịch Sử Việt
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Tra cứu Đồ Giám Võ Tướng, Tuyệt Kỹ Binh Pháp & Thần Khí Lịch Sử Dân Tộc.
            </p>
          </div>

          {/* Top Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(241, 196, 15, 0.3)' }}>
            <button
              onClick={() => setActiveTab('HEROES')}
              style={{
                background: activeTab === 'HEROES' ? 'linear-gradient(45deg, #d97706, #f59e0b)' : 'transparent',
                color: activeTab === 'HEROES' ? 'white' : '#94a3b8',
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
                background: activeTab === 'EQUIPMENT' ? 'linear-gradient(45deg, #2563eb, #3b82f6)' : 'transparent',
                color: activeTab === 'EQUIPMENT' ? 'white' : '#94a3b8',
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
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                      border: isSelected ? '1.5px solid #f1c40f' : '1px solid rgba(255,255,255,0.08)',
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
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? '#fef08a' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {gHero && (
                          <span style={{ fontSize: '0.65rem', background: gHero.color, color: 'white', padding: '1px 5px', borderRadius: '6px', fontWeight: 'bold' }}>
                            {gHero.rarity || 'SSR'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
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
                ? `linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.92) 40%, rgba(15, 23, 42, 0.98) 100%), url(${codexHero.backgroundUrl})` 
                : 'none',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.9rem', color: codexHero.color, textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 900 }}>
                    {codexHero.name}
                  </h3>
                  <span style={{ background: 'rgba(212, 175, 55, 0.35)', border: '1px solid #f1c40f', color: '#fef08a', fontSize: '0.78rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '10px' }}>
                    {codexHero.era} ({codexHero.periodYear})
                  </span>
                </div>
                <div style={{ fontSize: '1rem', color: '#fef08a', marginTop: '4px', fontWeight: 'bold', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                  {codexHero.title}
                </div>
              </div>

              {/* KHUNG THÔNG TIN IN-GAME (Stats, Role & Skill) */}
              {matchingGameHero && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.85)',
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
                      <span style={{ background: matchingGameHero.color, color: 'white', fontSize: '0.8rem', fontWeight: 900, padding: '3px 10px', borderRadius: '8px' }}>
                        {matchingGameHero.rarity || 'SSR'}
                      </span>
                      {roleInfo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 'bold', color: roleInfo.color }}>
                          <span>{roleInfo.icon}</span>
                          <span>{roleInfo.name}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚔️ ATK: {matchingGameHero.atk.toLocaleString()}</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>❤️ HP: {matchingGameHero.maxHp.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Row 2: Skill & Synergy */}
                  <div style={{ display: 'grid', gridTemplateColumns: matchingGameHero.synergy ? '1fr 1fr' : '1fr', gap: '10px' }}>
                    {/* Tuyệt Kỹ */}
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '10px 12px', borderRadius: '12px', borderLeft: `3px solid ${matchingGameHero.color}` }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#ffffff' }}>
                        👑 [TUYỆT KỸ] {matchingGameHero.skill?.name || 'Vung Vũ Khí'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
                        Gây {Math.round((matchingGameHero.skill?.damageMultiplier || 2.0) * 100)}% sát thương ATK.
                        {matchingGameHero.skill?.rageRecovery ? ` Hồi ${matchingGameHero.skill.rageRecovery} Nộ.` : ''}
                      </div>
                    </div>

                    {/* Hợp Kỹ */}
                    {matchingGameHero.synergy && (
                      <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '10px 12px', borderRadius: '12px', borderLeft: '3px solid #f1c40f' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fef08a' }}>
                          💥 [HỢP KỸ] {matchingGameHero.synergy.skillName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: '3px' }}>
                          Cùng {partnerHero ? partnerHero.name : 'Đồng Đội'} ra trận bồi 150% Sát Thương!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trích Dẫn Nổi Tiếng */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                borderLeft: '4px solid #f1c40f',
                border: '1px solid rgba(241, 196, 15, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontStyle: 'italic',
                color: '#fef08a',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Quote size={22} color="#f1c40f" style={{ flexShrink: 0 }} />
                <span>"{codexHero.quote}"</span>
              </div>

              {/* Trận Đánh Hiển Hách */}
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Swords size={16} /> các Trận Đánh Hiển Hách Trong Lịch Sử
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {codexHero.famousBattles.map((battle, bIdx) => (
                    <span key={bIdx} style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      ⚔️ {battle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tiểu Sử Lịch Sử */}
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scroll size={16} /> Tiểu Sử Lịch Sử
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {codexHero.biography}
                </p>
              </div>

              {/* Di Sản Tôn Vinh */}
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Medal size={16} color="#2ecc71" /> Di Sản & Công Trạng Tôn Vinh
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#a7f3d0', lineHeight: '1.6' }}>
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
                    background: itemTypeFilter === filter.key ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                    border: itemTypeFilter === filter.key ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    color: itemTypeFilter === filter.key ? '#60a5fa' : '#cbd5e1',
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
                  const rarityColor = item.rarity === 'UR' ? '#e74c3c' : item.rarity === 'SSR' ? '#f1c40f' : '#9b59b6'

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      style={{
                        background: isSelected ? `${rarityColor}22` : 'rgba(30, 41, 59, 0.6)',
                        border: isSelected ? `2px solid ${rarityColor}` : '1px solid rgba(255,255,255,0.1)',
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
                        boxShadow: isSelected ? `0 4px 20px ${rarityColor}44` : 'none'
                      }}
                    >
                      {/* Rarity Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: rarityColor,
                        color: 'white',
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

                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: isSelected ? '#fef08a' : 'white', lineHeight: '1.2' }}>
                        {item.name}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                        {item.type === 'Weapon' ? 'Vũ Khí' : item.type === 'Armor' ? 'Áo Giáp' : 'Báu Vật'}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Selected Item Detail Panel */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: `2px solid ${selectedItem.rarity === 'UR' ? '#e74c3c' : '#f1c40f'}`,
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
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: `2px solid ${selectedItem.rarity === 'UR' ? '#e74c3c' : '#f1c40f'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                  }}>
                    {selectedItem.icon}
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: selectedItem.rarity === 'UR' ? '#ff4d4d' : '#f1c40f' }}>
                      {selectedItem.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ background: selectedItem.rarity === 'UR' ? '#e74c3c' : '#f1c40f', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>
                        PHẨM {selectedItem.rarity}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {selectedItem.type === 'Weapon' ? 'Vũ Khí Lịch Sử' : selectedItem.type === 'Armor' ? 'Áo Giáp Phòng Thủ' : 'Báu Vật Thần Kỳ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat Bonus Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CHỈ SỐ TRANG BỊ (STAT BONUS):
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {selectedItem.statBonus.atk && (
                      <div style={{ color: '#ef4444', fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={18} /> +{selectedItem.statBonus.atk} ATK
                      </div>
                    )}
                    {selectedItem.statBonus.hp && (
                      <div style={{ color: '#10b981', fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={18} /> +{selectedItem.statBonus.hp.toLocaleString()} HP
                      </div>
                    )}
                  </div>
                </div>

                {/* Description & History Lore */}
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#fef08a', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Scroll size={16} /> NGUỒN GỐC & ĐÒN BẢO VẬT:
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6' }}>
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
