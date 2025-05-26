// src/constants/theme.js
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Đơn vị cơ sở cho spacing và các kích thước khác
const UNIT = 8;

const THEME = {
  // Kích thước màn hình
  SCREEN_WIDTH,
  SCREEN_HEIGHT,

  // Spacing (Khoảng cách: margin, padding)
  SPACING: {
    XX_SMALL: UNIT / 2, // 4
    X_SMALL: UNIT,      // 8
    SMALL: UNIT * 1.5,  // 12
    MEDIUM: UNIT * 2,   // 16
    LARGE: UNIT * 3,    // 24
    X_LARGE: UNIT * 4,  // 32
    XX_LARGE: UNIT * 6, // 48
  },

  // Font Sizes (Kích thước chữ)
  FONT_SIZES: {
    CAPTION: 12,
    BODY_2: 14,
    BODY_1: 16,         // Kích thước chữ chính cho nội dung
    SUBTITLE: 18,
    TITLE: 20,
    H3: 24,
    H2: 28,
    H1: 32,
  },

  // Font Weights (Độ đậm của chữ)
  // React Native sử dụng string cho fontWeight trên Android cho các giá trị không phải 'normal' hoặc 'bold'
  // Trên iOS, nó có thể hiểu các giá trị số. Để nhất quán, dùng string.
  FONT_WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMI_BOLD: '600',
    BOLD: '700',
    EXTRA_BOLD: '800',
  },
  
  // Line Heights (Chiều cao dòng - tùy chọn, nhưng hữu ích cho typography nhất quán)
  LINE_HEIGHTS: {
    BODY: 24, // Ví dụ cho FONT_SIZES.BODY_1
    TITLE: 32, // Ví dụ cho FONT_SIZES.TITLE
  },

  // Border Radius (Bo góc)
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    XLARGE: 16,
    ROUND: 50, // Cho các nút hoặc avatar tròn
  },

  // Icon Sizes
  ICON_SIZES: {
    SMALL: 18,
    MEDIUM: 24,
    LARGE: 32,
  },

  // Elevation (Độ nổi cho Android - tùy chọn)
  ELEVATION: {
    SMALL: 2,
    MEDIUM: 4,
    LARGE: 8,
  }
};

export default THEME;