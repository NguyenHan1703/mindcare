package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.response.ConversationDetailResponse;
import com.mindcare.mindcare_backend.dto.response.ConversationSnippetResponse;
import com.mindcare.mindcare_backend.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConversationService {
    // Tạo cuộc hội thoại mới
    ConversationDetailResponse createConversation(String userId);

    // Lấy danh sách hội thoại
    Page<ConversationSnippetResponse> getUserConversations(String userId, Pageable pageable);

    // Lấy danh sách tin nhắn chi tiết
    Page<MessageResponse> getConversationMessages(String conversationId, String userId, Pageable pageable);

    // Xóa hội thoại
    void deleteConversation(String conversationId, String userId);

    // Kiểu tra chủ sở hữu
    boolean isUserOwnerOfConversation(String userId, String conversationId);
}