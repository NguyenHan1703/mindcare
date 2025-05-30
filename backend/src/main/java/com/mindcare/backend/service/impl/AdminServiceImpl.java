package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.admin.AdminUserUpdateRequestDto;
import com.mindcare.backend.dto.admin.AdminUserViewDto;
import com.mindcare.backend.dto.conversation.ConversationDto;
import com.mindcare.backend.dto.emotion.DailyEmotionLogDto;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.dto.emotion.EmotionStatsResponseDto;
import com.mindcare.backend.enums.ERole;
import com.mindcare.backend.exception.BadRequestException;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.exception.UserAlreadyExistsException;
import com.mindcare.backend.model.*;
import com.mindcare.backend.repository.*;
import com.mindcare.backend.service.interfaces.AdminService;
import com.mindcare.backend.service.interfaces.DailyEmotionLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final DailyEmotionLogRepository dailyEmotionLogRepository;
    private final DailyEmotionLogService dailyEmotionLogService;

    @Autowired
    public AdminServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            ConversationRepository conversationRepository,
                            MessageRepository messageRepository,
                            DailyEmotionLogRepository dailyEmotionLogRepository,
                            DailyEmotionLogService dailyEmotionLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.dailyEmotionLogRepository = dailyEmotionLogRepository;
        this.dailyEmotionLogService = dailyEmotionLogService;
    }
    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> getMessagesForConversation(String conversationId) {
        logger.info("Admin request: Get messages for ConversationID: {}", conversationId);

        // 1. Kiểm tra xem cuộc hội thoại có tồn tại không
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> {
                    logger.warn("Admin request failed: Conversation with ID {} not found.", conversationId);
                    return new ResourceNotFoundException("Không tìm thấy cuộc hội thoại với ID: " + conversationId);
                });

        // 2. Lấy tất cả tin nhắn của cuộc hội thoại đó (admin không bị giới hạn bởi userId sở hữu)
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        logger.info("Found {} messages for ConversationID: {}", messages.size(), conversationId);

        return messages.stream()
                .map(this::mapMessageToDtoInternal) // Sử dụng một helper mapper
                .collect(Collectors.toList());
    }

    // Helper method để kiểm tra User tồn tại (có thể dùng chung nếu bạn có lớp tiện ích)
    private User findUserByIdOrThrow(String userId, String operation) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("{} failed: User with ID {} not found.", operation, userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserViewDto> getAllUsers() {
        logger.info("Admin request: Get all users");
        return userRepository.findAll().stream()
                .map(this::mapUserToAdminUserViewDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserViewDto getUserByIdForAdmin(String userId) {
        logger.info("Admin request: Get user by ID: {}", userId);
        User user = findUserByIdOrThrow(userId, "Get user by ID for admin");
        return mapUserToAdminUserViewDto(user);
    }

    @Override
    @Transactional
    public AdminUserViewDto updateUserByAdmin(String userId, AdminUserUpdateRequestDto updateRequest) {
        logger.info("Admin request: Update user by ID: {}", userId);
        User user = findUserByIdOrThrow(userId, "Update user by admin");

        boolean updated = false;

        if (StringUtils.hasText(updateRequest.getUsername()) && !user.getUsername().equals(updateRequest.getUsername())) {
            if (userRepository.existsByUsername(updateRequest.getUsername())) {
                logger.warn("Admin user update failed for UserID: {}. Username '{}' already exists.", userId, updateRequest.getUsername());
                // SỬ DỤNG UserAlreadyExistsException
                throw new UserAlreadyExistsException("Lỗi: Tên đăng nhập '" + updateRequest.getUsername() + "' đã được sử dụng bởi người dùng khác!");
            }
            user.setUsername(updateRequest.getUsername());
            updated = true;
            logger.info("Admin updated username for UserID: {} to: {}", userId, updateRequest.getUsername());
        }

        if (StringUtils.hasText(updateRequest.getPassword())) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
            updated = true;
            logger.info("Admin reset password for UserID: {}", userId);
        }

        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl().isBlank() ? null : updateRequest.getAvatarUrl());
            updated = true;
            logger.info("Admin updated avatar URL for UserID: {}", userId);
        }

        if (updateRequest.getRoles() != null) { // Không kiểm tra isEmpty() để cho phép xóa hết roles nếu gửi set rỗng
            Set<Role> newRoles = new HashSet<>();
            if (!updateRequest.getRoles().isEmpty()) {
                for (String roleNameStr : updateRequest.getRoles()) {
                    try {
                        ERole eRole = ERole.valueOf(roleNameStr.trim().toUpperCase());
                        Role role = roleRepository.findByName(eRole)
                                // SỬ DỤNG BadRequestException cho role không hợp lệ/không tồn tại
                                .orElseThrow(() -> {
                                    logger.warn("Admin user update failed for UserID: {}. Role '{}' not found.", userId, roleNameStr);
                                    return new BadRequestException("Lỗi: Vai trò '" + roleNameStr + "' không hợp lệ hoặc không tồn tại.");
                                });
                        newRoles.add(role);
                    } catch (IllegalArgumentException e) {
                        logger.warn("Admin user update failed for UserID: {}. Role name '{}' is not a valid ERole.", userId, roleNameStr);
                        // SỬ DỤNG BadRequestException cho tên role không đúng định dạng Enum
                        throw new BadRequestException("Lỗi: Tên vai trò '" + roleNameStr + "' không được hỗ trợ hoặc không đúng định dạng.");
                    }
                }
            }
            user.setRoles(newRoles); // Gán set rỗng nếu updateRequest.getRoles() rỗng và không null
            updated = true;
            logger.info("Admin updated roles for UserID: {} to: {}", userId, updateRequest.getRoles());
        }

        if (updated) {
            user.setUpdatedAt(LocalDateTime.now());
            User savedUser = userRepository.save(user);
            logger.info("User profile updated by admin for UserID: {}", userId);
            return mapUserToAdminUserViewDto(savedUser);
        }
        logger.info("No changes applied by admin for UserID: {}", userId);
        return mapUserToAdminUserViewDto(user);
    }

    @Override
    @Transactional
    public void deleteUserAndAssociatedData(String userId) {
        logger.warn("Admin request: Delete user and associated data for UserID: {}", userId);
        User user = findUserByIdOrThrow(userId, "Delete user and associated data");

        logger.info("Deleting daily emotion logs for UserID: {}", userId);
        dailyEmotionLogRepository.deleteAllByUserId(userId);

        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (!conversations.isEmpty()) {
            logger.info("Found {} conversations for UserID: {}. Deleting messages and conversations...", conversations.size(), userId);
            for (Conversation conversation : conversations) {
                logger.debug("Deleting messages for ConversationID: {}", conversation.getId());
                messageRepository.deleteAllByConversationId(conversation.getId());
            }
            conversationRepository.deleteAll(conversations); // Xóa hết conversation của user
            logger.info("Deleted all conversations for UserID: {}", userId);
        } else {
            logger.info("No conversations found for UserID: {}", userId);
        }

        userRepository.delete(user);
        logger.info("User with ID: {} and all associated data deleted successfully by admin.", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversationsForAdmin(String targetUserId) {
        findUserByIdOrThrow(targetUserId, "Get user conversations for admin"); // Kiểm tra targetUser tồn tại
        logger.info("Admin request: Get conversations for target UserID: {}", targetUserId);

        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(targetUserId);
        return conversations.stream().map(this::mapConversationToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmotionStatsResponseDto getUserEmotionStatsForAdmin(String targetUserId, LocalDate startDate, LocalDate endDate) {
        findUserByIdOrThrow(targetUserId, "Get user emotion stats for admin"); // Kiểm tra targetUser tồn tại
        logger.info("Admin request: Get emotion stats for target UserID: {} from {} to {}", targetUserId, startDate, endDate);

        List<DailyEmotionLogDto> dailyLogs = dailyEmotionLogService.getEmotionLogsForPeriod(targetUserId, startDate, endDate);
        Map<String, Long> summary = dailyEmotionLogService.getEmotionStatsSummary(targetUserId, startDate, endDate);

        return new EmotionStatsResponseDto(dailyLogs, summary);
    }

    @Override
    @Transactional
    public AdminUserViewDto createUserByAdmin(AdminUserUpdateRequestDto createRequest) {
        logger.info("Admin request: Create new user");

        // Kiểm tra nếu tên đăng nhập đã tồn tại
        if (userRepository.existsByUsername(createRequest.getUsername())) {
            throw new UserAlreadyExistsException("Lỗi: Tên đăng nhập '" + createRequest.getUsername() + "' đã được sử dụng!");
        }

        // Tạo đối tượng người dùng mới
        User newUser = new User(createRequest.getUsername(), passwordEncoder.encode(createRequest.getPassword()));
        newUser.setAvatarUrl(createRequest.getAvatarUrl());

        // Tạo các vai trò (nếu có) và gán cho người dùng
        Set<Role> roles = new HashSet<>();
        for (String roleNameStr : createRequest.getRoles()) {
            ERole eRole = ERole.valueOf(roleNameStr.trim().toUpperCase());
            Role role = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new BadRequestException("Lỗi: Vai trò '" + roleNameStr + "' không hợp lệ!"));
            roles.add(role);
        }
        newUser.setRoles(roles);

        // Lưu người dùng mới vào database
        User savedUser = userRepository.save(newUser);
        logger.info("New user created successfully: {}", savedUser.getUsername());

        return mapUserToAdminUserViewDto(savedUser);
    }
    private AdminUserViewDto mapUserToAdminUserViewDto(User user) {
        if (user == null) return null;
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        return new AdminUserViewDto(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                roleNames,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private ConversationDto mapConversationToDto(Conversation conversation) {
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
    private MessageDto mapMessageToDtoInternal(Message message) {
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