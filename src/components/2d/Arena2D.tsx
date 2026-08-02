import { useGameStore } from '../../store/gameStore'
import Hero2D from './Hero2D'
import ComboVFX2D from './ComboVFX2D'

export default function Arena2D() {
  const heroes = useGameStore(state => state.heroes)
  const enemies = useGameStore(state => state.enemies)
  const draggingHeroId = useGameStore(state => state.draggingHeroId)

  // Lọc tướng không nằm trong kho (slotIndex !== -1), trừ khi đang được kéo thả
  const activeHeroes = heroes.filter(hero => hero.slotIndex !== -1 || hero.id === draggingHeroId)
  const activeEnemies = enemies.filter(enemy => enemy.slotIndex !== -1)

  return (
    <div 
      className="arena-2d-container"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #1a2a6c, #11212b, #4b134f)',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      {/* Background Phối Cảnh Đơn Giản */}
      <div 
        style={{
          position: 'absolute',
          bottom: '10%',
          width: '120%',
          height: '40%',
          left: '-10%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          transform: 'perspective(500px) rotateX(60deg)'
        }}
      />

      {/* Render Player Heroes */}
      {activeHeroes.map(hero => (
        <Hero2D key={`hero-${hero.id}`} data={hero} />
      ))}

      {/* Render Enemies */}
      {activeEnemies.map(enemy => (
        <Hero2D key={`enemy-${enemy.id}`} data={enemy} />
      ))}

      {/* Hiệu Ứng Sát Thương / Kỹ Năng */}
      <ComboVFX2D />
    </div>
  )
}
