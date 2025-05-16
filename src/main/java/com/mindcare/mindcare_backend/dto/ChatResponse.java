package com.mindcare.mindcare_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatResponse {
    private String messageId;
    private String conversationId;
    private String senderId;
    private String content;
    private String timestamp;
}
