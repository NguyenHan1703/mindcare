package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.dto.conversation.MessageRequest;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.model.Conversation;
import com.mindcare.backend.model.Message;
import com.mindcare.backend.repository.ConversationRepository;
import com.mindcare.backend.repository.MessageRepository;
import com.mindcare.backend.repository.UserRepository;
import com.mindcare.backend.service.interfaces.AiChatService;
import com.mindcare.backend.service.interfaces.ConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationServiceImpl implements ConversationService {

    private static final Logger logger = LoggerFactory.getLogger(ConversationServiceImpl.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository; // Để kiểm tra User nếu cần
    private final AiChatService aiChatService;   // Service để tương tác với AI

    @Value("${ollama.model.name:gemma:latest}") // Lấy tên model từ application.properties
    private String defaultAiModelName;

    @Autowired
    public ConversationServiceImpl(ConversationRepository conversationRepository,
                                   MessageRepository messageRepository,
                                   UserRepository userRepository,
                                   AiChatService aiChatService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.aiChatService = aiChatService;
    }

    @Override
    @Transactional
    public ConversationDto createConversation(String userId, Optional<String> titleOpt) {
        userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to create conversation for non-existent user. UserID: {}", userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
                });

        String conversationTitle = titleOpt.filter(t -> !t.isBlank())
                .orElse("Cuộc hội thoại mới lúc " + LocalDateTime.now().toLocalDate());

        Conversation conversation = new Conversation(
                userId,
                conversationTitle,
                defaultAiModelName
        );
        Conversation savedConversation = conversationRepository.save(conversation);
        logger.info("CONVERSATION CREATED: ID='{}', UserID='{}' (from Conversation object), Title='{}'",
                savedConversation.getId(), savedConversation.getUserId(), savedConversation.getTitle());
        return mapToConversationDto(savedConversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(String userId) {
        logger.debug("Fetching conversations for UserID: {}", userId);
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return conversations.stream()
                .map(this::mapToConversationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ConversationDto> getConversationById(String userId, String conversationId) {
        logger.debug("Fetching conversation by ID: {} for UserID: {}", conversationId, userId);
        return conversationRepository.findByIdAndUserId(conversationId, userId)
                .map(this::mapToConversationDto);
    }

    @Override
    @Transactional
    public MessageDto saveUserMessage(String userId, String conversationId, MessageRequest messageRequest) {
        logger.info("SAVE_USER_MESSAGE: Attempting to find conversation. Passed ConversationID='{}', Passed CurrentUserID='{}'",
                conversationId, userId);
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to save message to non-existent or unauthorized conversation. UserID: {}, ConvID: {}", userId, conversationId);
                    return new ResourceNotFoundException(
                            "Không tìm thấy cuộc hội thoại với ID: " + conversationId + " cho người dùng này."
                    );
                });

        // 1. Lưu tin nhắn của người dùng
        Message userMessageEntity = new Message(
                conversationId,
                "USER",
                messageRequest.getContent()
        );
        Message savedUserMessage = messageRepository.save(userMessageEntity);
        logger.info("User message saved. MsgID: {}, ConvID: {}", savedUserMessage.getId(), conversationId);

        // Cập nhật thời gian updatedAt của Conversation sau tin nhắn của user
        conversation.setUpdatedAt(LocalDateTime.now());
        // conversationRepository.save(conversation); // Sẽ save ở cuối nếu có tin nhắn AI

        // 2. Chuẩn bị lịch sử hội thoại để gửi cho AI
        List<Message> currentMessages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        List<MessageDto> conversationHistoryForAI = currentMessages.stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());

        // 3. Gọi AiChatService để lấy phản hồi từ AI
        String aiResponseContent = null;
        try {
            logger.info("Requesting AI response for ConvID: {}. Current user message: '{}'", conversationId, savedUserMessage.getContent());
            aiResponseContent = aiChatService.getAiResponse(conversationId, conversationHistoryForAI, savedUserMessage.getContent());
        } catch (Exception e) {
            logger.error("Error getting AI response for ConvID: {}. Error: {}", conversationId, e.getMessage(), e);
            // Hiện tại, nếu AI lỗi, sẽ không có tin nhắn AI nào được lưu.
            // Cập nhật conversation dù AI có lỗi hay không
            conversationRepository.save(conversation);
        }

        // 4. Lưu tin nhắn phản hồi từ AI (nếu có)
        if (aiResponseContent != null && !aiResponseContent.isBlank()) {
            Message aiMessageEntity = new Message(
                    conversationId,
                    "AI",
                    aiResponseContent
            );
            messageRepository.save(aiMessageEntity);
            logger.info("AI message saved for ConvID: {}", conversationId);

            // Cập nhật lại thời gian updatedAt của Conversation sau tin nhắn của AI
            conversation.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conversation); // Save conversation sau khi có cả tin nhắn AI
        } else {
            logger.warn("AI response was null or blank for ConvID: {}. No AI message saved.", conversationId);
            // Nếu không có phản hồi AI, vẫn nên save conversation vì updatedAt đã thay đổi do tin nhắn user
            conversationRepository.save(conversation);
        }

        return mapToMessageDto(savedUserMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(String userId, String conversationId) {
        logger.debug("Fetching messages for ConvID: {} for UserID: {}", conversationId, userId);
        conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to get messages from non-existent or unauthorized conversation. UserID: {}, ConvID: {}", userId, conversationId);
                    return new ResourceNotFoundException(
                            "Không tìm thấy cuộc hội thoại với ID: " + conversationId + " cho người dùng này."
                    );
                });

        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return messages.stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteConversation(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to delete non-existent or unauthorized conversation. UserID: {}, ConvID: {}", userId, conversationId);
                    return new ResourceNotFoundException(
                            "Không tìm thấy cuộc hội thoại với ID: " + conversationId + " cho người dùng này."
                    );
                });

        logger.info("Deleting all messages for conversationId: {}", conversationId);
        messageRepository.deleteAllByConversationId(conversationId);
        logger.info("Deleting conversation with ID: {} for UserID: {}", conversationId, userId);
        conversationRepository.delete(conversation);
    }
    // Sửa tiêu đề hội thoại
    @Override
    @Transactional
    public Optional<ConversationDto> updateConversationTitle(String userId, String conversationId, String newTitle) {
        // Tìm kiếm cuộc hội thoại theo ID và UserID
        Optional<Conversation> conversationOpt = conversationRepository.findByIdAndUserId(conversationId, userId);

        if (conversationOpt.isPresent()) {
            Conversation conversation = conversationOpt.get();

            // Cập nhật tiêu đề mới
            conversation.setTitle(newTitle);
            conversation.setUpdatedAt(LocalDateTime.now()); // Cập nhật thời gian chỉnh sửa

            // Lưu cuộc hội thoại đã được cập nhật
            Conversation updatedConversation = conversationRepository.save(conversation);

            // Trả về DTO đã được cập nhật
            return Optional.of(mapToConversationDto(updatedConversation));
        }

        // Nếu không tìm thấy cuộc hội thoại, trả về Optional.empty
        return Optional.empty();
    }
    // Helper methods to map entities to DTOs
    private ConversationDto mapToConversationDto(Conversation conversation) {
        if (conversation == null) return null;
        return new ConversationDto(
                conversation.getId(),
                conversation.getUserId(),
                conversation.getTitle(),
                conversation.getAiModel(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    private MessageDto mapToMessageDto(Message message) {
        if (message == null) return null;
        return new MessageDto(
                message.getId(),
                message.getConversationId(),
                message.getSender(),
                message.getContent(),
                message.getTimestamp()
        );
    }
}