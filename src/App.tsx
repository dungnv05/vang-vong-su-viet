import { Canvas } from '@react-three/fiber'
import Arena from './components/3d/Arena'
import HUD from './components/ui/HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', position: 'relative' }}>
      {/* Lớp hiển thị 3D */}
      <Canvas shadows camera={{ position: [2, 10, 12], fov: 50 }}>
        <Arena />
      </Canvas>

      {/* Lớp hiển thị UI 2D đè lên trên */}
      <HUD />
    </div>
  )
}
