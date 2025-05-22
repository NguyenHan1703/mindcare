package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.request.AdminUserCreateRequest;
import com.mindcare.mindcare_backend.dto.request.AdminUserUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.AdminUserViewResponse;
import com.mindcare.mindcare_backend.dto.response.ConversationSnippetResponse;
import com.mindcare.mindcare_backend.dto.response.DailyEmotionLogResponse;
import com.mindcare.mindcare_backend.dto.response.GenericApiResponse;
import com.mindcare.mindcare_backend.dto.response.MessageResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.service.AdminService;
import com.mindcare.mindcare_backend.service.ConversationService;
import com.mindcare.mindcare_backend.service.EmotionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Tất cả API trong đây yêu cầu ROLE_ADMIN
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;
    private final ConversationService conversationService; // Để admin xem hội thoại
    private final EmotionService emotionService;       // Để admin xem thống kê cảm xúc

    @Autowired
    public AdminController(AdminService adminService,
                           ConversationService conversationService,
                           EmotionService emotionService) {
        this.adminService = adminService;
        this.conversationService = conversationService;
        this.emotionService = emotionService;
    }

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserViewResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        logger.info("Admin yêu cầu danh sách tất cả người dùng. Trang: {}, Kích thước: {}, Sắp xếp: {} {}", page, size, sortBy, sortDir);
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PostMapping("/users")
    public ResponseEntity<GenericApiResponse<UserResponse>> createUserByAdmin(
            @Valid @RequestBody AdminUserCreateRequest createRequest) {
        logger.info("Admin yêu cầu tạo người dùng mới với username: {}", createRequest.getUsername());
        UserResponse newUser = adminService.createUserByAdmin(createRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(GenericApiResponse.success(newUser, "Tạo người dùng thành công."));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserByIdByAdmin(@PathVariable String userId) {
        logger.info("Admin yêu cầu thông tin chi tiết cho User ID: {}", userId);
        return ResponseEntity.ok(adminService.getUserByIdByAdmin(userId));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<GenericApiResponse<UserResponse>> updateUserByAdmin(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserUpdateRequest updateRequest) {
        logger.info("Admin yêu cầu cập nhật thông tin cho User ID: {}", userId);
        UserResponse updatedUser = adminService.updateUserByAdmin(userId, updateRequest);
        return ResponseEntity.ok(GenericApiResponse.success(updatedUser, "Cập nhật thông tin người dùng thành công."));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<GenericApiResponse<Void>> deleteUserByAdmin(@PathVariable String userId) {
        logger.info("Admin yêu cầu xóa User ID: {}", userId);
        adminService.deleteUserByAdmin(userId);
        return ResponseEntity.ok(GenericApiResponse.success("Người dùng đã được xóa vĩnh viễn."));
    }

    // --- Viewing User-Specific Data ---
    @GetMapping("/users/{userId}/conversations")
    public ResponseEntity<Page<ConversationSnippetResponse>> getUserConversationsByAdmin(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Admin yêu cầu danh sách hội thoại của User ID: {}, Trang: {}, Kích thước: {}", userId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        // Sử dụng ConversationService đã có để lấy hội thoại của user
        Page<ConversationSnippetResponse> conversations = conversationService.getUserConversations(userId, pageable);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/users/{userId}/conversations/{conversationId}/messages")
    public ResponseEntity<Page<MessageResponse>> getMessagesForUserConversationByAdmin(
            @PathVariable String userId,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        logger.info("Admin yêu cầu tin nhắn của Conversation ID: {} (User ID: {}), Trang: {}, Kích thước: {}", conversationId, userId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "timestamp"));
        // Sử dụng ConversationService, nhưng cần đảm bảo Admin có quyền xem (có thể thêm logic kiểm tra quyền trong service nếu cần,
        // hoặc dựa vào @PreAuthorize ở controller này là đủ cho việc Admin xem mọi thứ)
        Page<MessageResponse> messages = conversationService.getConversationMessages(conversationId, userId, pageable);
        return ResponseEntity.ok(messages);
    }


    @GetMapping("/users/{userId}/emotions/statistics")
    public ResponseEntity<List<DailyEmotionLogResponse>> getUserEmotionStatisticsByAdmin(
            @PathVariable String userId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        logger.info("Admin yêu cầu thống kê cảm xúc cho User ID: {} từ {} đến {}", userId, startDate, endDate);
        // Sử dụng EmotionService đã có
        List<DailyEmotionLogResponse> statistics = emotionService.getEmotionStatistics(userId, startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
}