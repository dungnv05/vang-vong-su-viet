# Tài Liệu Dự Án: Vang Vọng Sử Việt (Vietnam Heroes Auto-Battler)

Đây là tài liệu chi tiết mô tả kiến trúc kỹ thuật và cơ chế cốt lõi của dự án "Vang Vọng Sử Việt" - một tựa game chiến thuật thẻ tướng (Auto-Battler) phong cách **2D** trên nền web, tôn vinh các vị anh hùng lịch sử Việt Nam. Tài liệu này được thiết kế để giúp các AI Model hoặc Lập trình viên mới nhanh chóng nắm bắt và tiếp tục phát triển dự án.

## 1. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend Framework:** React.js (Vite, TypeScript)
- **State Management:** Zustand (`src/store/gameStore.ts`)
- **Đồ họa Chiến Trường:** DOM/CSS 2D thuần với CSS Animations & VFX (đã loại bỏ hoàn toàn các file render 3D WebGL cũ)
- **Icons & Styling:** `lucide-react`, CSS cơ bản và Inline Styles (không phụ thuộc Tailwind)
- **UI Overlay:** Hỗ trợ Modal linh hoạt (Gacha, Codex, PvP, World Boss, Kinh Mạch, Tháp Cổ, Treo Máy / Idle Rewards)

## 2. Kiến Trúc Cấu Trúc Thư Mục
Dự án chia làm 2 lớp chính: **Lớp Chiến Trường 2D (Arena)** và **Lớp Giao Diện Meta-Game (HUD/Modal)**.

```
App.tsx
├── Arena2D          ← Nền chiến trường + Standee tướng 2D + VFX trận đấu
└── HUD              ← Sảnh chính, Thanh trạng thái, Nút chuyển màn hình & Hệ thống Modal
```

- `src/components/2d/` - Đồ họa và hiệu ứng chiến trường 2D:
  - `Arena2D.tsx`: Nền chiến trường, lọc tướng đang ra sân (`slotIndex !== -1`), render mảng `heroes` & `enemies`, tích hợp `ComboVFX2D`.
  - `Hero2D.tsx`: Standee avatar + thanh HP/Nộ + cấp sao/vai trò. Tự động tính vị trí với `get2DSlotPosition()`, lướt tới khi `activeAttackerId` kích hoạt, hiệu ứng rung khi chịu đòn (Hit-shake), hào quang khi đầy Nộ.
  - `ComboVFX2D.tsx`: Banner Tuyệt kỹ / Hợp kỹ (`comboBanner`), hiệu ứng chém/sét/lửa theo ngũ hành và chỉ số floating damage (`actionText`).
- `src/components/ui/` - HUD và các Modal tính năng:
  - `MainLobby.tsx`: Sảnh chính Hoàng Gia với đầy đủ lối vào các tính năng.
  - `HeroModal.tsx` & `MeridiansModal.tsx`: Quản lý tướng, nâng cấp, tăng sao, trang bị & khai mở 8 Mạch Linh Khí (Kinh Mạch).
  - `IdleModal.tsx`: Màn hình nhận thưởng Treo Máy tự động (Offline/Idle Rewards) theo thời gian.
  - `SquadModal.tsx`: Xếp đội hình 6 vị trí.
  - `StageModal.tsx`, `TowerModal.tsx`, `PvPModal.tsx`, `WorldBossModal.tsx`: Các chế độ chơi đa dạng.
  - `GachaModal.tsx`, `BeastModal.tsx`, `CodexModal.tsx`, `ImperialRankModal.tsx`, `CloudSaveModal.tsx`: Hệ thống Chiêu mộ, Linh Thú, Sổ Tay, Bảng Xếp Hạng & Lưu Trữ Đám Mây.
- `src/store/gameStore.ts` - **"Trái tim"** của game: Chứa state toàn cục, logic Combat Engine 2D, hệ thống tính toán sát thương, tích nộ, phản công, hồi máu, lưu/tải dữ liệu game.
- `src/data/` - Dữ liệu game:
  - `heroes.ts`: Danh sách tướng, chỉ số, vai trò (Tank, DPS, Support, Assassin), kỹ năng, cặp hợp kỹ `synergy`, hàm `get2DSlotPosition()`.
  - `items.ts`, `beasts.ts`, `codexData.ts`, `stages.ts`, `gachaPool.ts`: Dữ liệu trang bị, linh thú, sổ tay, danh sách ải campaign và gacha pool.

## 3. Cơ Chế Đồ Họa 2D (Hero Rendering)
Mỗi tướng trên sân là một thẻ standee DOM linh hoạt (`Hero2D`):

1. **Hiển Thị Standee:** Sử dụng `data.avatarUrl`, fallback `src/assets/hero.png`. Phe Địch (Enemy) được quay mặt bằng `scaleX(-1)`.
2. **Vị trí lưới 2D** (`get2DSlotPosition(isEnemy, slotIndex)` trong `heroes.ts`):
   - 6 ô / phe: Hàng trước (`slot 0–2`), Hàng sau (`slot 3–5`).
   - Phe Ta (Player): `left` ~ `30%` (hàng trước) / `15%` (hàng sau); Phe Địch: `70%` / `85%`.
   - `top`: `30%` / `50%` / `70%` theo dòng; `zIndex` tự động sắp xếp theo hàng.
