# PLAN: Vang Vọng Sử Việt (Web Game 3D Idle Gacha)

Dự án Web Game 3D Idle Gacha thẻ bài đề tài lịch sử Việt Nam, được thiết kế tối ưu cho phương pháp **Vibe Coding** (Lập trình cùng AI).

---

## 1. Tầm Nhìn Sản Phẩm & Định Hướng Đồ Họa

- **Nền tảng:** Web Game (Chạy trực tiếp trên trình duyệt PC & Mobile).
- **Tech Stack:** React + Vite + TypeScript + React Three Fiber (R3F) + Three.js + Zustand.
- **Góc nhìn & Đồ họa:** 
  - 3D Isometric (góc nhìn chéo từ trên xuống).
  - Tối ưu bằng hiệu ứng ánh sáng (Shaders/WebGL), hiệu ứng hạt (Particle VFX), và camera động thay vì dựng animation 3D thủ công phức tạp.
- **Phong cách Nghệ thuật:** Lịch sử chân thực kết hợp yếu tố huyền huyễn (Hào quang, linh khí, hiệu ứng kịch tính).
- **Lối chơi cốt lõi:** 
  - Đội hình 6v6 theo lượt.
  - Cơ chế **Hợp Kích (Combo Skill)** giữa các danh nhân có liên kết lịch sử (VD: Lê Lợi - Nguyễn Trãi, Hai Bà Trưng).
  - Gacha tập trung vào Tướng. Trang bị, Linh vật/Thú cưỡi cày cuốc hoàn toàn từ Phó bản & World Boss.

---

## 2. Cấu Trúc Dự Án (Architecture)

```text
src/
├── assets/            # 3D Models, Textures, Audio, Images
├── components/
│   ├── 3d/            # Các R3F Component (Arena, Hero3D, Effects)
│   └── ui/            # Giao diện 2D HTML/CSS (HUD, Gacha, Squad)
├── data/              # Dữ liệu tĩnh JSON/TS (Tướng, Kỹ năng, Hợp Kích)
├── store/             # Zustand Game State (Combat, User Progress)
├── utils/             # Helper functions & Combat calculators
├── App.tsx            # Main canvas & layout entry
└── index.css          # Global CSS & reset
```

---

## 3. Lộ Trình Phát Triển (Vibe Coding Roadmap)

### Phase 1: Prototype & Core Mechanics (Đã Khởi Tạo)
- [x] Khởi tạo repo React + Three.js + Zustand.
- [x] Thiết lập Canvas 3D, sàn đấu (Arena) và ánh sáng cơ bản.
- [x] Dữ liệu Tướng mẫu (`heroes.ts`) và Component hiển thị 3D (`Hero3D.tsx`).
- [x] HUD 2D cơ bản và logic chuyển lượt (`gameStore.ts`).
- [ ] **Next Step:** Viết logic chiến đấu tự động (Auto-battle Queue) & Tính sát thương.
- [ ] **Next Step:** Thêm hiệu ứng VFX khi bấm chiêu/Hợp Kích (Camera Zoom + Particle Burst).

- [x] Màn hình Gacha Chiêu Mộ Tướng (Quay thẻ x1 / x10 với Bể Tướng UR, SSR, SR).
- [x] Hệ thống Bể Tướng Gacha (Trần Hưng Đạo, Quang Trung, Ngô Quyền, Hai Bà Trưng, Lý Thường Kiệt, Phạm Ngũ Lão, Yết Kiêu).
- [x] Màn hình Quản lý Đội hình Xuất Trận & Dự Bị (`SquadModal.tsx`): Cho phép chọn 6 tướng chính xuất trận, tháo xuất hoặc tráo đổi vị trí.
- [x] Kiểm tra Kích hoạt Duyên Phận / Hợp Kích trong Đội Hình.
- [x] Hệ thống Phó bản & Tiến trình Màn chơi Chiến dịch (Ải 1: Chi Lăng, Ải 2: Hát Môn, Ải 3: Bạch Đằng, Ải 4: Ngọc Hồi - Đống Đa).
- [x] Màn hình Chọn Ải (Stage Map Selector) & Màn hình Đại Thắng (Victory Screen) khi tiêu diệt hết kẻ địch.
- [x] Hệ thống Thần Khí & Trang Bị Lịch Sử (Thuận Thiên Kiếm, Nỏ Thần An Dương Vương, Trống Đồng Đông Sơn, Giáp Vân Mây).
- [x] Hệ thống Tiền Vàng (Gold Currency) & Nhận thưởng sau mỗi lượt đánh.

