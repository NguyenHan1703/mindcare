package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.request.AdminUserCreateRequest;
import com.mindcare.mindcare_backend.dto.request.AdminUserUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.AdminUserViewResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    // Admin lấy danh sách tất cả người dùng (có phân trang).
    Page<AdminUserViewResponse> getAllUsers(Pageable pageable);

    // Admin tạo một người dùng mới.
    UserResponse createUserByAdmin(AdminUserCreateRequest createRequest);

    // Admin lấy thông tin chi tiết của một người dùng.
    UserResponse getUserByIdByAdmin(String userId);

    // Admin cập nhật thông tin của một người dùng.
    UserResponse updateUserByAdmin(String userId, AdminUserUpdateRequest updateRequest);

    // Admin xóa một người dùng
    void deleteUserByAdmin(String userId);
}