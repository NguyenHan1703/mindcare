package com.mindcare.backend.dto.emotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmotionStatsResponseDto {
    private List<DailyEmotionLogDto> dailyLogs; // Danh sách chi tiết các log cảm xúc
    private Map<String, Long> emotionSummary;   // Thống kê số lần xuất hiện của mỗi cảm xúc
}