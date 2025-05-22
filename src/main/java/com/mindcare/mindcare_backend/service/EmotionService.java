package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.response.DailyEmotionLogResponse;
import com.mindcare.mindcare_backend.model.EEmotionSource;

import java.time.LocalDate;
import java.util.List;

public interface EmotionService {
    DailyEmotionLogResponse recordOrUpdateDailyEmotion(String userId, String conversationId, LocalDate date, String emotion, EEmotionSource source);

    // Lấy danh sách các bản ghi cảm xúc hàng ngày của một người dùng để thống kê
    List<DailyEmotionLogResponse> getEmotionStatistics(String userId, LocalDate startDate, LocalDate endDate);

    // Kiểm tra đã có cảm xúc hay chưa
    boolean isFirstEmotionLogOfDay(String userId, LocalDate date);
}
