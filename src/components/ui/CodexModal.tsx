import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { CODEX_HEROES } from '../../data/codexData'
import { X, BookOpen, Scroll, Swords, Medal, Quote } from 'lucide-react'

export default function CodexModal() {
  const showCodexModal = useGameStore(state => state.showCodexModal)
  const setShowCodexModal = useGameStore(state => state.setShowCodexModal)

  const [selectedCodexId, setSelectedCodexId] = useState<string>(CODEX_HEROES[0].id)

  if (!showCodexModal) return null

  const hero = CODEX_HEROES.find(h => h.id === selectedCodexId) || CODEX_HEROES[0]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
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
        maxWidth: '960px',
        height: '85vh',
        padding: '28px',
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
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen color="#f1c40f" /> Bách Khoa Toàn Thư Lịch Sử Việt Nam
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Tra cứu tiểu sử hào hùng, trận đánh hiển hách và di sản tôn vinh của các Vị Hero Anh Hùng Dân Tộc.
        </p>

        {/* Nội dung Bách Khoa 2 Cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
          {/* Cột Trái: Danh Sách Danh Nhân */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
            {CODEX_HEROES.map(item => {
              const isSelected = item.id === hero.id

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCodexId(item.id)}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'rgba(30, 41, 59, 0.5)',
                    border: isSelected ? '1.5px solid #f1c40f' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: item.color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.2rem'
                  }}>
                    🏛️
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? '#fef08a' : 'white' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {item.era}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cột Phải: Hiển Thị FULL-ART BACKGROUND Cho Toàn Bộ Khung Detail Tướng */}
          <div style={{
            backgroundImage: hero.backgroundUrl 
              ? `linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(15, 23, 42, 0.98) 100%), url(${hero.backgroundUrl})` 
              : 'none',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            border: `2px solid ${hero.color}`,
            borderRadius: '20px',
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: `0 8px 30px ${hero.color}33`,
            position: 'relative'
          }}>
            {/* Header Tướng */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: hero.color, textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 900 }}>
                  {hero.name}
                </h3>
                <span style={{ background: 'rgba(212, 175, 55, 0.35)', border: '1px solid #f1c40f', color: '#fef08a', fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  {hero.era} ({hero.periodYear})
                </span>
              </div>
              <div style={{ fontSize: '1.05rem', color: '#fef08a', marginTop: '4px', fontWeight: 'bold', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                {hero.title}
              </div>
            </div>

            {/* Trích Dẫn Nổi Tiếng */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              borderLeft: '4px solid #f1c40f',
              border: '1px solid rgba(241, 196, 15, 0.4)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontStyle: 'italic',
              color: '#fef08a',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              <Quote size={26} color="#f1c40f" />
              <span>"{hero.quote}"</span>
            </div>

            {/* Trận Đánh Hiển Hách */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Swords size={18} /> Các Trận Đánh Hiển Hách Trong Lịch Sử
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {hero.famousBattles.map((battle, bIdx) => (
                  <span key={bIdx} style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ⚔️ {battle}
                  </span>
                ))}
              </div>
            </div>

            {/* Tiểu Sử Lịch Sử */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scroll size={18} /> Tiểu Sử Lịch Sử
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.65' }}>
                {hero.biography}
              </p>
            </div>

            {/* Di Sản Tôn Vinh */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Medal size={18} color="#2ecc71" /> Di Sản & Công Trạng Tôn Vinh
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#a7f3d0', lineHeight: '1.65' }}>
                {hero.legacy}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
