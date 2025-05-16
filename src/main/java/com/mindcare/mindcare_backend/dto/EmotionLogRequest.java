package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class EmotionLogRequest {
    private String userId;        // ID người dùng
    private String conversationId; // ID cuộc hội thoại liên quan (nếu có)
    private String emotion;       // Cảm xúc ghi nhận (ví dụ: "Happy", "Sad", "Angry", ...)
    private String timestamp;     // Thời gian ghi nhận cảm xúc (ISO 8601 hoặc định dạng phù hợp)
}
