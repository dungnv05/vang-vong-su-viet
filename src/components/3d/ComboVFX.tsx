import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import { Group } from 'three'
import { useGameStore } from '../../store/gameStore'

export default function ComboVFX() {
  const comboBanner = useGameStore(state => state.comboBanner)
  const activeAttackerId = useGameStore(state => state.activeAttackerId)
  const actionText = useGameStore(state => state.actionText)
  const groupRef = useRef<Group>(null)
  const shockwaveRef = useRef<Group>(null)
  const slashTrailRef = useRef<Group>(null)
  const { camera } = useThree()

  const isUltimate = actionText?.includes('[TUYỆT KỸ]') || !!comboBanner

  useFrame((state, delta) => {
    // Camera shake & Dynamic Cinematic Shake khi ra Tuyệt Kỹ
    if (isUltimate) {
      const shakeX = (Math.random() - 0.5) * 0.15
      const shakeY = (Math.random() - 0.5) * 0.15
      camera.position.x += shakeX
      camera.position.y += shakeY
    }

    if (shockwaveRef.current) {
      shockwaveRef.current.rotation.z += delta * 4
      const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.2
      shockwaveRef.current.scale.set(scale, scale, scale)
    }

    if (slashTrailRef.current) {
      slashTrailRef.current.rotation.y += delta * 6
    }
  })

  return (
    <group ref={groupRef}>
      {/* Vệt Kiếm Energy 3D Dải Lụa Năng Lượng khi Tấn Công */}
      {activeAttackerId && (
        <group ref={slashTrailRef} position={[0, 1.5, -0.75]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[1.8, 0.08, 16, 64, Math.PI * 1.2]} />
            <meshStandardMaterial color="#f1c40f" emissive="#f59e0b" emissiveIntensity={3.0} transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, -Math.PI / 4]}>
            <torusGeometry args={[2.2, 0.06, 16, 64, Math.PI * 0.9]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={3.5} transparent opacity={0.75} />
          </mesh>
        </group>
      )}

      {/* Sóng Xung Kích Nứt Đất 3D (Shockwave Decal Ring) khi Tung Tuyệt Kỹ */}
      {isUltimate && (
        <group ref={shockwaveRef} position={[0, 0.03, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[1.5, 2.8, 32]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={2.5} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <ringGeometry args={[2.8, 3.5, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* Cột năng lượng thần thánh & Hạt Lửa Sét bộc phát khi Hợp Kích */}
      {comboBanner && (
        <>
          <Float speed={5} rotationIntensity={2} floatIntensity={3}>
            <mesh position={[0, 2, -1]}>
              <cylinderGeometry args={[0.2, 2, 8, 32]} />
              <meshStandardMaterial 
                color="#f1c40f" 
                emissive="#e67e22" 
                emissiveIntensity={4.0} 
                transparent 
                opacity={0.9} 
              />
            </mesh>
          </Float>

          <Sparkles 
            position={[0, 2, 0]} 
            count={300} 
            scale={[10, 8, 10]} 
            size={8} 
            speed={5} 
            color="#f1c40f" 
          />
          <Sparkles 
            position={[0, 1, 0]} 
            count={200} 
            scale={[8, 5, 8]} 
            size={6} 
            speed={7} 
            color="#ef4444" 
          />
        </>
      )}
    </group>
  )
}
