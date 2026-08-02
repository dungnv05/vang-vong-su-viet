import Arena2D from './components/2d/Arena2D'
import HUD from './components/ui/HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', position: 'relative' }}>
      {/* Lớp chiến trường 2D thuần túy */}
      <Arena2D />

      {/* Lớp hiển thị UI 2D đè lên trên (HUD/Gacha/Codex) */}
      <HUD />
    </div>
  )
}
