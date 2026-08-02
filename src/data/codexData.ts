import tranHungDaoBg from '../assets/heroes/backgrounds/tran_hung_dao.png'
import quangTrungBg from '../assets/heroes/backgrounds/quang_trung.png'
import haiBaTrungBg from '../assets/heroes/backgrounds/hai_ba_trung.png'

export interface CodexHeroData {
  id: string
  name: string
  title: string
  era: string
  periodYear: string
  quote: string
  famousBattles: string[]
  biography: string
  legacy: string
  color: string
  backgroundUrl?: string
}

export const CODEX_HEROES: CodexHeroData[] = [
  {
    id: 'codex_tran_hung_dao',
    name: 'Trần Hưng Đạo',
    title: 'Hưng Đạo Đại Vương • Đức Thánh Trần',
    era: 'Triều Trần',
    periodYear: 'Năm 1228 - 1300 AD',
    quote: 'Bệ hạ chém đầu tôi trước rồi hãy hàng!',
    famousBattles: ['Kháng Chiến Chống Nguyên Mông Lần 2 (1285)', 'Đại Thắng Sông Bạch Đằng 1288'],
    biography: 'Trần Hưng Đạo tên thật là Trần Quốc Tuấn, là Quốc Công Tiết Chế chỉ huy toàn bộ quân dân Đại Việt 3 lần đánh bại đế quốc Nguyên Mông hùng mạnh bậc nhất thế giới thời bấy giờ. Ông nổi tiếng với lòng trung trinh và nghệ thuật quân sự tài tình.',
    legacy: 'Tác giả "Hịch Tướng Sĩ" và "Binh Thư Yếu Lược". Tái hiện bãi cọc gỗ Bạch Đằng thần kỳ thiêu rụi toàn bộ hạm đội giặc Ô Mã Nhi.',
    color: '#9333ea',
    backgroundUrl: tranHungDaoBg
  },
  {
    id: 'codex_quang_trung',
    name: 'Quang Trung',
    title: 'Bắc Bình Vương • Anh Hùng Áo Vải Tây Sơn',
    era: 'Triều Tây Sơn',
    periodYear: 'Năm 1753 - 1792 AD',
    quote: 'Đánh cho lịch sử biết rằng nước Nam ta là có chủ!',
    famousBattles: ['Đại Thắng Rạch Gầm - Xoài Mút (1785)', 'Chiến Thắng Ngọc Hồi - Đống Đa (1789)'],
    biography: 'Nguyễn Huệ (vua Quang Trung) là thiên tài quân sự kiệt xuất của Việt Nam. Với lối đánh thần tốc, táo bạo và bất ngờ, ông đã quét sạch 29 vạn quân Mãn Thanh trong dịp Tết Kỷ Dậu 1789 chỉ trong 5 ngày đêm.',
    legacy: 'Giải phóng Thăng Long, bảo vệ toàn vẹn lãnh thổ Việt Nam trước giặc Mãn Thanh, xây dựng đất nước hưng thịnh.',
    color: '#e74c3c',
    backgroundUrl: quangTrungBg
  },
  {
    id: 'codex_hai_ba_trung',
    name: 'Hai Bà Trưng',
    title: 'Trưng Trắc & Trưng Nhị • Nữ Vương Đầu Tiên',
    era: 'Khởi Nghĩa Hát Môn',
    periodYear: 'Năm 40 AD',
    quote: 'Một xin rửa sạch nợ nước / Hai xin dựng lại nghiệp xưa họ Hùng!',
    famousBattles: ['Khởi Nghĩa Hát Môn (Năm 40 AD)', 'Đánh Đuổi Tô Định Thu Hồi 65 Thành Môn'],
    biography: 'Phẫn uất trước chính sách đồng hóa và sự tàn bạo của Thái thú Tô Định nhà Đông Hán, Hai Bà Trưng đã phất cờ khởi nghĩa tại sông Hát Môn. Cuộc khởi nghĩa nhanh chóng lan rộng, thu hồi 65 thành lũy.',
    legacy: 'Nữ vương đầu tiên trong lịch sử Việt Nam, thể hiện chí khí kiên cường bất khuất của người phụ nữ Việt.',
    color: '#ec4899',
    backgroundUrl: haiBaTrungBg
  },
  {
    id: 'codex_le_loi',
    name: 'Lê Lợi',
    title: 'Bình Định Vương • Thái Tổ Nhà Lê',
    era: 'Triều Lê Sơ',
    periodYear: 'Năm 1418 - 1427 AD',
    quote: 'Nương mình chốn hoang dại, dốc lòng vì nước; Nổi phất cờ nghĩa, quyết lòng diệt thù!',
    famousBattles: ['Khởi Nghĩa Lam Sơn (1418)', 'Trận Tốt Động - Chúc Động (1426)', 'Chiến Dịch Chi Lăng - Xương Giang (1427)'],
    biography: 'Lê Lợi sinh ra tại Lam Sơn, Thanh Hóa. Năm 1418, ông xưng là Bình Định Vương, dấy binh khởi nghĩa chống lại sự cai trị tàn bạo của nhà Minh. Dưới sự lãnh đạo tài tình của ông cùng quân sư Nguyễn Trãi, nghĩa quân Lam Sơn từ gian khổ đã lớn mạnh, đánh bại 15 vạn viện binh nhà Minh.',
    legacy: 'Khai sáng nhà Lê Sơ, phục hưng nền độc lập dân tộc sau 20 năm đô hộ. Lấy lại gươm báu Thuận Thiên trao trả cho Rùa Vàng Kim Quy tại hồ Tả Vọng (Hồ Hoàn Kiếm).',
    color: '#d4af37'
  },
  {
    id: 'codex_nguyen_trai',
    name: 'Nguyễn Trãi',
    title: 'Ức Trai Tiên Sinh • Danh Nhân Văn Hóa Thế Giới',
    era: 'Triều Lê Sơ',
    periodYear: 'Năm 1380 - 1442 AD',
    quote: 'Việc nhân nghĩa cốt ở yên dân / Quân điếu phạt trước lo trừ hại.',
    famousBattles: ['Chiến Lược Mưu Thuyết Lam Sơn', 'Bình Ngô Đại Cáo (1427)'],
    biography: 'Nguyễn Trãi là một nhà chính trị, nhà văn, nhà thơ lớn của dân tộc. Ông là mưu sĩ kiệt xuất của Lê Lợi trong Khởi Nghĩa Lam Sơn, dâng sách "Bình Minh Sách" đưa ra phương châm "Đánh vào lòng người" (Tâm công) để thu phục quân địch mà không tốn xương máu.',
    legacy: 'Tác giả kiệt tác "Bình Ngô Đại Cáo" - bản Tuyên ngôn Độc lập thứ hai của dân tộc Việt Nam. Được UNESCO công nhận là Danh nhân Văn hóa Thế giới năm 1980.',
    color: '#38bdf8'
  },
  {
    id: 'codex_ngo_quyen',
    name: 'Ngô Quyền',
    title: 'Tiền Ngô Vương • Tổ Trung Hưng Nước Việt',
    era: 'Thời Kỳ Tự Chủ',
    periodYear: 'Năm 898 - 944 AD',
    quote: 'Hoằng Tháo là một đứa trẻ dại, ta đóng cọc nhọn ở cửa sông, giặc tới nhất định bị diệt!',
    famousBattles: ['Đại Thắng Sông Bạch Đằng 938'],
    biography: 'Ngô Quyền là người vùng Đường Lâm (Hà Nội). Năm 938, ông nghĩ ra diệu kế cắm hàng ngàn cọc gỗ vát nhọn bọc sắt dưới lòng sông Bạch Đằng, lợi dụng thủy triều lên xuống để dụ hạm đội quân Nam Hán vào bẫy.',
    legacy: 'Chấm dứt hơn 1,000 năm Bắc thuộc đen tối, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc Việt Nam.',
    color: '#2ecc71'
  }
]
