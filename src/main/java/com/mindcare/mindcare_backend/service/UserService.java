package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.request.UserProfileUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile; // Cho việc upload avatar

public interface UserService {

    // Lấy thông tin hồ sơ của người dùng đang được xác thực.
    UserResponse getUserProfile(String userId);

    //Cập nhật thông tin hồ sơ của người dùng đang được xác thực.
    UserResponse updateUserProfile(String userId, UserProfileUpdateRequest updateRequest, MultipartFile avatarFile);
}