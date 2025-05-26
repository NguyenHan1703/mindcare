package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.conversation.MessageDto; // Sử dụng MessageDto để truyền lịch sử
import java.util.List;

public interface AiChatService {

    // Lấy phản hồi từ AI dựa trên lịch sử hội thoại và tin nhắn mới của người dùng.
    String getAiResponse(String conversationId, List<MessageDto> conversationHistory, String userMessage);
}