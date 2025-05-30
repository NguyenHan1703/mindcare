package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.admin.AdminUserUpdateRequestDto;
import com.mindcare.backend.dto.admin.AdminUserViewDto;
import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.dto.emotion.EmotionStatsResponseDto; // Sử dụng lại DTO này
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public interface AdminService {

    // Lấy danh sách tất cả người dùng trong hệ thống.
    List<AdminUserViewDto> getAllUsers();

    // Lấy thông tin chi tiết của một người dùng theo ID (dành cho admin)
    AdminUserViewDto getUserByIdForAdmin(String userId);

    // Cập nhật thông tin người dùng bởi admin.
    AdminUserViewDto updateUserByAdmin(String userId, AdminUserUpdateRequestDto updateRequest);

    /**
     * Xóa một người dùng và tất cả dữ liệu liên quan của họ (conversations, messages, emotion logs).
     * Cần thực hiện cẩn thận.
     */
    void deleteUserAndAssociatedData(String userId);

    // Admin xem danh sách các cuộc hội thoại của một người dùng cụ thể.
    List<ConversationDto> getUserConversationsForAdmin(String targetUserId);

    // Admin xem thống kê cảm xúc của một người dùng cụ thể trong một khoảng thời gian.
    EmotionStatsResponseDto getUserEmotionStatsForAdmin(String targetUserId, LocalDate startDate, LocalDate endDate);

    // Lấy tất cả tin nhắn của một cuộc hội thoại cụ thể
    List<MessageDto> getMessagesForConversation(String conversationId);

    AdminUserViewDto createUserByAdmin(@Valid AdminUserUpdateRequestDto createRequest);
}