package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class UserRequest {
    private String userId;    // ID người dùng (null khi tạo mới)
    private String email;
    private String password;  // Chỉ dùng cho đăng ký hoặc đổi mật khẩu
    private String fullName;
    private Integer age;
    private String avatarUrl;
}
