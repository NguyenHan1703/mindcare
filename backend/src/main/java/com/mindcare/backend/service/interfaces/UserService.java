package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.user.ChangePasswordRequest;
import com.mindcare.backend.dto.user.UserProfileDto;
import com.mindcare.backend.dto.user.UserUpdateProfileRequestDto;

public interface UserService {

    // Lấy thông tin hồ sơ của người dùng dựa trên userId.
    UserProfileDto getUserProfile(String userId);

    // Cập nhật thông tin hồ sơ của người dùng.
    UserProfileDto updateUserProfile(String userId, UserUpdateProfileRequestDto updateRequest);

    // Thay đổi mật khẩu cho người dùng.
    void changePassword(String userId, ChangePasswordRequest changePasswordRequest);
}