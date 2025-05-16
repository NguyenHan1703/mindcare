package com.mindcare.mindcare_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmotionLogResponse {
    private String emotionId;      // ID cảm xúc
    private String userId;         // ID người dùng
    private String conversationId; // ID cuộc hội thoại liên quan
    private String emotion;        // Cảm xúc
    private String timestamp;      // Thời gian ghi nhận
}
