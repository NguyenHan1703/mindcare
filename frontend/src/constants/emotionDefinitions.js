import COLORS from './colors' 

// Mỗi cảm xúc có:
// - name: Tên hiển thị (tiếng Việt)
// - value: Giá trị để lưu trữ/gửi API (thường là tiếng Anh, viết thường)
// - icon: Tên icon từ @expo/vector-icons (ví dụ: Ionicons)
// - color: Màu sắc đặc trưng cho cảm xúc đó (dùng để hiển thị trên lịch, biểu đồ, picker)
// - emoji: (Tùy chọn) Emoji tương ứng, có thể dùng thay cho icon ở một số nơi
export const EMOTIONS_LIST = [
  { name: 'Vui vẻ',    value: 'happy',    icon: 'happy-outline',         color: '#FFD700', emoji: '😊' }, // Vàng tươi
  { name: 'Hào hứng',  value: 'excited',  icon: 'star-outline',          color: '#FF69B4', emoji: '🎉' }, // Hồng
  { name: 'Bình tĩnh', value: 'calm',     icon: 'leaf-outline',          color: '#8FBC8F', emoji: '😌' }, // Xanh lá cây nhạt
  { name: 'Bình thường',value: 'neutral',  icon: 'remove-circle-outline', color: '#B0BEC5', emoji: '😐' }, // Xám xanh nhạt
  { name: 'Lo lắng',   value: 'anxious',  icon: 'pulse-outline',         color: '#FFB74D', emoji: '😟' }, // Cam nhạt
  { name: 'Buồn',      value: 'sad',      icon: 'sad-outline',           color: '#64B5F6', emoji: '😢' }, // Xanh dương nhạt
  { name: 'Giận dữ',   value: 'angry',    icon: 'flame-outline',         color: '#E57373', emoji: '😠' }, // Đỏ nhạt
]

// Tạo một object map để dễ dàng truy cập thông tin cảm xúc bằng 'value'
export const EMOTIONS_MAP = EMOTIONS_LIST.reduce((acc, emotion) => {
  acc[emotion.value] = emotion
  return acc
}, {})

// Một đối tượng visual mặc định nếu không tìm thấy cảm xúc
export const DEFAULT_EMOTION_VISUAL = {
  name: 'Không rõ',
  value: 'unknown',
  icon: 'help-circle-outline',
  color: COLORS.TEXT_SECONDARY || '#A0A0A0', // Lấy màu từ theme hoặc màu xám mặc định
  emoji: '❓'
}

// Hàm tiện ích để lấy thông tin visual của một cảm xúc bằng value
export const getEmotionVisual = (emotionValue) => {
  return EMOTIONS_MAP[emotionValue?.toLowerCase()] || DEFAULT_EMOTION_VISUAL
}