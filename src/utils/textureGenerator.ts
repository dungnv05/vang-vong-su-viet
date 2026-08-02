import * as THREE from 'three'

// Tạo Gradient Ramp 3 dải độ sáng cho Cel-Shading Toon Material
export function createGradientRampTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 1
  const ctx = canvas.getContext('2d')!

  // 3 Dải màu sáng - trung bình - bóng tối sắc nét
  const gradient = ctx.createLinearGradient(0, 0, 128, 0)
  gradient.addColorStop(0, '#334155')   // Bóng tối
  gradient.addColorStop(0.4, '#94a3b8') // Trung bình
  gradient.addColorStop(0.8, '#ffffff') // Vùng sáng rực

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 1)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  return texture
}

// Tạo Tranh Tranh Minh Họa 1024x1024 Thánh Gióng Cưỡi Ngựa Sắt Binh Múa Gậy Tre Rực Lửa
export function createThanhGiongArtworkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // 1. Nền bầu trời giông bão & Lửa bùng nổ
  const skyGrad = ctx.createRadialGradient(512, 512, 100, 512, 512, 600)
  skyGrad.addColorStop(0, '#f97316')   // Cam lửa rực rỡ
  skyGrad.addColorStop(0.4, '#b45309') // Nâu đỏ bão lửa
  skyGrad.addColorStop(0.8, '#1e1b4b') // Tím mây bão giông
  skyGrad.addColorStop(1, '#090d16')   // Đêm tối
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // 2. Tia Sét Sấm Truyền (Lightning Bolts)
  ctx.strokeStyle = '#fef08a'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(200, 50)
  ctx.lineTo(280, 220)
  ctx.lineTo(240, 240)
  ctx.lineTo(320, 450)
  ctx.stroke()

  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(800, 30)
  ctx.lineTo(750, 180)
  ctx.lineTo(780, 210)
  ctx.lineTo(700, 400)
  ctx.stroke()

  // 3. Mô hình Ngựa Sắt Binh 2D Silhouette Sắc Sảo
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.ellipse(512, 680, 260, 180, -0.2, 0, Math.PI * 2) // Thân ngựa
  ctx.fill()

  // Giáp Ngựa Vàng Kim Loại
  ctx.strokeStyle = '#f1c40f'
  ctx.lineWidth = 14
  ctx.stroke()

  // Đầu Ngựa Vọt Lên Phía Trước
  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.moveTo(350, 600)
  ctx.lineTo(220, 480)
  ctx.lineTo(200, 520)
  ctx.lineTo(310, 680)
  ctx.fill()
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 10
  ctx.stroke()

  // Mắt Ngựa Sắt Phát Sáng Lửa
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(230, 500, 16, 0, Math.PI * 2)
  ctx.fill()

  // 4. Thánh Gióng - Giáp Vàng & Áo Bào ĐỏBay Uy Nghi
  // Áo Bào Đỏ (Red Cape)
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.moveTo(550, 420)
  ctx.quadraticCurveTo(800, 380, 880, 580)
  ctx.quadraticCurveTo(720, 600, 580, 520)
  ctx.fill()

  // Thân & Giáp Vàng (Gold Armor)
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(530, 450, 90, 0, Math.PI * 2) // Giáp ngực
  ctx.fill()
  ctx.strokeStyle = '#fef08a'
  ctx.lineWidth = 8
  ctx.stroke()

  // Đầu & Mũ Chiến Tướng
  ctx.fillStyle = '#f1c40f'
  ctx.beginPath()
  ctx.arc(520, 320, 65, 0, Math.PI * 2)
  ctx.fill()

  // 5. Gậy Tre Ngà Rực Lửa (Flaming Bamboo Staff)
  ctx.strokeStyle = '#10b981' // Tre ngà
  ctx.lineWidth = 24
  ctx.beginPath()
  ctx.moveTo(350, 450)
  ctx.lineTo(820, 120)
  ctx.stroke()

  // Ngọn Lửa Bùng Nổ Ở Đầu Gậy Tre
  const flameGrad = ctx.createRadialGradient(820, 120, 20, 820, 120, 140)
  flameGrad.addColorStop(0, '#ffffff')
  flameGrad.addColorStop(0.3, '#fef08a')
  flameGrad.addColorStop(0.6, '#f97316')
  flameGrad.addColorStop(1, 'rgba(220, 38, 38, 0)')
  ctx.fillStyle = flameGrad
  ctx.beginPath()
  ctx.arc(820, 120, 140, 0, Math.PI * 2)
  ctx.fill()

  // 6. Viền Khung Trống Đồng Đông Sơn Hoàng Gia Bọc Ngoài Tranh
  ctx.strokeStyle = '#f1c40f'
  ctx.lineWidth = 28
  ctx.strokeRect(20, 20, 984, 984)

  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 10
  ctx.strokeRect(48, 48, 928, 928)

  // Tiêu đề Tranh Hoàng Gia
  ctx.fillStyle = '#fef08a'
  ctx.font = '900 52px serif'
  ctx.textAlign = 'center'
  ctx.fillText('PHÙ ĐỔNG THIÊN VƯƠNG', 512, 940)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

// Tạo Texture Procedural 512x512 với hoa văn Việt Nam độc bản cho từng vai trò Tướng
export function createHeroProceduralTexture(role: string, mainColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // 1. Nền màu chủ đạo của Tướng
  ctx.fillStyle = mainColorHex
  ctx.fillRect(0, 0, 512, 512)

  // 2. Viền kim loại Hoàng Gia (Gold Border Embroidery)
  ctx.strokeStyle = '#f1c40f'
  ctx.lineWidth = 16
  ctx.strokeRect(12, 12, 488, 488)

  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 6
  ctx.strokeRect(32, 32, 448, 448)

  // 3. Họa tiết đặc trưng theo Role
  if (role === 'Tank') {
    // Vảy Giáp Sắt & Khối Khiên Thần
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 4
    for (let y = 50; y < 460; y += 40) {
      for (let x = 50; x < 460; x += 40) {
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI)
        ctx.stroke()
      }
    }
  } else if (role === 'DPS') {
    // Họa tiết Rồng Lạc Việt & Sóng Nước Hoàng Gia
    ctx.fillStyle = 'rgba(241, 196, 15, 0.2)'
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(256, 256, 60 + i * 40, 0, Math.PI * 2)
      ctx.fill()
    }
    // Ngôi sao Trống Đồng 12 cánh ở tâm
    ctx.fillStyle = '#fef08a'
    ctx.beginPath()
    ctx.arc(256, 256, 30, 0, Math.PI * 2)
    ctx.fill()
  } else if (role === 'Support') {
    // Họa tiết Mây Cổ & Thần Phù Ức Trai
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    ctx.lineWidth = 6
    for (let x = 60; x <= 450; x += 120) {
      ctx.beginPath()
      ctx.arc(x, 150, 45, 0, Math.PI * 2)
      ctx.arc(x + 40, 350, 35, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else if (role === 'Assassin') {
    // Họa tiết Vệt Dao Đêm & Mây Đen Thần Tốc
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(50, 50)
    ctx.lineTo(460, 256)
    ctx.lineTo(50, 460)
    ctx.fill()
  }

  // 4. Hoa văn Chim Lạc Đông Sơn bốn góc
  const drawLacBird = (cx: number, cy: number) => {
    ctx.fillStyle = '#f1c40f'
    ctx.beginPath()
    ctx.arc(cx, cy, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 1.5)
    ctx.stroke()
  }

  drawLacBird(70, 70)
  drawLacBird(440, 70)
  drawLacBird(70, 440)
  drawLacBird(440, 440)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}
