import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { MERIDIAN_NODES, type MeridianNode } from '../../data/meridiansData'
import { X, Flame, Sparkles, CheckCircle2 } from 'lucide-react'

export default function MeridiansModal({ heroId, onClose }: { heroId: string | null; onClose: () => void }) {
  const gold = useGameStore(state => state.gold)
  const heroes = useGameStore(state => state.heroes)
  const [openedNodes, setOpenedNodes] = useState<string[]>(['m_nham'])

  if (!heroId) return null
  const hero = heroes.find(h => h.id === heroId)
  if (!hero) return null

  const handleUnlockNode = (node: MeridianNode) => {
    if (gold >= node.costGold && !openedNodes.includes(node.id)) {
      setOpenedNodes(prev => [...prev, node.id])
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 10, 20, 0.95)',
      
      zIndex: 110,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '650px',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(56, 189, 248, 0.3)',
        color: 'white',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
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

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame color="#38bdf8" /> Khai Thông Kinh Mạch & Linh Khí: {hero.name}
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#94a3b8' }}>
          Khai thông 4 Đường Kinh Mạch huyền thoại để bứt phá chỉ số Bạo Kích, ATK và Sinh Lực tối thượng!
        </p>

        {/* Danh Sách Kinh Mạch Node */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {MERIDIAN_NODES.map((node) => {
            const isUnlocked = openedNodes.includes(node.id)

            return (
              <div
                key={node.id}
                style={{
                  background: isUnlocked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                  border: isUnlocked ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '2rem' }}>{node.icon}</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: isUnlocked ? '#7dd3fc' : 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {node.name} {isUnlocked && <CheckCircle2 size={16} color="#2ecc71" />}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#fef08a', marginTop: '2px', fontWeight: 'bold' }}>
                      ✨ {node.statBonusText}
                    </div>
                  </div>
                </div>

                {!isUnlocked ? (
                  <button
                    onClick={() => handleUnlockNode(node)}
                    disabled={gold < node.costGold}
                    style={{
                      background: gold >= node.costGold ? 'linear-gradient(45deg, #0284c7, #38bdf8)' : '#475569',
                      border: 'none',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: gold >= node.costGold ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={16} /> Khai Thông ({node.costGold.toLocaleString()} Vàng)
                  </button>
                ) : (
                  <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.88rem' }}>ĐÃ KHAI THÔNG</span>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
