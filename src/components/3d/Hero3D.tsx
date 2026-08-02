import { useRef, useState, useMemo, Suspense } from 'react'
import { Mesh, Vector3, Plane, BackSide } from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Text, useGLTF, Clone } from '@react-three/drei'
import { TEAM_GRID_SLOTS, type HeroData } from '../../data/heroes'
import { useGameStore } from '../../store/gameStore'
import { createHeroProceduralTexture, createGradientRampTexture, createThanhGiongArtworkTexture } from '../../utils/textureGenerator'
import ParallaxHero from './ParallaxHero'
import manifest from '../../../public/models/manifest.json'

function GLTFHeroModel({ url, scale = 0.5, rotation = [0, 0, 0], positionOffset = [0, -0.4, 0] }: { url: string; scale?: number; rotation?: [number, number, number]; positionOffset?: [number, number, number] }) {
  const { scene } = useGLTF(url)
  return (
    <group position={positionOffset} rotation={rotation} scale={scale}>
      <Clone object={scene} />
    </group>
  )
}

interface Hero3DProps {
  data: HeroData
  isPreview?: boolean
}

export default function Hero3D({ data, isPreview = false }: Hero3DProps) {
  const heroConfig = (manifest as Record<string, any>)[data.id]
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<any>(null)
  const weaponGroupRef = useRef<any>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [dragPos, setDragPos] = useState<Vector3 | null>(null)

  const draggingHeroId = useGameStore(state => state.draggingHeroId)
  const setDraggingHeroId = useGameStore(state => state.setDraggingHeroId)
  const updateHeroSlot = useGameStore(state => state.updateHeroSlot)
  const comboBanner = useGameStore(state => state.comboBanner)
  const activeAttackerId = useGameStore(state => state.activeAttackerId)

  const isDragging = draggingHeroId === data.id
  const hasEquippedSword = data.equippedItemIds?.includes('item_1') // Thuận Thiên Kiếm
  const hasEquippedCrossbow = data.equippedItemIds?.includes('item_2') // Nỏ Thần

  // Sinh Cel-Shading Gradient Ramp & Procedural Texture Canvas cho Tướng
  const toonRamp = useMemo(() => createGradientRampTexture(), [])
  const heroTexture = useMemo(() => createHeroProceduralTexture(data.role, data.color), [data.role, data.color])
  const giongArtworkTexture = useMemo(() => createThanhGiongArtworkTexture(), [])

  // Xác định vị trí mục tiêu của tướng
  const getTargetPosition = (): [number, number, number] => {
    if (isPreview) return [0, -0.5, 0] // Vị trí hiển thị Preview Modal

    if (isDragging && dragPos) {
      return [dragPos.x, 0.8, dragPos.z]
    }
    if (comboBanner && !data.isEnemy) {
      return data.id === 'h1' ? [-1.2, 0.8, 0] : [1.2, 0.8, 0]
    }
    if (activeAttackerId === data.id) {
      const basePos = TEAM_GRID_SLOTS[data.slotIndex] || [0, 0.5, 1];
      if (data.isEnemy) {
        // Quái tiến thẳng về phía phe ta (+Z)
        return [basePos[0], 0.5, -basePos[2] + 0.8];
      }
      // Tướng phe ta tiến thẳng về phía quái (-Z)
      return [basePos[0], 0.5, basePos[2] - 0.8];
    }
    if (data.isEnemy) {
      const enemyPos = TEAM_GRID_SLOTS[data.slotIndex] || [0, 0.5, 1];
      // Mirror Z coordinate to opponent side
      return [enemyPos[0], enemyPos[1], -enemyPos[2]];
    }
    return TEAM_GRID_SLOTS[data.slotIndex] || [0, 0.5, 1];
  }

  const auraRef = useRef<any>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const target = getTargetPosition()
    groupRef.current.position.lerp(new Vector3(...target), delta * (activeAttackerId === data.id ? 15 : 10))

    if (auraRef.current) {
      auraRef.current.rotation.z += delta * 1.5
    }

    if (weaponGroupRef.current) {
      if (activeAttackerId === data.id) {
        // Hoạt ảnh chém vũ khí
        weaponGroupRef.current.rotation.x -= delta * 15
      } else {
        // Trả vũ khí về tư thế cũ
        weaponGroupRef.current.rotation.x = 0
      }
    }

    if (meshRef.current && !isDragging) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + data.slotIndex) * 0.08
    }
  })

  // Xử lý Sự kiện Kéo Thả
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isPreview || data.isEnemy || comboBanner) return
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setDraggingHeroId(data.id)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isPreview || !isDragging) return
    e.stopPropagation()
    const groundPlane = new Plane(new Vector3(0, 1, 0), -0.5)
    const targetVector = new Vector3()
    e.ray.intersectPlane(groundPlane, targetVector)
    setDragPos(targetVector)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isPreview || !isDragging) return
    e.stopPropagation()
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)

    if (dragPos) {
      let closestSlot = data.slotIndex
      let minDistance = Infinity

      TEAM_GRID_SLOTS.forEach((slotPos, index) => {
        const dist = new Vector3(slotPos[0], 0.5, slotPos[2]).distanceTo(dragPos)
        if (dist < minDistance) {
          minDistance = dist
          closestSlot = index
        }
      })

      updateHeroSlot(data.id, closestSlot)
    }

    setDragPos(null)
    setDraggingHeroId(null)
  }

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => {
        if (!isPreview) setIsHovered(true)
      }}
      onPointerOut={() => {
        if (!isPreview) setIsHovered(false)
      }}
    >
      {/* UI Elements: Không hiển thị trong chế độ xem trước (isPreview) */}
      {!isPreview && (
        <>
          {/* Tên nhân vật & Role */}
          <Text position={[0, 1.6, 0]} fontSize={0.32} color={data.isEnemy ? "#ff4d4d" : "white"} anchorY="bottom">
            {data.name}
          </Text>

          {/* Thanh Máu 3D */}
          <mesh position={[0, 1.3, 0]}>
            <planeGeometry args={[Math.max(0.01, 1.5 * (data.hp / data.maxHp)), 0.12]} />
            <meshBasicMaterial color={data.hp > data.maxHp * 0.3 ? "#2ecc71" : "#e74c3c"} />
          </mesh>

          {/* Thanh Nộ Khí 3D (Rage Bar) */}
          <mesh position={[0, 1.15, 0.01]}>
            <planeGeometry args={[Math.max(0.01, 1.5 * ((data.rage || 0) / (data.maxRage || 100))), 0.06]} />
            <meshBasicMaterial color="#f1c40f" />
          </mesh>
          {/* Viền đen nền cho thanh Nộ */}
          <mesh position={[0, 1.15, 0]}>
            <planeGeometry args={[1.5, 0.06]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
        </>
      )}

      {/* Trận Pháp Nộ Khí 3D Bật Sáng rực rỡ khi đầy 100 Nộ Khí */}
      {!isPreview && (data.rage || 0) >= (data.maxRage || 100) && (
        <group position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh ref={auraRef}>
            <ringGeometry args={[0.7, 1.1, 32]} />
            <meshStandardMaterial 
              color="#f1c40f" 
              emissive="#f59e0b" 
              emissiveIntensity={2.0} 
              transparent 
              opacity={0.9} 
            />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <ringGeometry args={[1.1, 1.3, 32]} />
            <meshBasicMaterial color="#e74c3c" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Vòng sáng chọn dưới chân khi kéo thả hoặc di chuột */}
      {(isHovered || isDragging) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <ringGeometry args={[0.7, 0.9, 32]} />
          <meshBasicMaterial color={isDragging ? "#f1c40f" : "#3498db"} />
        </mesh>
      )}

      {/* Bọc toàn bộ Vũ Khí vào 1 group riêng để tạo animation chém */}
      <group ref={weaponGroupRef}>
        {/* Mô hình Thần Khí 3D Vũ Khí khi Trang Bị (Thuận Thiên Kiếm / Nỏ Thần) */}
      {hasEquippedSword && (
        <group position={[0.7, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
          {/* Lưỡi Kiếm Hoàng Gia 3D */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.9, 0.04]} />
            <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.1} emissive="#f1c40f" emissiveIntensity={0.6} />
          </mesh>
          {/* Chuôi Kiếm */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        </group>
      )}

        {hasEquippedCrossbow && (
          <group position={[-0.7, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            {/* Nỏ Thần An Dương Vương 3D */}
            <mesh>
              <torusGeometry args={[0.3, 0.04, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.8} emissive="#0284c7" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}

        {/* Gậy Tre Ngà Rực Lửa Thánh Gióng 3D */}
        {(data.hasFlamingBamboo || data.id === 'h7') && (
          <group position={[0.8, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
            {/* Thân Gậy Tre 3D */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.8, 12]} />
              <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
            </mesh>
            {/* Đầu Gậy Tre Bằng Lửa 3D */}
            <mesh position={[0, 1.2, 0]}>
              <coneGeometry args={[0.15, 0.5, 12]} />
              <meshStandardMaterial color="#ef4444" emissive="#f59e0b" emissiveIntensity={2.5} />
            </mesh>
            {/* Nguồn Sáng Điểm Ngọn Lửa */}
            <pointLight position={[0, 1.2, 0]} intensity={3} color="#f59e0b" distance={4} />
          </group>
        )}
      </group>

      {/* Ngựa Sắt Binh 3D Nâng Đỡ Tướng Cưỡi (Thánh Gióng) */}
      {data.isMounted && (
        <group position={[0, -0.15, 0]}>
          {/* Thân Ngựa Sắt 3D */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.7, 0.55, 1.4]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} emissive="#b45309" emissiveIntensity={0.3} />
          </mesh>
          {/* Đầu Ngựa Sắt */}
          <mesh position={[0, 0.5, -0.7]} rotation={[-Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.7]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Mắt Ngựa Phát Sáng Lửa */}
          <mesh position={[0.18, 0.55, -0.9]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[-0.18, 0.55, -0.9]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {heroConfig?.type === '2.5D' ? (
        /* Nạp Model Shader 2.5D Parallax */
        <Suspense fallback={null}>
          <group scale={isDragging ? 1.15 : 1} position={[0, 0.5, 0]}>
            <ParallaxHero 
              imageUrl={heroConfig.imageUrl} 
              scale={heroConfig.scale || 1} 
              positionOffset={heroConfig.positionOffset || [0, 0, 0]} 
            />
          </group>
        </Suspense>
      ) : heroConfig?.modelUrl ? (
        /* Nạp Model 3D .GLB từ Manifest */
        <Suspense fallback={null}>
          <group scale={isDragging ? 1.15 : 1}>
            <GLTFHeroModel url={heroConfig.modelUrl} scale={heroConfig.scale || 0.45} rotation={heroConfig.rotation || [0, 0, 0]} positionOffset={heroConfig.positionOffset || [0, -0.4, 0]} />
          </group>
        </Suspense>
      ) : (
        /* Human‑like figure with Cel-Shading (Toon Shading) & 3D Outlines */
        <group ref={meshRef as any} scale={isDragging ? 1.15 : 1}>
          {/* Thân nhân vật Cel-Shaded với Texture Họa Tiết Lạc Việt */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.82, 16]} />
            <meshToonMaterial map={heroTexture} gradientMap={toonRamp} color={data.color} />
          </mesh>
          {/* Viền đen Đồ Họa 3D Thân (Inverted Hull Outline) */}
          <mesh scale={[1.08, 1.05, 1.08]}>
            <cylinderGeometry args={[0.26, 0.26, 0.82, 16]} />
            <meshBasicMaterial color="#0f172a" side={BackSide} />
          </mesh>

          {/* Đầu nhân vật Cel-Shaded */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshToonMaterial gradientMap={toonRamp} color={data.color} />
          </mesh>
          {/* Viền đen Đồ Họa 3D Đầu */}
          <mesh position={[0, 0.9, 0]} scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#0f172a" side={BackSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}
