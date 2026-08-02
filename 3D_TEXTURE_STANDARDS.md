# 🎨 QUY CHUẨN THIẾT KẾ TEXTURE 3D CHO TRANG BỊ & THẦN KHÍ (PBR 3D TEXTURE STANDARDS)

---

## 1. 📂 Cấu Trúc Lưu Thư Mục Tệp Texture Trong Dự Án

Tất cả các tệp Texture 3D cho Trang Bị, Giáp & Vũ Khí 3D được lưu trữ tại:
```text
public/assets/textures/equipment/
├── sword_thuan_thien/
│   ├── albedo.png       # Màu sắc & Hoa văn Rồng thời Lê
│   ├── normal.png       # Độ chạm khắc rãnh kiếm
│   ├── roughness.png    # Độ nhám ánh kim
│   └── emissive.png     # Hào quang vàng hoàng kim
├── crossbow_no_than/
│   ├── albedo.png       # Hoa văn Đồng Sơn Xanh Rêu
│   └── emissive.png     # Linh khí xanh lam phát quang
└── armor_dong_son/
    ├── albedo.png       # Giáp vảy cá & Họa tiết Chim Lạc
    └── normal.png       # Khắc nổi mặt trời Đông Sơn
```

---

## 2. ⚡ Hệ Thống Bản Đồ Texture PBR (Physically Based Rendering Maps)

| Loại Map | Tên Tệp Chuẩn | Vai Trò & Tối Ưu Trong Three.js / React Three Fiber |
| :--- | :--- | :--- |
| **Base Color / Albedo** | `albedo.png` | Màu sắc gốc + Hoa văn văn hóa Việt Nam (Mặt trời Đông Sơn, rồng thời Trần/Lê). |
| **Normal Map** | `normal.png` | Giả lập rãnh hoa văn đúc nổi trên giáp đồng/lưỡi kiếm mà không làm tăng số Polygons. |
| **Roughness Map** | `roughness.png` | Quy định độ bóng (`0.1` = Sáng bóng như thép trui; `0.6` = Nhám cổ kính rêu phong). |
| **Metallic Map** | `metallic.png` | Quy định vùng kim loại (`1.0` = Vàng / Đồng thau mạ kim; `0.0` = Vải lụa chiến bào). |
| **Emissive Map** | `emissive.png` | Bản đồ tự phát sáng dùng cho các Thần Khí UR (Hào quang vàng kim, linh khí sấm sét). |

---

## 3. 📐 Kích Thước & Chuẩn Định Dạng (Resolution & File Format)

- **Độ phân giải:**
  - Trang bị cấp SR / SSR: `1024 x 1024 px` (Tối ưu tốc độ tải web).
  - Thần khí cấp UR Hoàng Gia: `2048 x 2048 px`.
- **Tỉ lệ UV Mapping:** Square 1:1 UV Atlas Unwrapped.
- **Định dạng nén:** `.png` (24-bit / 32-bit có Alpha) hoặc `.ktx2` (Basis Universal nén thẳng vào VRAM GPU).

---

## 4. 🏛️ Quy Chuẩn Thẩm Mỹ Hoa Văn Theo Niên Đại Lịch Sử Việt Nam

### 🌟 **A. Văn Hóa Đông Sơn (Thần Khí Nỏ Thần, Trống Đồng, Giáp Hai Bà Trưng / Bà Triệu):**
- **Tone màu:** Đồng xanh rêu (Patina bronze), Đồng thau ngả vàng ố cổ kính.
- **Họa tiết:** Chim Lạc sải cánh, Mặt Trời Đông Sơn 14 cánh starburst, hoa văn hình răng cưa và sóng nước.

### 👑 **B. Triều Trần & Triều Lê Sơ (Thuận Thiên Kiếm, Giáp Hưng Đạo Vương, Bình Định Vương):**
- **Tone màu:** Vàng Kim Hoàng Gia (#f1c40f), Thép xám tôi luyện (#475569), Nẹp đồng viền đỏ thắm.
- **Họa tiết:** Rồng cuộn thời Lê, Vân mây bão biển thời Trần, Chữ Nho mạ vàng đúc chìm dọc sống kiếm.

### 🔥 **C. Triều Tây Sơn (Bắc Bình Vương Quang Trung):**
- **Tone màu:** Đỏ thắm chiến bào Tây Sơn (#e74c3c), Mão đính ngọc hồng xiêm, Giáp ngực đúc Hổ sương ma.
- **Họa tiết:** Ngọn lửa thần tốc, mây sấm sét nổ tung.

---

## 💻 5. Đoạn Mã Mẫu Nạp Texture Vào Three.js / React Three Fiber

```tsx
import { useTexture } from '@react-three/drei'

export function ThuanThienSwordMesh() {
  // Nạp bộ Texture PBR chuẩn
  const [albedoMap, normalMap, emissiveMap] = useTexture([
    '/assets/textures/equipment/sword_thuan_thien/albedo.png',
    '/assets/textures/equipment/sword_thuan_thien/normal.png',
    '/assets/textures/equipment/sword_thuan_thien/emissive.png'
  ])

  return (
    <mesh>
      <boxGeometry args={[0.1, 1.2, 0.05]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        emissiveMap={emissiveMap}
        emissive="#f1c40f"
        emissiveIntensity={0.8}
        metalness={0.95}
        roughness={0.15}
      />
    </mesh>
  )
}
```
