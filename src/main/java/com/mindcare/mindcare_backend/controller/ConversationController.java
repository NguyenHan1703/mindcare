package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.request.EmotionInputRequest;
import com.mindcare.mindcare_backend.dto.request.MessageRequest;
import com.mindcare.mindcare_backend.dto.response.ConversationDetailResponse;
import com.mindcare.mindcare_backend.dto.response.ConversationSnippetResponse;
import com.mindcare.mindcare_backend.dto.response.GenericApiResponse;
import com.mindcare.mindcare_backend.dto.response.MessageResponse;
import com.mindcare.mindcare_backend.security.services.UserDetailsImpl; // Để lấy thông tin user đang đăng nhập
import com.mindcare.mindcare_backend.service.ConversationService;
import com.mindcare.mindcare_backend.service.AiChatService; // Sẽ dùng khi tích hợp AI đầy đủ
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Để phân quyền
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Để lấy UserDetailsImpl
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations") // Tất cả API trong controller này sẽ có tiền tố /api/conversations
@PreAuthorize("hasRole('USER')") // Yêu cầu người dùng phải có vai trò USER để truy cập các API này
public class ConversationController {

    private static final Logger logger = LoggerFactory.getLogger(ConversationController.class);

    private final ConversationService conversationService;
    //private final AiChatService aiChatService; // Inject AiChatService để xử lý tin nhắn

    @Autowired
    public ConversationController(ConversationService conversationService /**AiChatService aiChatService**/) {
        this.conversationService = conversationService;
        //this.aiChatService = aiChatService;
    }

    // API endpoint để tạo một cuộc hội thoại mới.
    @PostMapping
    public ResponseEntity<ConversationDetailResponse> createConversation(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("User ID: {} đang yêu cầu tạo hội thoại mới", currentUser.getId());
        ConversationDetailResponse newConversation = conversationService.createConversation(currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(newConversation);
    }

    //API endpoint để lấy danh sách các cuộc hội thoại của người dùng hiện tại (có phân trang).
    @GetMapping
    public ResponseEntity<Page<ConversationSnippetResponse>> getUserConversations(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("User ID: {} đang yêu cầu danh sách hội thoại, trang: {}, kích thước: {}", currentUser.getId(), page, size);
        // Mặc định sắp xếp theo thời gian tin nhắn cuối cùng giảm dần
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        Page<ConversationSnippetResponse> conversations = conversationService.getUserConversations(currentUser.getId(), pageable);
        return ResponseEntity.ok(conversations);
    }

    //API endpoint để lấy danh sách tin nhắn của một cuộc hội thoại cụ thể (có phân trang).

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<Page<MessageResponse>> getConversationMessages(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        logger.info("User ID: {} đang yêu cầu tin nhắn của Conversation ID: {}, trang: {}, kích thước: {}",
                currentUser.getId(), conversationId, page, size);
        // Mặc định sắp xếp tin nhắn theo thời gian tăng dần để hiển thị đúng thứ tự
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "timestamp"));
        Page<MessageResponse> messages = conversationService.getConversationMessages(conversationId, currentUser.getId(), pageable);
        return ResponseEntity.ok(messages);
    }

    // API endpoint để người dùng gửi một tin nhắn mới trong một cuộc hội thoại.

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody MessageRequest messageRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("User ID: {} gửi tin nhắn tới Conversation ID: {}: \"{}\"",
                currentUser.getId(), conversationId, messageRequest.getContent());

        // Kiểm tra quyền sở hữu trước khi gửi tin nhắn
        if (!conversationService.isUserOwnerOfConversation(currentUser.getId(), conversationId)) {
            logger.warn("User ID: {} cố gắng gửi tin nhắn vào Conversation ID: {} mà không có quyền.", currentUser.getId(), conversationId);
            // GenericApiResponse có thể được xử lý bởi GlobalExceptionHandler cho lỗi 403
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // Hoặc ném UnauthorizedOperationException
        }

//        // Gọi AiChatService để xử lý tin nhắn người dùng và nhận phản hồi AI
//        MessageResponse aiResponse = aiChatService.processUserMessageAndGetResponse(
//                conversationId,
//                currentUser.getId(),
//                messageRequest.getContent()
//        );
        // Service này sẽ đảm nhiệm việc lưu tin nhắn user, gọi AI, lưu tin nhắn AI, và trả về tin nhắn của AI.

        // return ResponseEntity.status(HttpStatus.CREATED).body(aiResponse);
        return null;
    }

    // API endpoint để người dùng xóa một cuộc hội thoại của họ.

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<GenericApiResponse<Void>> deleteConversation(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("User ID: {} yêu cầu xóa Conversation ID: {}", currentUser.getId(), conversationId);
        conversationService.deleteConversation(conversationId, currentUser.getId());
        return ResponseEntity.ok(GenericApiResponse.success("Cuộc hội thoại đã được xóa thành công."));
    }

    // API endpoint để người dùng chọn một icon cảm xúc.

    @PostMapping("/{conversationId}/emotions")
    public ResponseEntity<MessageResponse> submitEmotion(
            @PathVariable String conversationId,
            @Valid @RequestBody com.mindcare.mindcare_backend.dto.request.EmotionInputRequest emotionInputRequest, // Đảm bảo import đúng DTO
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("User ID: {} gửi cảm xúc {} cho Conversation ID: {}",
                currentUser.getId(), emotionInputRequest.getEmotion(), conversationId);

        if (!conversationService.isUserOwnerOfConversation(currentUser.getId(), conversationId)) {
            logger.warn("User ID: {} cố gắng gửi cảm xúc vào Conversation ID: {} mà không có quyền.", currentUser.getId(), conversationId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

//        MessageResponse aiResponse = aiChatService.processUserEmotionAndGetResponse(
//                conversationId,
//                currentUser.getId(),
//                emotionInputRequest.getEmotion()
//        );
        // Service này sẽ đảm nhiệm việc ghi nhận cảm xúc (nếu là lần đầu trong ngày), gọi AI, và trả về tin nhắn của AI.

        //return ResponseEntity.status(HttpStatus.CREATED).body(aiResponse);
        return null;
    }
}
