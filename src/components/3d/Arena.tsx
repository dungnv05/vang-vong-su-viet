import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import Hero3D from './Hero3D'
import ComboVFX from './ComboVFX'
import Beast3D from './Beast3D'
import { TEAM_GRID_SLOTS } from '../../data/heroes'
import { useGameStore } from '../../store/gameStore'

export default function Arena() {
  const heroes = useGameStore(state => state.heroes)
  const enemies = useGameStore(state => state.enemies)
  const draggingHeroId = useGameStore(state => state.draggingHeroId)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Sàn đấu 3D Cổ Kính */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Hoa văn Trống Đồng Đông Sơn trung tâm bàn cờ */}
      <group position={[0, 0.015, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Vòng tròn Mặt Trời Trống Đồng */}
        <mesh>
          <ringGeometry args={[0, 1.2, 32]} />
          <meshBasicMaterial color="#f1c40f" transparent opacity={0.35} />
        </mesh>
        {/* Vòng Ngôi Sao 12 Cánh */}
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[1.5, 1.8, 12]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.5} />
        </mesh>
        {/* Vòng Họa Tiết Chim Lạc Cổ */}
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[3.2, 3.6, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.003]}>
          <ringGeometry args={[5.5, 5.8, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Đèn chiếu điểm trung tâm sàn đấu */}
      <pointLight position={[0, 5, -0.75]} intensity={2.5} color="#f59e0b" distance={15} />

      {/* Lưới chia ô bàn cờ */}
      <gridHelper args={[24, 24, '#f1c40f', '#334155']} position={[0, 0.01, 0]} />

      {/* 6 Ô lưới hiển thị vị trí phe ta */}
      {TEAM_GRID_SLOTS.map((slotPos, index) => (
        <mesh key={`slot-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[slotPos[0], 0.02, slotPos[2]]}>
          <ringGeometry args={[0.7, 0.85, 32]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Các ô lưới vị trí kẻ địch (6 vị) */}
      {TEAM_GRID_SLOTS.map((slotPos, idx) => (
        <mesh key={`enemy-slot-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[slotPos[0], 0.02, -slotPos[2]]}>
          <ringGeometry args={[0.9, 1.05, 32]} />
          <meshBasicMaterial color="#e74c3c" transparent opacity={0.6} />
        </mesh>
      ))}


      {/* Render Linh Vật & Thú Cưỡi Hộ Quốc bên cạnh bàn cờ */}
      <Suspense fallback={null}>
        <Beast3D />
      </Suspense>

      {/* Render Danh sách Tướng phe ta */}
      <Suspense fallback={null}>
        {heroes.filter(hero => hero.slotIndex !== -1 || hero.id === draggingHeroId).map(hero => (
          <Hero3D key={hero.id} data={hero} />
        ))}
      </Suspense>

      {/* Render Kẻ địch */}
      <Suspense fallback={null}>
        {enemies.map(enemy => (
          <Hero3D key={enemy.id} data={enemy} />
        ))}
      </Suspense>

      {/* Hiệu ứng Hợp Kích */}
      <ComboVFX />

      {/* Tắt xoay Camera khi đang Kéo Thả tướng */}
      <OrbitControls 
        makeDefault 
        enabled={!draggingHeroId} 
        target={[0, 0.5, -1]}
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
      />
    </>
  )
}
