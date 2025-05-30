package com.mindcare.backend.controller;

import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.conversation.CreateConversationRequestDto; // Import DTO mới
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.dto.conversation.MessageRequest;
import com.mindcare.backend.dto.response.MessageResponse; // Để trả về thông báo lỗi chung
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.security.services.UserDetailsImpl;
import com.mindcare.backend.service.interfaces.ConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600) // Cân nhắc dùng cấu hình CORS global
@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private static final Logger logger = LoggerFactory.getLogger(ConversationController.class);
    @Autowired
    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * Tạo một cuộc hội thoại mới cho người dùng hiện tại.
     * Tiêu đề có thể được cung cấp tùy chọn trong request body.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createConversation(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody(required = false) CreateConversationRequestDto requestDto) { // requestBody có thể không bắt buộc
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            Optional<String> title = (requestDto != null) ? Optional.ofNullable(requestDto.getTitle()) : Optional.empty();
            ConversationDto conversationDto = conversationService.createConversation(currentUser.getId(), title);
            return ResponseEntity.status(HttpStatus.CREATED).body(conversationDto);
        } catch (ResourceNotFoundException e) { // Ví dụ: User không tồn tại (nếu service có check)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // logger.error("Error creating conversation for user {}: {}", currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể tạo cuộc hội thoại."));
        }
    }

    /**
     * Lấy danh sách tất cả các cuộc hội thoại của người dùng hiện tại.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserConversations(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            List<ConversationDto> conversations = conversationService.getUserConversations(currentUser.getId());
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            // logger.error("Error fetching conversations for user {}: {}", currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy danh sách cuộc hội thoại."));
        }
    }

    /**
     * Lấy thông tin chi tiết một cuộc hội thoại theo ID.
     */
    @GetMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversationById(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String conversationId) {

        if (currentUser == null) {
            logger.warn("getConversationById được gọi nhưng currentUser là null, conversationId: {}", conversationId); // Sử dụng logger
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Lỗi: Người dùng chưa được xác thực hoặc phiên không hợp lệ."));
        }

        try {
            Optional<ConversationDto> conversationDtoOpt = conversationService.getConversationById(currentUser.getId(), conversationId);

            if (conversationDtoOpt.isPresent()) {
                ConversationDto conversationDto = conversationDtoOpt.get();
                return ResponseEntity.ok(conversationDto);
            } else {
                logger.warn("Không tìm thấy cuộc hội thoại {} cho người dùng {}", conversationId, currentUser.getId()); // Sử dụng logger
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập."));
            }
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin cuộc hội thoại {} cho người dùng {}: {}",
                    conversationId, currentUser.getId(), e.getMessage(), e); // Sử dụng logger
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Không thể lấy thông tin cuộc hội thoại."));
        }
    }


    /**
     * Gửi một tin nhắn mới vào một cuộc hội thoại.
     */
    @PostMapping("/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> saveUserMessage(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String conversationId,
            @Valid @RequestBody MessageRequest messageRequest) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            MessageDto savedMessage = conversationService.saveUserMessage(currentUser.getId(), conversationId, messageRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // logger.error("Error saving message for user {} in conversation {}: {}", currentUser.getId(), conversationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể gửi tin nhắn."));
        }
    }

    /**
     * Lấy lịch sử tin nhắn của một cuộc hội thoại.
     */
    @GetMapping("/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversationMessages(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String conversationId) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            List<MessageDto> messages = conversationService.getConversationMessages(currentUser.getId(), conversationId);
            return ResponseEntity.ok(messages);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // logger.error("Error fetching messages for user {} in conversation {}: {}", currentUser.getId(), conversationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy lịch sử tin nhắn."));
        }
    }

    /**
     * Xóa một cuộc hội thoại.
     */
    @DeleteMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteConversation(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String conversationId) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            conversationService.deleteConversation(currentUser.getId(), conversationId);
            return ResponseEntity.noContent().build(); // HTTP 204 No Content
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // logger.error("Error deleting conversation {} for user {}: {}", conversationId, currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể xóa cuộc hội thoại."));
        }
    }
    @PutMapping("/{conversationId}/title")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateConversationTitle(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String conversationId,
            @Valid @RequestBody CreateConversationRequestDto updateRequest) {  // Sử dụng lại CreateConversationRequestDto

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }

        try {
            // Gọi Service để cập nhật tiêu đề cuộc hội thoại
            Optional<ConversationDto> updatedConversationDto = conversationService.updateConversationTitle(currentUser.getId(), conversationId, updateRequest.getTitle());

            if (updatedConversationDto.isPresent()) {
                // Trả về cuộc hội thoại đã được cập nhật
                return ResponseEntity.ok(updatedConversationDto.get());
            } else {
                // Nếu không tìm thấy cuộc hội thoại
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể cập nhật tiêu đề cuộc hội thoại."));
        }
    }
}