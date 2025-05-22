package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.response.ConversationDetailResponse;
import com.mindcare.mindcare_backend.dto.response.ConversationSnippetResponse;
import com.mindcare.mindcare_backend.dto.response.MessageResponse;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.exception.UnauthorizedOperationException;
import com.mindcare.mindcare_backend.model.Conversation;
import com.mindcare.mindcare_backend.model.Message;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.ConversationRepository;
import com.mindcare.mindcare_backend.repository.MessageRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
//import com.mindcare.mindcare_backend.service.AiChatService; // Sẽ được inject để tạo tin nhắn AI ban đầu
import com.mindcare.mindcare_backend.service.ConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationServiceImpl implements ConversationService {

    private static final Logger logger = LoggerFactory.getLogger(ConversationServiceImpl.class);

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    // private final AiChatService aiChatService; // Dùng để gửi tin nhắn chào mừng từ AI

    @Autowired
    public ConversationServiceImpl(UserRepository userRepository,
                                   ConversationRepository conversationRepository,
                                   MessageRepository messageRepository)
                                   //AiChatService aiChatService) {
    {
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        //this.aiChatService = aiChatService;
    }

    @Override
    @Transactional
    public ConversationDetailResponse createConversation(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Conversation conversation = new Conversation();
        conversation.setUser(user);

        // Đếm số hội thoại hiện có để đặt tiêu đề mặc định
        long count = conversationRepository.countByUser(user);
        conversation.setTitle("Cuộc hội thoại " + (count + 1));
        conversation.setLastMessageAt(LocalDateTime.now()); // Thời điểm tạo cũng là lastMessageAt ban đầu

        Conversation savedConversation = conversationRepository.save(conversation);
        logger.info("Đã tạo hội thoại mới ID: {} cho User ID: {}", savedConversation.getId(), userId);

        // Gọi AiChatService để gửi tin nhắn chào mừng đầu tiên từ AI
        //MessageResponse initialAiMessage = aiChatService.sendInitialAiGreeting(savedConversation.getId(), userId);
        MessageResponse initialAiMessage = null;
        //return mapToConversationDetailResponse(savedConversation, initialAiMessage);
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversationSnippetResponse> getUserConversations(String userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        // Mặc định sắp xếp theo lastMessageAt giảm dần nếu pageable không chỉ định
        // Sửa lỗi withSort

        Pageable effectivePageable = pageable; // Tạo biến mới để không thay đổi tham số gốc
        if (pageable.getSort().isUnsorted()) {
            // SỬA Ở ĐÂY: Sử dụng PageRequest.of() để tạo Pageable mới với thông tin Sort
            effectivePageable = PageRequest.of(
                    pageable.getPageNumber(),      // Lấy số trang từ pageable gốc
                    pageable.getPageSize(),        // Lấy kích thước trang từ pageable gốc
                    Sort.by(Sort.Direction.DESC, "lastMessageAt") // Áp dụng sắp xếp mới
            );
        }

        Page<Conversation> conversationsPage = conversationRepository.findByUserId(userId, pageable);
        logger.debug("Lấy danh sách hội thoại cho User ID: {}, trang: {}, kích thước: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        return conversationsPage.map(this::mapToConversationSnippetResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversationMessages(String conversationId, String userId, Pageable pageable) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        if (!conversation.getUser().getId().equals(userId)) {
            // Kiểm tra xem người dùng có quyền truy cập vào hội thoại này không
            // Đối với Admin, sẽ có một service khác hoặc logic kiểm tra vai trò riêng.
            logger.warn("User ID: {} cố gắng truy cập tin nhắn của hội thoại ID: {} mà không có quyền.", userId, conversationId);
            throw new UnauthorizedOperationException("Bạn không có quyền xem tin nhắn của cuộc hội thoại này.");
        }

        // Sửa lỗi withSort
        Pageable effectivePageable = pageable; // Tạo biến mới để không thay đổi tham số gốc
        // Mặc định sắp xếp theo timestamp tăng dần nếu pageable không chỉ định sắp xếp
        if (pageable.getSort().isUnsorted()) {
            // SỬA Ở ĐÂY: Sử dụng PageRequest.of() để tạo Pageable mới với thông tin Sort
            effectivePageable = PageRequest.of(
                    pageable.getPageNumber(),      // Lấy số trang từ pageable gốc
                    pageable.getPageSize(),        // Lấy kích thước trang từ pageable gốc
                    Sort.by(Sort.Direction.ASC, "timestamp") // Áp dụng sắp xếp mới
            );
        }
        Page<Message> messagesPage = messageRepository.findByConversationId(conversationId, pageable);
        logger.debug("Lấy danh sách tin nhắn cho Conversation ID: {}, trang: {}, kích thước: {}", conversationId, pageable.getPageNumber(), pageable.getPageSize());
        return messagesPage.map(this::mapToMessageResponse);
    }

    @Override
    @Transactional
    public void deleteConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        if (!conversation.getUser().getId().equals(userId)) {
            logger.warn("User ID: {} cố gắng xóa hội thoại ID: {} mà không có quyền.", userId, conversationId);
            throw new UnauthorizedOperationException("Bạn không có quyền xóa cuộc hội thoại này.");
        }

        // Xóa tất cả các tin nhắn liên quan đến cuộc hội thoại này
        messageRepository.deleteAllByConversationId(conversationId);
        logger.info("Đã xóa tất cả tin nhắn của Conversation ID: {}", conversationId);

        // Xóa cuộc hội thoại
        conversationRepository.delete(conversation);
        logger.info("Đã xóa Conversation ID: {} bởi User ID: {}", conversationId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserOwnerOfConversation(String userId, String conversationId) {
        return conversationRepository.findByIdAndUserId(conversationId, userId).isPresent();
    }

    // --- Helper methods để map từ Model sang DTO ---

    private ConversationSnippetResponse mapToConversationSnippetResponse(Conversation conversation) {
        // Logic để lấy lastMessageSummary có thể phức tạp hơn,
        String summary = "Chưa có tin nhắn.";
        List<Message> lastMessages = messageRepository.findTopNByConversationIdOrderByTimestampDesc(conversation.getId(), Pageable.ofSize(1));
        if (!lastMessages.isEmpty()) {
            Message lastMessage = lastMessages.get(0);
            String prefix = lastMessage.getSenderType() == com.mindcare.mindcare_backend.model.ESenderType.USER ? "Bạn: " : "AI: ";
            summary = prefix + (lastMessage.getContent().length() > 50 ? lastMessage.getContent().substring(0, 50) + "..." : lastMessage.getContent());
        }

        return new ConversationSnippetResponse(
                conversation.getId(),
                conversation.getTitle(),
                summary,
                conversation.getLastMessageAt(),
                conversation.getLatestEmotion()
        );
    }

    private ConversationDetailResponse mapToConversationDetailResponse(Conversation conversation, MessageResponse initialAiMessage) {
        return new ConversationDetailResponse(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getUser().getId(),
                conversation.getUser().getDisplayName(), // Giả sử User model có getDisplayName()
                conversation.getCreatedAt(),
                conversation.getLastMessageAt(),
                conversation.getLatestEmotion(),
                initialAiMessage
        );
    }

    private MessageResponse mapToMessageResponse(Message message) {
        User sender = message.getSender(); // User object (có thể là User thật hoặc User đại diện cho AI)
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                sender.getId(),
                sender.getUsername(), // Username của người gửi
                sender.getDisplayName(), // Tên hiển thị của người gửi
                sender.getAvatarUrl(), // Avatar của người gửi
                message.getSenderType(),
                message.getContent(),
                message.getTimestamp()
        );
    }
}