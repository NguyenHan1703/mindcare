package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.user.ChangePasswordRequest;
import com.mindcare.backend.dto.user.UserProfileDto;
import com.mindcare.backend.dto.user.UserUpdateProfileRequestDto;
import com.mindcare.backend.exception.BadRequestException;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.exception.UserAlreadyExistsException;
import com.mindcare.backend.model.Role;
import com.mindcare.backend.model.User;
import com.mindcare.backend.repository.UserRepository;
import com.mindcare.backend.service.interfaces.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String userId) {
        logger.debug("Fetching profile for UserID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("UserProfile requested for non-existent UserID: {}", userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId);
                });
        return mapUserToUserProfileDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(String userId, UserUpdateProfileRequestDto updateRequest) {
        logger.info("Updating profile for UserID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Update profile attempt for non-existent UserID: {}", userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId);
                });

        boolean updated = false;

        // Cập nhật username nếu được cung cấp và khác với username hiện tại
        if (StringUtils.hasText(updateRequest.getUsername()) && !user.getUsername().equals(updateRequest.getUsername())) {
            logger.debug("Attempting to update username for UserID: {} to: {}", userId, updateRequest.getUsername());
            if (userRepository.existsByUsername(updateRequest.getUsername())) {
                logger.warn("Username update failed for UserID: {}. Username '{}' already exists.", userId, updateRequest.getUsername());
                // SỬ DỤNG UserAlreadyExistsException
                throw new UserAlreadyExistsException("Lỗi: Tên đăng nhập '" + updateRequest.getUsername() + "' đã được sử dụng!");
            }
            user.setUsername(updateRequest.getUsername());
            updated = true;
            logger.info("Username updated for UserID: {} to: {}", userId, updateRequest.getUsername());
        }

        // Cập nhật avatarUrl nếu được cung cấp
        // (cho phép avatarUrl là null để giữ nguyên, hoặc chuỗi rỗng để xóa)
        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl().isBlank() ? null : updateRequest.getAvatarUrl());
            updated = true;
            logger.info("Avatar URL updated for UserID: {}. New URL: '{}'", userId, user.getAvatarUrl());
        }

        if (updated) {
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            logger.info("Profile updated successfully for UserID: {}", userId);
        } else {
            logger.info("No profile changes detected for UserID: {}", userId);
        }

        return mapUserToUserProfileDto(user); // Trả về profile (có thể đã cập nhật hoặc chưa)
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest changePasswordRequest) {
        logger.info("Attempting to change password for UserID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Change password attempt for non-existent UserID: {}", userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId);
                });

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            logger.warn("Incorrect old password for UserID: {}", userId);
            // SỬ DỤNG BadRequestException
            throw new BadRequestException("Mật khẩu cũ không chính xác.");
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp không
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmNewPassword())) {
            logger.warn("New password and confirm password do not match for UserID: {}", userId);
            // SỬ DỤNG BadRequestException
            throw new BadRequestException("Mật khẩu mới và xác nhận mật khẩu mới không khớp.");
        }

        // Cập nhật mật khẩu mới đã mã hóa
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logger.info("Password changed successfully for UserID: {}", userId);
    }

    // Phương thức private helper để map User entity sang UserProfileDto
    private UserProfileDto mapUserToUserProfileDto(User user) {
        if (user == null) {
            // Trường hợp này không nên xảy ra nếu orElseThrow() hoạt động đúng
            logger.error("mapUserToUserProfileDto called with null user object.");
            throw new ResourceNotFoundException("Không thể tìm thấy thông tin người dùng để hiển thị.");
        }
        List<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                roleNames
        );
    }
}