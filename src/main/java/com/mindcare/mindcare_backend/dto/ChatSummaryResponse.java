package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class ChatSummaryResponse {
    private String conversationId;   // ID cuộc hội thoại
    private String title;            // Tiêu đề cuộc hội thoại
    private String latestEmotion;    // Cảm xúc gần nhất trong cuộc hội thoại
    private String lastUpdated;      // Thời gian cập nhật cuối cùng
}