- [x] Hệ thống Linh Vật & Thú Cưỡi Lịch Sử (Rùa Vàng Kim Quy, Ngựa Sắt Thánh Gióng, Voi Chiến 9 Ngà).
- [x] Component Linh Vật 3D (`Beast3D.tsx`) hiển thị bên cạnh bàn cờ với hào quang linh khí & Aura Buff toàn đội.
- [x] Thêm hệ thống hiệu ứng âm thanh Web Audio API (`audioEngine.ts`) cho Hợp Kích (Trống trận + Tiếng Sét), Quay Gacha, Mặc Thần Khí và Đại Thắng!
- [x] Nút Bật/Tắt Âm thanh (Audio Mute Toggle) ở thanh công cụ HUD.
- [x] Chế độ Tháp Cổ Việt Nam 100 Tầng Thử Thách Vô Tận (`towerData.ts` & `TowerModal.tsx`).
- [x] Tốc Độ Trận Đấu (1x ➔ 2x ➔ 3x) điều chỉnh thời lượng Cutscene linh hoạt.
- [x] Chế độ Tự Động Chiến Đấu (Auto-Battle: Bật/Tắt) tự động xuất chiêu liên tục khi đến lượt.
- [x] Giao Diện Sảnh Chính Hoàng Gia 3D (Main City Lobby `MainLobby.tsx`) tôn vinh Đội Hình Xuất Trận, Tổng Lực Chiến & Linh Vật Hộ Quốc.
- [x] Tinh gọn giao diện màn hình Khai Chiến (Ẩn các nút rườm rà Chiêu Mộ, Vàng, Tháp Cổ để tập trung góc nhìn 3D).
- [x] Bể tướng phía dưới hiển thị TẤT CẢ các tướng sở hữu (Đang đánh & Dự bị) với nút Xuất/Tháo nhanh cực kỳ tiện lợi.
- [x] Sắp xếp cụm nút Tốc độ (1x/2x/3x) & Auto nằm DỌC PHÍA TRÊN nút Kết Thúc Lượt, dành 85% không gian cho Bể Tướng.
- [x] Chế độ Phó Bản Trùm Thế Giới (World Boss Raid - Hắc Long Ma Tướng `WorldBossModal.tsx`): 10 lượt tính tổng sát thương gây ra và trao rương quà Vàng & Bảo Vật Hoàng Gia.
- [x] Bách Khoa Toàn Thư Lịch Sử Việt Nam (Vietnamese History Codex & Hero Lore `CodexModal.tsx` & `codexData.ts`): Tra cứu tiểu sử hào hùng, trận đánh hiển hách, trích dẫn kiệt tác và di sản tôn vinh của các Anh Hùng Dân Tộc.
- [x] Chế Độ Đấu Trường PvP Giả Lập (`pvpData.ts` & `PvPModal.tsx`): Thách đấu đội hình phòng thủ 6 tướng 3D của các Cao Thủ toàn server, nhận Điểm Hạng & Vàng.
- [x] Giai Đoạn 3 - Content Scaling: Mở rộng bể tướng Chiêu Mộ Gacha lên 15+ Danh Nhân Lịch Sử (Bà Triệu, Trần Quốc Toản, Đinh Tiên Hoàng, Lê Hoàn...).
- [x] Giai Đoạn 3 - Hệ Thống Quan Lại & Cấp Bậc Triều Đình (`rankData.ts` & `ImperialRankModal.tsx`): Thăng Quan Tiến Chức (Thái Sư, Đại Tướng Quân) buff % chỉ số toàn đội & nhận lương Vàng hàng ngày.
- [x] Giai Đoạn 3 - Hệ Thống Khai Thông Kinh Mạch & Linh Khí (`meridiansData.ts` & `MeridiansModal.tsx`): Bứt phá 4 đường Kinh Mạch (Nhâm, Đốc, Xung, Đái Mạch) cho từng Tướng tăng Bạo Kích & Sinh Lực.
- [x] Giai Đoạn 2 - Vertical Slice Core Loop (`VictoryModal.tsx` & `GachaModal.tsx`): Vòng lặp chuẩn Gacha ra Tướng ➔ Lắp Đội Hình 6v6 3D ➔ Vượt Ải Đánh Quái ➔ **Rớt Mảnh Trang Bị & Thần Khí Lịch Sử**.
- [x] Giai Đoạn 2 - Prompt AI & Asset Pipeline (`AI_PROMPTS_AND_MODELS.md`): Bộ Prompt AI sinh ảnh 2D Avatar Tướng & texture 3D trang phục Việt Nam (Giao Lĩnh, Băng Phong, Trống Đồng).
- [x] Giai Đoạn 2 - Tích hợp 4 Ảnh 2D Avatar Tướng Sắc Nét (`src/assets/heroes/`): Tích hợp trực tiếp 4 ảnh kiệt tác (`tran_hung_dao.png`, `quang_trung.png`, `hai_ba_trung.png`, `ba_trieu.png`) lên tất cả các khung thẻ tướng Sảnh Chính, Thẻ Bể Tướng & Gacha!

---

## 4. Hướng Dẫn Vibe Coding Cho AI

Khi sử dụng các công cụ AI để code tiếp dự án này, bạn có thể prompt theo các mẫu sau:

- **Khi muốn làm combat:** *"Dựa vào `src/store/gameStore.ts` và `src/data/heroes.ts`, hãy viết logic để khi bấm 'Kết Thúc Lượt', tướng ở vị trí 1 sẽ di chuyển lên phía trước và phát ra đòn đánh gây sát thương cho kẻ địch."*
- **Khi muốn làm VFX Hợp Kích:** *"Hãy tạo một component `ComboVFX.tsx` sử dụng `@react-three/drei` (như Sparkles hoặc Fire) để tạo hiệu ứng tia sáng khi 2 tướng tung chiêu Hợp Kích."*
