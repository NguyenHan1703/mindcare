package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.request.AdminUserCreateRequest;
import com.mindcare.mindcare_backend.dto.request.AdminUserUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.AdminUserViewResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.exception.BadRequestException;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.ERole;
import com.mindcare.mindcare_backend.model.Role;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.ConversationRepository;
import com.mindcare.mindcare_backend.repository.DailyEmotionLogRepository;
import com.mindcare.mindcare_backend.repository.MessageRepository;
import com.mindcare.mindcare_backend.repository.RoleRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
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

    @Autowired
    public AdminServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            ConversationRepository conversationRepository,
                            MessageRepository messageRepository,
                            DailyEmotionLogRepository dailyEmotionLogRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.dailyEmotionLogRepository = dailyEmotionLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserViewResponse> getAllUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable); // Không cần lọc active nữa
        logger.info("Admin lấy danh sách user, trang: {}, kích thước: {}", pageable.getPageNumber(), pageable.getPageSize());
        return usersPage.map(this::mapToAdminUserViewResponse);
    }

    @Override
    @Transactional
    public UserResponse createUserByAdmin(AdminUserCreateRequest createRequest) {
        if (userRepository.existsByUsername(createRequest.getUsername())) {
            throw new BadRequestException("Tên đăng nhập \"" + createRequest.getUsername() + "\" đã được sử dụng!");
        }
        if (userRepository.existsByEmail(createRequest.getEmail())) {
            throw new BadRequestException("Địa chỉ email \"" + createRequest.getEmail() + "\" đã được sử dụng!");
        }

        User user = new User(
                createRequest.getUsername(),
                createRequest.getEmail(),
                passwordEncoder.encode(createRequest.getPassword())
        );
        user.setDisplayName(StringUtils.hasText(createRequest.getDisplayName()) ? createRequest.getDisplayName() : createRequest.getUsername());
        user.setAvatarUrl(createRequest.getAvatarUrl());

        Set<Role> roles = new HashSet<>();
        if (createRequest.getRoles() == null || createRequest.getRoles().isEmpty()) {
            // Gán vai trò USER mặc định nếu admin không chỉ định
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò ROLE_USER không tồn tại."));
            roles.add(userRole);
        } else {
            createRequest.getRoles().forEach(roleNameStr -> {
                try {
                    ERole eRole = ERole.valueOf(roleNameStr.toUpperCase());
                    Role role = roleRepository.findByName(eRole)
                            .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ: " + roleNameStr));
                    roles.add(role);
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Vai trò không hợp lệ: " + roleNameStr);
                }
            });
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        logger.info("Admin đã tạo người dùng mới: {}", savedUser.getUsername());
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByIdByAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        logger.info("Admin lấy thông tin chi tiết User ID: {}", userId);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserByAdmin(String userId, AdminUserUpdateRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (StringUtils.hasText(updateRequest.getEmail()) && !updateRequest.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail()) &&
                    !userRepository.findByEmail(updateRequest.getEmail()).get().getId().equals(userId) ) {
                // Kiểm tra xem email mới có bị trùng với user khác không (trừ chính user này)
                throw new BadRequestException("Địa chỉ email \"" + updateRequest.getEmail() + "\" đã được người khác sử dụng.");
            }
            user.setEmail(updateRequest.getEmail());
            logger.info("Admin cập nhật email cho User ID: {} thành: {}", userId, updateRequest.getEmail());
        }

        if (StringUtils.hasText(updateRequest.getDisplayName())) {
            user.setDisplayName(updateRequest.getDisplayName());
            logger.info("Admin cập nhật displayName cho User ID: {}", userId);
        }
        if (StringUtils.hasText(updateRequest.getAvatarUrl())) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
            logger.info("Admin cập nhật avatarUrl cho User ID: {}", userId);
        }
        if (StringUtils.hasText(updateRequest.getPassword())) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
            logger.info("Admin cập nhật mật khẩu cho User ID: {}", userId);
        }
        if (updateRequest.getRoles() != null && !updateRequest.getRoles().isEmpty()) {
            Set<Role> newRoles = new HashSet<>();
            updateRequest.getRoles().forEach(roleNameStr -> {
                try {
                    ERole eRole = ERole.valueOf(roleNameStr.toUpperCase());
                    Role role = roleRepository.findByName(eRole)
                            .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ: " + roleNameStr));
                    newRoles.add(role);
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Vai trò không hợp lệ: " + roleNameStr);
                }
            });
            user.setRoles(newRoles);
            logger.info("Admin cập nhật vai trò cho User ID: {}", userId);
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Xóa các DailyEmotionLog của user
        dailyEmotionLogRepository.deleteAllByUserId(userId);
        logger.info("Đã xóa DailyEmotionLog cho User ID: {}", userId);

        // 2. Xóa các Conversation và Message liên quan
        // Lấy danh sách conversation IDs của user
        conversationRepository.findByUserIdOrderByLastMessageAtDesc(userId).forEach(conversation -> {
            messageRepository.deleteAllByConversationId(conversation.getId());
            logger.info("Đã xóa Messages cho Conversation ID: {}", conversation.getId());
            conversationRepository.deleteById(conversation.getId());
            logger.info("Đã xóa Conversation ID: {}", conversation.getId());
        });
        // Hoặc nếu có deleteAllByUserId trực tiếp trong conversationRepository
        // conversationRepository.deleteAllByUserId(userId);

        // 3. Xóa User
        userRepository.delete(user);
        logger.info("Admin đã xóa vĩnh viễn User ID: {}", userId);
    }


    // Helper methods to map to DTOs
    private AdminUserViewResponse mapToAdminUserViewResponse(User user) {
        long conversationCount = conversationRepository.countByUser(user);
        return new AdminUserViewResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()),
                conversationCount,
                user.getCreatedAt()
        );
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet())
        );
    }
}