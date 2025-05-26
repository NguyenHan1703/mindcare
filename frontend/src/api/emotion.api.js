// src/api/emotion.api.js
import apiClient from './apiClient';

/**
 * Gọi API để ghi nhận hoặc cập nhật cảm xúc hàng ngày của người dùng.
 * Backend endpoint: POST /api/users/me/emotions/daily
 */
export const logDailyEmotionApi = (emotion) => { // Đổi tên thành logDailyEmotionApi cho nhất quán
  if (!emotion || String(emotion).trim() === '') {
    console.error("logDailyEmotionApi: emotion là bắt buộc");
    return Promise.reject(new Error("Cảm xúc không được để trống"));
  }
  return apiClient.post('/users/me/emotions/daily', { emotion });
};

/**
 * Gọi API để lấy lịch sử chi tiết và thống kê tóm tắt cảm xúc của người dùng hiện tại
 * trong một khoảng thời gian.
 * Backend endpoint: GET /api/users/me/emotions/daily/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * (chứa dailyLogs và emotionSummary).
 */
export const getEmotionStatsApi = (startDate, endDate) => { // ✨ HÀM MỚI ✨ //Đổi tên thành getEmotionStatsApi
  if (!startDate || !endDate) {
    console.error("getEmotionStatsApi: startDate và endDate là bắt buộc");
    return Promise.reject(new Error("Ngày bắt đầu và kết thúc là bắt buộc"));
  }
  // API Client sẽ tự động nối các params này vào URL
  return apiClient.get('/users/me/emotions/daily/stats', {
    params: {
      startDate: startDate,
      endDate: endDate,
    },
  });
};
