# Tài Liệu Dự Án: Vang Vọng Sử Việt (Vietnam Heroes Auto-Battler)

Đây là tài liệu chi tiết mô tả kiến trúc kỹ thuật và cơ chế cốt lõi của dự án "Vang Vọng Sử Việt" - một tựa game chiến thuật thẻ tướng (Auto-Battler) phong cách **2D** trên nền web, tôn vinh các vị anh hùng lịch sử Việt Nam. Tài liệu này được thiết kế để giúp các AI Model hoặc Lập trình viên mới nhanh chóng nắm bắt và tiếp tục phát triển dự án.

## 1. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend Framework:** React.js (Vite)
- **State Management:** Zustand (`src/store/gameStore.ts`)
- **Đồ họa Chiến Trường:** DOM/CSS 2D thuần (không còn Canvas WebGL trên màn hình chính)
- **Styling:** CSS cơ bản và Inline Styles (không dùng Tailwind)
- **UI Overlay:** React DOM chồng lên lớp chiến trường 2D
- **Ghi chú legacy:** `package.json` vẫn còn `@react-three/fiber`, `@react-three/drei`, `three` và thư mục `public/models/` (GLB + `manifest.json`) từ giai đoạn 3D cũ — hiện **không** được `App.tsx` sử dụng. Có thể gỡ khi dọn dependency.

## 2. Kiến Trúc Cấu Trúc Thư Mục
Dự án chia làm 2 lớp chính: **Lớp Chiến Trường (2D Arena)** và **Lớp Giao Diện (HUD/Modal)**.

```
App.tsx
├── Arena2D          ← nền + tướng + VFX trận
└── HUD              ← lobby, nút chiến đấu, modal meta-game
```

- `src/components/2d/` - Chiến trường 2D.
  - `Arena2D.tsx`: Nền gradient, lọc tướng đang ra sân (`slotIndex !== -1`), render mảng `heroes` & `enemies`, gắn `ComboVFX2D`.
  - `Hero2D.tsx`: Standee avatar + thanh máu/nộ. Lấy vị trí từ `get2DSlotPosition()`, lướt tới khi `activeAttackerId` khớp, hit-shake khi HP giảm, aura khi đầy nộ.
  - `ComboVFX2D.tsx`: Banner tuyệt kỹ / hợp kỹ (`comboBanner`), slash overlay, `actionText` float-up. Chỉ hiện khi `currentScreen === 'BATTLE'`.
- `src/components/ui/` - HUD và các modal (Gacha, Codex, Tower, PvP, World Boss, Squad, Hero, …).
- `src/store/gameStore.ts` - **"Trái tim"** của game: dữ liệu trận, combat engine, auto-battle, meta progression.
- `src/data/` - Dữ liệu cứng.
  - `heroes.ts`: Chỉ số tướng, `synergy` cặp đôi, `get2DSlotPosition()`, avatar/background imports.
  - `beasts.ts`, `gachaPool.ts`, …: Linh thú, pool gacha, v.v.
- `src/assets/heroes/` - Ảnh avatar / background dùng cho standee 2D và modal.
- `public/models/` - **Legacy 3D** (`.glb` + `manifest.json`); không còn pipeline render active.

## 3. Cơ Chế Đồ Họa 2D (Hero Rendering)
Mỗi tướng trên sân là một thẻ standee DOM (`Hero2D`):

1. **Ảnh:** `data.avatarUrl` nếu có, không thì fallback `src/assets/hero.png`. Enemy được `scaleX(-1)`.
2. **Vị trí lưới 2D** (`get2DSlotPosition(isEnemy, slotIndex)` trong `heroes.ts`):
   - 6 ô / phe: cột trước `slot 0–2`, cột sau `slot 3–5`.
   - Player: `left` ~ `30%` (trước) / `15%` (sau); Enemy: `70%` / `85%`.
   - `top`: `30%` / `50%` / `70%` theo cột; `zIndex` tăng theo cột.
3. **Tấn công:** Khi `activeAttackerId === data.id`, thẻ dịch `±20%` theo chiều đối thủ (CSS transition).
4. **Trạng thái:** grayscale khi `hp === 0`; hit flash/shake khi HP giảm; vòng sáng amber khi `rage >= maxRage`.
5. Banner / slash / action text nằm ở `ComboVFX2D` (không còn render trong `HUD`).

## 4. Hệ Thống Combat Engine (`gameStore.ts`)
Đây là một hệ thống **Auto-Battler Lai (Hybrid Turn-based & Interrupt-driven)**.

### a. Vòng Lặp Lượt Cơ Bản (Turn-Based)
Hàm `executeTurn` chạy khi `currentScreen === 'BATTLE'` và không đang `isAnimating`.
- Lặp Slot `0 -> 5`. Trong mỗi slot, so Lực Chiến (HP + ATK) để quyết định Player hay Enemy đi trước.
- `executeAttack(isPlayerAttacking, attacker, forceUltimate)` xử lý đòn đánh; ưu tiên mục tiêu hàng trước / cùng cột.
- Guard `currentScreen !== 'BATTLE'` trong `executeAttack` / `checkAndExecuteUltimates` để dừng combat nếu rời màn hình giữa trận.

