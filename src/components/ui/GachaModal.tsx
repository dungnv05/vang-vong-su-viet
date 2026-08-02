import { useGameStore } from '../../store/gameStore'
import { X, Sparkles, Coins } from 'lucide-react'

export default function GachaModal() {
  const showGachaModal = useGameStore(state => state.showGachaModal)
  const setShowGachaModal = useGameStore(state => state.setShowGachaModal)
  const gold = useGameStore(state => state.gold)
  const pullGacha = useGameStore(state => state.pullGacha)
  const gachaResults = useGameStore(state => state.gachaResults)
  const clearGachaResults = useGameStore(state => state.clearGachaResults)

  if (!showGachaModal) return null

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
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: '2px solid #f1c40f',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(241, 196, 15, 0.35)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={() => {
            clearGachaResults()
            setShowGachaModal(false)
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        {/* Modal Title */}
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="#f1c40f" /> Đài Chiêu Mộ Anh Hùng Sử Việt
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Triệu hồi các Vị Tướng Lịch Sử (UR, SSR, SR) cùng xuất trận dẹp loạn ngoại xâm!
        </p>

        {/* Gacha Banner Graphic */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.2), rgba(147, 51, 234, 0.2))',
          border: '1.5px solid rgba(241, 196, 15, 0.5)',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fef08a' }}>
              BỂ CHIÊU MỘ HOÀNG GIA - TỶ LỆ UR 10%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
              Tướng trùng lặp tự động quy đổi thành <strong>+30 Mảnh Tướng</strong> để Tăng Sao!
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>VÀNG HIỆN CÓ</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Coins size={18} /> {gold.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Gacha Results Display (Nút Quay Thẻ Animation & Avatar Image) */}
        {gachaResults ? (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#2ecc71', textAlign: 'center' }}>
              ✨ KẾT QUẢ CHIÊU MỘ ANH HÙNG ✨
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: gachaResults.length === 1 ? '1fr' : 'repeat(5, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              maxHeight: '340px',
              overflowY: 'auto'
            }}>
              {gachaResults.map((result, idx) => (
                <div
                  key={result.id}
                  style={{
                    background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: `2px solid ${result.color}`,
                    borderRadius: '16px',
                    padding: '14px 10px',
                    textAlign: 'center',
                    boxShadow: `0 0 25px ${result.color}88`,
                    animation: `fadeInCard 0.4s ease forwards ${idx * 0.08}s`,
                    position: 'relative'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: result.color,
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    zIndex: 2
                  }}>
                    {result.rarity}
                  </span>

                  {/* Avatar 2D Image */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                    {result.avatarUrl ? (
                      <img 
                        src={result.avatarUrl} 
                        alt={result.name} 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: `1.5px solid ${result.color}`,
                          boxShadow: `0 4px 15px ${result.color}66`
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '2.5rem' }}>🏛️</div>
                    )}
                  </div>

                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: result.color }}>{result.name}</div>
                  
                  {result.isDuplicate ? (
                    <div style={{ background: 'rgba(241, 196, 15, 0.2)', border: '1px solid #f1c40f', color: '#fef08a', fontSize: '0.68rem', fontWeight: 'bold', padding: '2px', borderRadius: '6px', marginTop: '6px' }}>
                      +30 MẢNH
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{result.role}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={clearGachaResults}
                style={{
                  background: 'linear-gradient(45deg, #0284c7, #38bdf8)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                XÁC NHẬN & QUAY THÊM
              </button>
            </div>
          </div>
        ) : (
          /* Pull Actions */
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => pullGacha(1)}
              disabled={gold < 300}
              style={{
                flex: 1,
                maxWidth: '240px',
                background: gold >= 300 ? 'linear-gradient(45deg, #2563eb, #3b82f6)' : '#475569',
                border: '1.5px solid #93c5fd',
                color: 'white',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: gold >= 300 ? 'pointer' : 'not-allowed',
                boxShadow: gold >= 300 ? '0 4px 20px rgba(59, 130, 246, 0.4)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>CHIÊU MỘ X1</span>
              <span style={{ fontSize: '0.8rem', color: '#dbeafe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} /> 300 Vàng
              </span>
            </button>

            <button
              onClick={() => pullGacha(10)}
              disabled={gold < 2700}
              style={{
                flex: 1,
                maxWidth: '240px',
                background: gold >= 2700 ? 'linear-gradient(45deg, #b45309, #f59e0b, #d97706)' : '#475569',
                border: '2px solid #fef08a',
                color: 'white',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: gold >= 2700 ? 'pointer' : 'not-allowed',
                boxShadow: gold >= 2700 ? '0 6px 25px rgba(245, 158, 11, 0.6)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>CHIÊU MỘ X10 (ƯU ĐÃI)</span>
              <span style={{ fontSize: '0.8rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} /> 2,700 Vàng
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
