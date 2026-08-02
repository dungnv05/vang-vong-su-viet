import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'

interface ParallaxHeroProps {
  imageUrl: string
  scale?: number
  positionOffset?: [number, number, number]
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uImage;
  uniform vec2 uMouse;
  uniform float uTime;
  
  varying vec2 vUv;

  void main() {
    // Tự động tạo Depth Map giả: 
    // Nhân vật thường nằm ở giữa ảnh nên tâm ảnh sẽ "nổi" (gần) hơn so với rìa ảnh
    float distToCenter = distance(vUv, vec2(0.5, 0.5));
    // Tạo đường cong depth mềm mại
    float pseudoDepth = smoothstep(0.8, 0.0, distToCenter) * 0.15; 
    
    // Thêm hiệu ứng luma (độ sáng) để các phần sáng (như giáp vàng) nổi bật hơn một chút
    vec4 texColor = texture2D(uImage, vUv);
    float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    pseudoDepth += (luma * 0.05);

    // Tính toán độ lệch UV dựa trên góc nhìn camera (hoặc chuột) và pseudoDepth
    // uMouse lưu trữ góc lệch của camera/chuột so với tâm
    vec2 offset = uMouse * pseudoDepth;
    
    // Hiệu ứng "thở" nhè nhẹ theo thời gian (nhân vật như đang sống)
    offset.y += sin(uTime * 2.0 + vUv.y * 10.0) * 0.005 * pseudoDepth;

    vec4 finalColor = texture2D(uImage, vUv + offset);
    
    gl_FragColor = finalColor;
  }
`

export default function ParallaxHero({ imageUrl, scale = 1, positionOffset = [0, 0, 0] }: ParallaxHeroProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // Load texture
  const texture = useLoader(TextureLoader, imageUrl)
  
  // Tránh việc ảnh bị mờ hoặc sai tỷ lệ
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  
  // Image aspect ratio (ví dụ ảnh dọc 9:16)
  const imageAspect = texture.image ? texture.image.width / texture.image.height : 1
  
  const { camera } = useThree()

  const uniforms = useMemo(() => ({
    uImage: { value: texture },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 }
  }), [texture])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      // Tính toán vector hướng nhìn từ camera tới plane để tạo parallax
      // Giả lập uMouse bằng cách lấy vị trí X, Y của camera so với tâm
      // Điều này giúp khi dùng OrbitControls xoay, ảnh cũng tự động nổi 3D theo
      const camPos = state.camera.position
      materialRef.current.uniforms.uMouse.value.set(
        camPos.x * 0.1, 
        camPos.y * 0.1 - 0.2
      )
    }
    
    // Cho tấm ảnh luôn hướng về phía camera (Billboard effect) một cách mượt mà
    if (meshRef.current) {
      // Chỉ xoay quanh trục Y để đứng thẳng
      meshRef.current.rotation.y = Math.atan2(camera.position.x, camera.position.z)
    }
  })

  return (
    <group position={new THREE.Vector3(...positionOffset)} scale={scale}>
      <mesh ref={meshRef}>
        <planeGeometry args={[2 * imageAspect, 2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Khung viền và Hào quang sau lưng (Tuỳ chọn để đẹp hơn) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.1 * imageAspect, 2.1]} />
        <meshBasicMaterial color="#f1c40f" opacity={0.5} transparent />
      </mesh>
    </group>
  )
}
