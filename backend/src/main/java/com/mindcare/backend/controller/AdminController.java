package com.mindcare.backend.controller;

import com.mindcare.backend.dto.admin.AdminUserUpdateRequestDto;
import com.mindcare.backend.dto.admin.AdminUserViewDto;
import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.emotion.EmotionStatsResponseDto;
import com.mindcare.backend.dto.response.MessageResponse;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.service.interfaces.AdminService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600) // Cân nhắc dùng cấu hình CORS global
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Yêu cầu vai trò ADMIN cho tất cả các API trong controller này
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Admin: Lấy danh sách tất cả người dùng.
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserViewDto>> getAllUsers() {
        List<AdminUserViewDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Admin: Lấy thông tin chi tiết của một người dùng theo ID.
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserByIdForAdmin(@PathVariable String userId) {
        try {
            AdminUserViewDto userDto = adminService.getUserByIdForAdmin(userId);
            return ResponseEntity.ok(userDto);
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin requested non-existent user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching user by ID for admin: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy thông tin người dùng."));
        }
    }

    /**
     * Admin: Cập nhật thông tin người dùng.
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable String userId,
                                               @Valid @RequestBody AdminUserUpdateRequestDto updateRequest) {
        try {
            AdminUserViewDto updatedUser = adminService.updateUserByAdmin(userId, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin attempt to update non-existent user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) { // Ví dụ: username đã tồn tại, role không hợp lệ
            logger.warn("Admin user update failed for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating user by admin for ID {}:", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể cập nhật người dùng."));
        }
    }

    /**
     * Admin: Xóa một người dùng và tất cả dữ liệu liên quan.
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUserAndData(@PathVariable String userId) {
        try {
            adminService.deleteUserAndAssociatedData(userId);
            return ResponseEntity.ok(new MessageResponse("Người dùng và dữ liệu liên quan đã được xóa thành công."));
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin attempt to delete non-existent user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting user and data for ID {}:", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể xóa người dùng."));
        }
    }

    /**
     * Admin: Xem danh sách các cuộc hội thoại của một người dùng cụ thể.
     */
    @GetMapping("/users/{targetUserId}/conversations")
    public ResponseEntity<?> getUserConversationsForAdmin(@PathVariable String targetUserId) {
        try {
            List<ConversationDto> conversations = adminService.getUserConversationsForAdmin(targetUserId);
            return ResponseEntity.ok(conversations);
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin requested conversations for non-existent target user: {}", targetUserId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching conversations for target user ID {}:", targetUserId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy danh sách hội thoại."));
        }
    }

    /**
     * Admin: Xem thống kê cảm xúc của một người dùng cụ thể trong một khoảng thời gian.
     */
    @GetMapping("/users/{targetUserId}/emotions/stats")
    public ResponseEntity<?> getUserEmotionStatsForAdmin(
            @PathVariable String targetUserId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Ngày bắt đầu và kết thúc không hợp lệ."));
        }
        try {
            EmotionStatsResponseDto stats = adminService.getUserEmotionStatsForAdmin(targetUserId, startDate, endDate);
            return ResponseEntity.ok(stats);
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin requested emotion stats for non-existent target user: {}", targetUserId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching emotion stats for target user ID {}:", targetUserId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy thống kê cảm xúc."));
        }
    }
    // Admin: Xem chi tiết tất cả tin nhắn của một cuộc hội thoại cụ thể.
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessagesForConversationAsAdmin(@PathVariable String conversationId) {
        logger.info("Admin request: Get messages for ConversationID: {}", conversationId);
        try {
            List<MessageDto> messages = adminService.getMessagesForConversation(conversationId);
            return ResponseEntity.ok(messages);
        } catch (ResourceNotFoundException e) {
            logger.warn("Admin request failed for ConversationID {}: {}", conversationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching messages for conversation ID {} by admin:", conversationId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy danh sách tin nhắn."));
        }
    }
}