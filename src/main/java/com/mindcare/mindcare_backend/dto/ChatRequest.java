package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String conversationId;  // ID cuộc hội thoại
    private String userId;          // ID người dùng gửi tin nhắn
    private String message;         // Nội dung tin nhắn
}