### b. Cơ Chế Kỹ Năng Nộ (Auto-Ultimate Interrupt)
- Thanh Nộ tích qua đánh thường (+40 Support/Tank, +60 DPS), bị đánh (+15, Tank +30), hoặc hạ gục (+50).
- Sau mỗi đòn đánh gọi `checkAndExecuteUltimates()`: nếu có tướng `rage >= 100` thì interrupt và ép Ultimate.
- **Ưu tiên khi nhiều tướng đầy Nộ:**
  1. Nộ cao hơn trước.
  2. Hòa → Player trước.
  3. Cùng phe → `slotIndex` nhỏ hơn trước.
- Cho phép **Chain-Ultimates**. Có `sleep` ngắn giữa các ultimate liên tiếp để VFX đọc được.

### c. Hệ Thống Hợp Kỹ (Specific Synergy) — thay Assist ngẫu nhiên cũ
Trước đây: Support bất kỳ có 50% bồi đòn khi đồng đội Ultimate.  
Hiện tại: mỗi tướng có thể khai báo `synergy: { partnerId, skillName }` trong `HeroData`.

Khi Ultimate:
1. Banner tuyệt kỹ của tướng chính + lướt tấn công.
2. Nếu `partnerId` còn sống và đang ra sân (`slotIndex !== -1`): nghỉ ngắn → banner `[HỢP KỸ] {skillName}` → partner lướt bồi đòn (`atk * 1.5`).
3. Nếu mục tiêu chính đã gục, sát thương hợp kích chuyển sang mục tiêu sống gần nhất (sort theo `slotIndex`).

Cặp synergy hiện có:

| Tướng | Partner | Skill |
|-------|---------|-------|
| Trần Hưng Đạo (`h3`) ↔ Quang Trung (`h4`) | lẫn nhau | Hào Khí Đại Việt |
| Bà Triệu (`h6`) ↔ Hai Bà Trưng (`h5`) | lẫn nhau | Nữ Tướng Uy Phong |
| Nguyễn Trãi (`h2`) ↔ Lê Lợi (`h1`) | lẫn nhau | Bình Ngô Đại Cáo |

### d. Các Vai Trò (Roles)
- **Tank:** ~30% phản đòn khi bị đánh thường; nhận thêm Nộ khi bị đánh.
- **Support:** Buff Nộ toàn đội Turn 1; khi đồng đội kích sát hồi nhẹ Nộ cho Support.
- **Assassin:** Buff ~60 Nộ đầu trận; hồi 50 Nộ khi kích sát.
- **DPS:** Nộ đánh thường cao, kỹ năng bạo phát.

### e. Auto-Battle & UI Chiến Đấu
- Mặc định `isAutoBattle: true`. Khi bắt đầu Stage / Tower / World Boss / PvP cũng ép `isAutoBattle: true`.
- Nút HUD chính: **BẮT ĐẦU CHIẾN ĐẤU** — bật auto (nếu chưa) rồi gọi `executeTurn()`.
- Nhãn AUTO cố định hiển thị **TỰ ĐỘNG** (không còn toggle BẬT/TẮT trên HUD chính).
- Kết thúc lượt: nếu vẫn `isAutoBattle` và còn ở `BATTLE`, `setTimeout` gọi `executeTurn` tiếp theo theo `battleSpeed`.

## 5. Quy Trình Để Mở Rộng Game
- **Thêm Tướng Mới:** Object mới trong `MOCK_HEROES` (`src/data/heroes.ts`): `role`, `skill`, `maxHp`, `atk`, optional `avatarUrl` / `backgroundUrl` / `synergy`.
- **Thêm Avatar 2D:** Đặt PNG vào `src/assets/heroes/avatars/` (và backgrounds nếu cần), import và gán `avatarUrl`.
- **Thêm Hợp Kỹ:** Gán `synergy: { partnerId, skillName }` cho cả hai phía nếu muốn kích hoạt hai chiều.
- **Thêm VFX:** Mở rộng `ComboVFX2D.tsx` và/hoặc dispatch qua `comboBanner` / `actionText` / `activeAttackerId` từ store.
- **(Legacy) Model 3D:** Không còn path active. Nếu khôi phục 3D sau này mới dùng lại `public/models/manifest.json`.

## 6. Lịch Sử Các Bản Vá / Chuyển Đổi Quan Trọng (Dành cho AI sau)
- **Migrate 3D → 2D:** Gỡ `Canvas` / `Arena` / `Hero3D` / `Beast3D` / `ComboVFX` / `ParallaxHero`. `App` mount `Arena2D` + `HUD`.
- **VFX trận chuyển sang Arena:** Banner combo / action text không còn trong `HUD`; `ComboVFX2D` đảm nhiệm trên lớp chiến trường.
- **Hợp Kích deterministic:** Thay Support random 50% bằng cặp `synergy.partnerId` + timeline 2 bước (tuyệt kỹ → hợp kỹ).
- **Auto-battle mặc định:** Mọi mode vào trận bật auto; nút chính là "Bắt đầu chiến đấu".
- **Guard rời màn hình:** `executeTurn` / `executeAttack` / ultimate loop / auto-continue chỉ chạy khi vẫn ở `BATTLE`.
- **Legacy ghi nhớ (3D cũ, đã không còn code path):**
  - SkinnedMesh tàng hình khi clone GLB chung → từng dùng `<Clone>` từ drei.
  - Lọc `slotIndex !== -1` (trừ đang drag) để không render tướng kho lên sân — logic tương tự vẫn giữ trong `Arena2D`.
  - Camera isometric cố định `[3,12,12]` — không còn áp dụng.