3. **Chuyển Động Tấn Công:** Khi `activeAttackerId === data.id`, standee lướt tới `±20%` về hướng đối phương qua CSS smooth transition.
4. **Trạng Thái Trận Đấu:** Grayscale mờ khi HP = 0; rung lắc và đỏ flash khi nhận sát thương; hào quang rực rỡ khi đầy Nộ (`rage >= maxRage`).

## 4. Hệ Thống Combat Engine (`gameStore.ts`)
Hệ thống **Auto-Battler Lai (Hybrid Turn-based & Interrupt-driven)**:

### a. Vòng Lặp Lượt Cơ Bản (Turn-Based)
Hàm `executeTurn` chạy khi `currentScreen === 'BATTLE'` và `!isAnimating`.
- Lặp từ Slot `0 -> 5`. So sánh Lực Chiến / Tốc độ giữa Player & Enemy để xác định lượt đánh trước.
- Ưu tiên chọn mục tiêu: Đánh hàng trước (`slot 0-2`) trước, khi hàng trước gục mới đánh hàng sau (`slot 3-5`). Ưu tiên cột gần nhất.
- Guard condition: Tự động dừng combat nếu người chơi thoát màn hình chiến đấu giữa chừng.

### b. Cơ Chế Kỹ Năng Nộ (Auto-Ultimate Interrupt)
- Tích Nộ: Đánh thường (+40 Support/Tank, +60 DPS/Assassin), bị đánh (+15, Tank +30), hoặc hạ gục kẻ địch (+50). Assassin được buff sẵn Nộ đầu trận.
- Khi một tướng đạt `rage >= 100`, hệ thống tạm dừng đòn đánh thường để kích hoạt **Tuyệt Kỹ (Ultimate)**.
- **Thượng Thừa Nộ (Excess Rage):** Điểm Nộ vượt mức 100 sẽ quy đổi thành sát thương bonus (+1% sát thương mỗi 1 điểm nộ dư).

### c. Hệ Thống Hợp Kỹ (Specific Synergy)
Mỗi tướng có thể sở hữu cặp `synergy: { partnerId, skillName }`.
- Khi kích hoạt Ultimate, nếu đồng đội hợp kỹ còn sống trên sân (`slotIndex !== -1`), hệ thống sẽ phát động chuỗi combo 2 bước: Tuyệt kỹ cá nhân → **[HỢP KỸ]** đồng đội lướt lên bồi đòn đánh phối hợp mạnh mẽ (`atk * 1.5 - 2.2`).

Cặp synergy hiện có:
- **Trần Hưng Đạo** ↔ **Quang Trung**: *Hào Khí Đại Việt*
- **Bà Triệu** ↔ **Hai Bà Trưng**: *Nữ Tướng Uy Phong*
- **Nguyễn Trãi** ↔ **Lê Lợi**: *Bình Ngô Đại Cáo*

### d. Cơ Chế Vai Trò (Roles & Battle Tactics)
- **Tank:** 35% khả năng Phản Kích (Counter-attack) khi bị đánh thường; nhận nhiều Nộ khi chịu đòn.
- **Support:** Đánh thường hồi máu cho đồng đội có % HP thấp nhất; buff Nộ toàn đội ở Turn 1.
- **Assassin:** Tự động hồi +50 Nộ khi đoạt mệnh (hạ gục) kẻ địch.
- **DPS:** Tốc độ tích Nộ cao, khả năng bạo kích (Critical Hit x1.75 Sát Thương) vượt trội.

### e. Hệ Thống Treo Máy (Idle Rewards)
- Game tự động tính toán tài nguyên tích lũy (Vàng, Kinh Nghiệm, Đá Kính Mạch, Mảnh Chiêu Mộ) theo thời gian thực dựa trên Ải Campaign cao nhất đã vượt qua. người chơi có thể mở `IdleModal` để nhận thưởng bất kỳ lúc nào.

## 5. Quy Trình Để Mở Rộng Game
- **Thêm Tướng Mới:** Khai báo Object trong `MOCK_HEROES` (`src/data/heroes.ts`) bao gồm `role`, `skill`, `maxHp`, `atk`, `avatarUrl`, `backgroundUrl` và `synergy`.
- **Thêm Hợp Kỹ Mới:** Thiết lập `synergy: { partnerId, skillName }` cho cả 2 tướng tương ứng trong `heroes.ts`.
- **Thêm Chế Độ / Modal Mới:** Tạo component trong `src/components/ui/`, đăng ký state điều khiển trong `gameStore.ts` và gắn vào `HUD.tsx` / `MainLobby.tsx`.

## 6. Lịch Sử Chuyển Đổi & Tối Ưu Lớn
- **Hoàn tất chuyển đổi 3D → 2D thuần:** Xóa bỏ toàn bộ các file 3D legacy (`Arena.tsx`, `Hero3D.tsx`, `Beast3D.tsx`, `ComboVFX.tsx`, `ParallaxHero.tsx`), giúp giảm đáng kể dung lượng build và tối ưu hóa hiệu năng 60 FPS trên mọi thiết bị di động & desktop.
- **Fix triệt để lỗi TypeScript:** Toàn bộ dự án đạt chuẩn strict mode, lệnh `npm run build` thực thi hoàn hảo và sinh bundle tối ưu.
- **Hệ thống Combat 2D hoàn chỉnh:** Tích hợp đầy đủ Hợp kích, Phản đòn, Support hồi máu, Thượng thừa nộ, Chuỗi nộ dồn dập (Chain Ultimates) và Treo máy tự động nhận thưởng.

