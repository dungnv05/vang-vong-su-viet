import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Sparkles } from '@react-three/drei'
import { Mesh } from 'three'
import { MOUNT_BEASTS } from '../../data/beasts'
import { useGameStore } from '../../store/gameStore'

export default function Beast3D() {
  const activeBeastId = useGameStore(state => state.activeBeastId)
  const beast = MOUNT_BEASTS.find(b => b.id === activeBeastId) || MOUNT_BEASTS[0]
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group position={beast.position}>
      {/* Hiệu ứng hạt linh khí quấn quanh Linh Vật */}
      <Sparkles count={50} scale={[4, 4, 4]} size={4} speed={2} color={beast.color} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Tên Linh Vật & Buff Aura */}
        <Text position={[0, 2.2, 0]} fontSize={0.35} color={beast.color} anchorY="bottom">
          {beast.icon} {beast.name}
        </Text>
        <Text position={[0, 1.8, 0]} fontSize={0.22} color="#fef08a" anchorY="bottom">
          {beast.auraText}
        </Text>

        {/* Khối Linh Vật 3D Đại Diện */}
        <mesh ref={meshRef} castShadow receiveShadow position={[0, 0.8, 0]}>
          <dodecahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial 
            color={beast.color} 
            roughness={0.2} 
            metalness={0.9} 
            emissive={beast.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* Vòng Tròn Trận Pháp Linh Vật Dưới Đất */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial color={beast.color} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
