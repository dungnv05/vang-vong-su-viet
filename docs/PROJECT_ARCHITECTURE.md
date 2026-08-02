# Tài Liệu Dự Án: Vang Vọng Sử Việt (Vietnam Heroes Auto-Battler)

Đây là tài liệu chi tiết mô tả kiến trúc kỹ thuật và cơ chế cốt lõi của dự án "Vang Vọng Sử Việt" - một tựa game chiến thuật thẻ tướng (Auto-Battler) phong cách 3D trên nền web, tôn vinh các vị anh hùng lịch sử Việt Nam. Tài liệu này được thiết kế để giúp các AI Model hoặc Lập trình viên mới nhanh chóng nắm bắt và tiếp tục phát triển dự án.

## 1. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend Framework:** React.js (Vite)
- **State Management:** Zustand (`src/store/gameStore.ts`)
- **Đồ họa 3D (WebGL):** Three.js thông qua `@react-three/fiber` và `@react-three/drei`
- **Styling:** CSS cơ bản và Inline Styles (không dùng Tailwind)
- **UI Overlay:** React (DOM HTML chồng lên Canvas 3D)

## 2. Kiến Trúc Cấu Trúc Thư Mục
Dự án chia làm 2 lớp chính: **Lớp Giao Diện (UI 2D)** và **Lớp Chiến Trường (3D Canvas)**.

- `src/components/3d/` - Chứa toàn bộ các Component 3D render trên Canvas.
  - `Arena.tsx`: Sàn đấu chính, định hình ánh sáng, lưới tọa độ, và render mảng `heroes` & `enemies`.
  - `Hero3D.tsx`: Component vẽ mô hình 3D cho mỗi tướng. Tích hợp thanh máu, thanh nộ, và load model (GLTF) hoặc Toon Shading (Cel-shading) thủ công.
  - `Beast3D.tsx`: Vẽ linh thú (ví dụ: Rùa Vàng Kim Quy).
  - `ComboVFX.tsx`: Hiệu ứng kỹ năng, text damage nổi lên khi đánh.
  - `ParallaxHero.tsx`: Kỹ thuật 2.5D cho thẻ bài.
- `src/components/ui/` - Lớp giao diện HTML nổi bên trên Canvas 3D (HUD, Gacha, Hero Selection, Modal).
- `src/store/gameStore.ts` - **"Trái tim"** của game. Chứa toàn bộ dữ liệu trận đấu, cơ chế tính toán sát thương, và quản lý lượt (Turn Engine).
- `src/data/` - Chứa dữ liệu cứng (Mock Data).
  - `heroes.ts`: Chỉ số của tất cả các tướng (HP, ATK, Role, Skill, ...).
  - `beasts.ts`: Dữ liệu Linh Thú hộ quốc.
- `public/models/manifest.json` - File cấu hình mapping id tướng (`h1`, `h2`...) với đường dẫn file 3D (`.glb`) và hệ số scale/xoay.

## 3. Cơ Chế Đồ Họa 3D (Hero Rendering)
Mỗi Tướng (`Hero3D`) được render dựa trên nguyên tắc Fallback:
1. Đầu tiên, đọc `manifest.json`. Nếu tướng có thuộc tính `modelUrl`, hệ thống sẽ load mô hình `.glb` đó (sử dụng `<Clone>` từ `@react-three/drei` để clone an toàn SkinnedMesh).
2. Nếu tướng KHÔNG có `modelUrl`, hệ thống sẽ tự động vẽ một **Procedural Humanoid** (người nộm cơ bản) bằng các khối hình học của Three.js (CylinderGeometry, SphereGeometry) kết hợp với Shader tạo viền đen (Cel-Shading/Toon Shading) mang phong cách Anime.
3. Camera được khóa cố định (`OrbitControls` với `enableRotate=false, enableZoom=false, enablePan=false`) ở một góc nhìn Isometric chéo từ trên xuống (tọa độ mặc định `[3, 12, 12]`) để tạo góc nhìn chuẩn cho game thẻ bài.

## 4. Hệ Thống Combat Engine (`gameStore.ts`)
Đây là một hệ thống **Auto-Battler Lai (Hybrid Turn-based & Interrupt-driven)**.

