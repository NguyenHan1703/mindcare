package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.dto.conversation.MessageRequest;

import java.util.List;
import java.util.Optional; // Sử dụng Optional cho title

public interface ConversationService {

    // Tạo một cuộc hội thoại mới cho người dùng.
    ConversationDto createConversation(String userId, Optional<String> title);

    // Lấy danh sách tất cả các cuộc hội thoại của một người dùng.
    List<ConversationDto> getUserConversations(String userId);

    // Lấy thông tin chi tiết của một cuộc hội thoại.
    Optional<ConversationDto> getConversationById(String userId, String conversationId);


    /**
     * Lưu một tin nhắn mới từ người dùng vào một cuộc hội thoại.
     * Cập nhật thời gian 'updatedAt' của cuộc hội thoại.
     * Giai đoạn này CHƯA có phản hồi từ AI.
     */
    MessageDto saveUserMessage(String userId, String conversationId, MessageRequest messageRequest);

    // Lấy lịch sử tin nhắn của một cuộc hội thoại.
    List<MessageDto> getConversationMessages(String userId, String conversationId);

    // Xóa một cuộc hội thoại và tất cả các tin nhắn liên quan.
    void deleteConversation(String userId, String conversationId);
}