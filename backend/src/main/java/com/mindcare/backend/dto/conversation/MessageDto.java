package com.mindcare.backend.dto.conversation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String id;                 // ID của tin nhắn
    private String conversationId;     // ID của cuộc hội thoại mà tin nhắn này thuộc về
    private String sender;             // Người gửi ("USER" hoặc "AI")
    private String content;            // Nội dung tin nhắn
    private LocalDateTime timestamp;   // Thời điểm tin nhắn được gửi/tạo
}