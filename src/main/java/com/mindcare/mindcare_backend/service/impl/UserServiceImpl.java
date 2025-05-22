package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.request.UserProfileUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.exception.BadRequestException;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.service.UserService;
//import com.mindcare.mindcare_backend.service.FileStorageService; // (Tùy chọn) Service để lưu trữ file avatar
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // Helper của Spring để kiểm tra String
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    // private final FileStorageService fileStorageService; // Inject nếu có dịch vụ lưu file riêng

    @Autowired
    public UserServiceImpl(UserRepository userRepository /*, FileStorageService fileStorageService */) {
        this.userRepository = userRepository;
        // this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Yêu cầu lấy profile cho User ID không tồn tại: {}", userId);
                    return new ResourceNotFoundException("User", "id", userId);
                });
        logger.info("Lấy thành công profile cho User ID: {}", userId);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(String userId, UserProfileUpdateRequest updateRequest, MultipartFile avatarFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Yêu cầu cập nhật profile cho User ID không tồn tại: {}", userId);
                    return new ResourceNotFoundException("User", "id", userId);
                });

        boolean updated = false;

        // Cập nhật displayName nếu được cung cấp và khác với giá trị hiện tại
        if (updateRequest.getDisplayName() != null &&
                StringUtils.hasText(updateRequest.getDisplayName()) &&
                !updateRequest.getDisplayName().equals(user.getDisplayName())) {
            // (Tùy chọn) Kiểm tra xem displayName mới có bị trùng với người khác không
            // if (userRepository.existsByDisplayNameAndIdNot(updateRequest.getDisplayName(), userId)) {
            //     throw new BadRequestException("Tên hiển thị \"" + updateRequest.getDisplayName() + "\" đã được người khác sử dụng.");
            // }
            user.setDisplayName(updateRequest.getDisplayName());
            updated = true;
            logger.info("User ID: {} cập nhật displayName thành: {}", userId, updateRequest.getDisplayName());
        }

        // Xử lý avatar
        if (avatarFile != null && !avatarFile.isEmpty()) {
            // Logic để lưu file avatar mới (ví dụ: lên cloud storage hoặc server)
            // String newAvatarUrl = fileStorageService.storeFile(avatarFile, userId); // Ví dụ
            // user.setAvatarUrl(newAvatarUrl);
            // updated = true;
            // logger.info("User ID: {} đã cập nhật avatar mới.", userId);
            // Tạm thời, chúng ta sẽ giả lập việc này bằng cách báo lỗi nếu chưa có FileStorageService
            logger.warn("User ID: {} cố gắng upload avatar nhưng FileStorageService chưa được triển khai.", userId);
            // Hoặc nếu bạn cho phép cập nhật URL trực tiếp và avatarFile là null, thì dùng avatarUrl từ DTO
        } else if (updateRequest.getAvatarUrl() != null &&
                StringUtils.hasText(updateRequest.getAvatarUrl()) &&
                !updateRequest.getAvatarUrl().equals(user.getAvatarUrl())) {
            // Nếu không có file upload, nhưng có avatarUrl trong DTO và nó khác với URL hiện tại
            user.setAvatarUrl(updateRequest.getAvatarUrl());
            updated = true;
            logger.info("User ID: {} cập nhật avatarUrl thành: {}", userId, updateRequest.getAvatarUrl());
        }


        // (Tùy chọn) Xử lý cập nhật email (nếu cho phép và DTO có trường email)
         if (updateRequest.getEmail() != null &&
             StringUtils.hasText(updateRequest.getEmail()) &&
             !updateRequest.getEmail().equalsIgnoreCase(user.getEmail())) {
             if (userRepository.existsByEmailAndIdNot(updateRequest.getEmail(), userId)) {
                 throw new BadRequestException("Địa chỉ email \"" + updateRequest.getEmail() + "\" đã được người khác sử dụng.");
             }
             user.setEmail(updateRequest.getEmail());
             // Cần logic xác thực email mới ở đây (ví dụ: gửi email xác nhận)
             // Và có thể cần cập nhật lại trạng thái "verified" của email.
             updated = true;
             logger.info("User ID: {} cập nhật email thành: {}", userId, updateRequest.getEmail());
         }


        if (updated) {
            User updatedUser = userRepository.save(user);
            return mapToUserResponse(updatedUser);
        } else {
            // Không có gì thay đổi, trả về thông tin user hiện tại
            logger.info("Không có thông tin nào được cập nhật cho User ID: {}", userId);
            return mapToUserResponse(user);
        }
    }

    // Helper method để map User model sang UserResponse DTO
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