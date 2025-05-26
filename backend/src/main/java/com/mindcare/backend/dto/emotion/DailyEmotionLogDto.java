package com.mindcare.backend.dto.emotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyEmotionLogDto {
    private String id;          // ID của bản ghi log
    private String userId;      // ID của người dùng
    private String emotion;     // Tên cảm xúc
    private LocalDate logDate;  // Ngày ghi nhận cảm xúc
    private LocalDateTime createdAt; // Thời điểm bản ghi được tạo
}