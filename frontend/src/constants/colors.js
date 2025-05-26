// src/constants/colors.js

// Bảng màu chính cho Dark Theme
// Phong cách: Thanh nhã, dịu mắt, tập trung vào trải nghiệm người dùng.
// Ưu tiên các màu có độ tương phản tốt để dễ đọc.

const COLORS = {
  // Nền (Backgrounds)
  BACKGROUND_PRIMARY: '#1A1D2E',    // Nền chính của ứng dụng (ví dụ: xanh navy/chàm rất tối, khử bão hòa)
  BACKGROUND_SECONDARY: '#242842', // Nền cho các bề mặt phụ, card, modal (sáng hơn một chút)
  SURFACE: '#242842',              // Tương tự BACKGROUND_SECONDARY, dùng cho các "bề mặt" nổi bật

  // Văn bản (Text)
  TEXT_PRIMARY: '#F0F0F5',         // Màu chữ chính (ví dụ: trắng ngà, độ tương phản cao trên nền tối)
  TEXT_SECONDARY: '#A8A8C2',       // Màu chữ phụ, placeholder (ví dụ: xám xanh nhạt hơn)
  TEXT_DISABLED: '#6E7399',        // Màu chữ cho trạng thái vô hiệu hóa

  // Màu chủ đạo và điểm nhấn (Primary & Accent)
  PRIMARY: '#7B8FFD',             // Màu chủ đạo cho các hành động chính, nút bấm (ví dụ: xanh lavender dịu, tạo cảm giác hy vọng)
  ACCENT: '#4DD0E1',              // Màu điểm nhấn cho các chi tiết, icon, tab đang hoạt động (ví dụ: xanh cyan/teal dịu)

  // Màu ngữ nghĩa (Semantic Colors)
  SUCCESS: '#66BB6A',             // Màu cho thông báo thành công (xanh lá dễ chịu)
  ERROR: '#EF5350',               // Màu cho thông báo lỗi (đỏ rõ ràng nhưng không quá gắt)
  WARNING: '#FFEE58',             // Màu cho cảnh báo (vàng dịu)

  // Thành phần UI (UI Elements)
  INPUT_BACKGROUND: '#2F3352',    // Nền cho các trường nhập liệu (tối hơn nền phụ, dễ phân biệt)
  BORDER: '#3A3F6A',              // Màu viền cho input, card, hoặc đường phân cách (tinh tế)
  ICON_PRIMARY: '#A8A8C2',         // Màu cho icon chính (có thể giống TEXT_SECONDARY)
  ICON_ACCENT: '#7B8FFD',          // Màu cho icon cần điểm nhấn (có thể giống PRIMARY)
  DISABLED: '#50506F',            // Màu cho các nút hoặc thành phần bị vô hiệu hóa

  // Các màu cơ bản khác
  WHITE: '#FFFFFF',
  BLACK: '#000000',                // Dùng cho các trường hợp đặc biệt, không phải nền chính
  TRANSPARENT: 'transparent',

  // Bạn có thể thêm các sắc độ khác của màu xám nếu cần
  GRAY_DARK: '#333333',
  GRAY_MEDIUM: '#888888',
  GRAY_LIGHT: '#CCCCCC',
};

export default COLORS;