### a. Vòng Lặp Lượt Cơ Bản (Turn-Based)
Hàm `executeTurn` chạy một vòng lặp từ `Slot 0 -> Slot 5`. 
- Game sẽ tính tổng Lực Chiến (Combat Power = HP + ATK) để quyết định Phe Người Chơi (Player) hay Phe Địch (Enemy) được đi trước trong Slot đó.
- Hàm `executeAttack(isPlayerAttacking, attacker, forceUltimate)` xử lý logic tấn công. Ưu tiên mục tiêu ở hàng trước, hoặc ở cùng cột (Column).

### b. Cơ Chế Kỹ Năng Nộ (Auto-Ultimate Interrupt)
Đây là cơ chế quan trọng giúp game mang tính chất Real-time:
- Thanh Nộ (Rage) tích lũy qua việc đánh thường (+40 cho Hỗ trợ/Tank, +60 cho DPS), bị đánh (+15, Tank +30), hoặc hạ gục (+50).
- Hệ thống có một vòng lặp ngầm `checkAndExecuteUltimates()` được gọi liên tục sau BẤT KỲ đòn đánh nào.
- Nếu quét thấy bất kỳ tướng nào có **Nộ >= 100**, hàm này sẽ ngắt (interrupt) vòng lặp Slot thông thường, ép tướng đó thi triển Tuyệt Kỹ ngay lập tức.
- **Quy tắc giải quyết xung đột khi nhiều tướng cùng đầy Nộ:**
  1. Ai có **Lượng Nộ cao hơn** sẽ ra chiêu trước (ví dụ: 115 > 100).
  2. Bằng Nộ -> **Phe Người Chơi (Player)** ra chiêu trước.
  3. Cùng phe -> Tướng đứng ở **Vị trí nhỏ hơn (Hàng trước)** ra chiêu trước.
- Cơ chế này cho phép xuất hiện các **Chain-Ultimates** (Chuỗi liên hoàn chiêu): Tướng A tung chiêu trúng Tướng B -> Tướng B đầy Nộ -> Tướng B lập tức tung chiêu phản công.

### c. Các Vai Trò (Roles) Đặc Thù
- **Tank:** Tỉ lệ 30% phản đòn (Counter-attack) sát thương cơ bản khi bị đánh thường. Nhận thêm Nộ khi bị đánh.
- **Support:** Có nội tại buff Nộ cho toàn đội ở Turn 1. Khi hạ gục địch (Kích sát), hồi Nộ cho đồng minh. Hỗ trợ còn có tỉ lệ 50% tung đòn **Hợp Kích (Synergy Assist)** đánh hôi thêm mục tiêu khi đồng đội tung Ultimate.
- **Assassin:** Khởi đầu trận được buff một lượng lớn Nộ (60 Nộ) để rình rập thi triển kỹ năng sớm. Hồi 50 Nộ khi kích sát.
- **DPS:** Lượng Nộ hồi khi đánh thường cao, tập trung vào sát thương kỹ năng bạo phát.

## 5. Quy Trình Để Mở Rộng Game
- **Thêm Tướng Mới:** Khai báo Object mới trong `MOCK_HEROES` (`src/data/heroes.ts`). Định nghĩa `role`, `skill`, `maxHp`, `atk`.
- **Thêm Model 3D Cho Tướng:** Bỏ file `.glb` vào `public/models/`, sau đó khai báo ID tướng vào file `public/models/manifest.json` (nhớ điều chỉnh `scale` vì Blender hay xuất file kích thước khác nhau).
- **Thêm Hiệu Ứng Nổ/VFX:** Viết thêm particle system trong `ComboVFX.tsx` và dispatch event qua state (ví dụ `comboBanner`).

## 6. Lịch Sử Các Bản Vá Quan Trọng (Dành cho AI sau)
- Đã vá lỗi **SkinnedMesh Tàng Hình**: Khi dùng chung 1 file `.glb` cho nhiều nhân vật, các nhân vật sau bị mất xương/tàng hình. Đã dùng component `<Clone>` của `@react-three/drei` thay cho `<primitive object={scene.clone()}>` để khắc phục vĩnh viễn.
- Đã xử lý lỗi **Tướng tàng hình dồn cục ở giữa bàn cờ**: Đã thêm filter `hero.slotIndex !== -1 || hero.id === draggingHeroId` vào `Arena.tsx` để không render tướng nằm trong kho lên sân, ngoại trừ lúc đang Kéo-Thả (Drag & Drop).
- Khóa góc xoay Camera vĩnh viễn (`enableRotate=false`) ở tọa độ `[3, 12, 12]` để cố định góc nhìn Isometric chiến thuật chuẩn xác.
