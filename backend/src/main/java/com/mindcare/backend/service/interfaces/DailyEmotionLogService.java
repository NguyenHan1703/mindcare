package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.emotion.DailyEmotionLogDto;
import com.mindcare.backend.dto.emotion.DailyEmotionLogRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DailyEmotionLogService {

    /**
     * Ghi nhận hoặc cập nhật cảm xúc hàng ngày cho người dùng.
     * Nếu người dùng đã ghi nhận cảm xúc cho ngày hiện tại, bản ghi sẽ được cập nhật.
     * Nếu chưa, một bản ghi mới sẽ được tạo.
     */
    DailyEmotionLogDto logOrUpdateDailyEmotion(String userId, DailyEmotionLogRequest emotionRequest);

    // Lấy danh sách các bản ghi cảm xúc của người dùng trong một khoảng thời gian.
    List<DailyEmotionLogDto> getEmotionLogsForPeriod(String userId, LocalDate startDate, LocalDate endDate);

    /**
     * Lấy thống kê tóm tắt số lần xuất hiện của mỗi loại cảm xúc
     * của người dùng trong một khoảng thời gian.
     */
    Map<String, Long> getEmotionStatsSummary(String userId, LocalDate startDate, LocalDate endDate);
}