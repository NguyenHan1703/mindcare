package com.mindcare.mindcare_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private String userId;
    private String email;
    private String fullName;
    private Integer age;
    private String avatarUrl;
    private String role;     // USER hoặc ADMIN
    private String status;   // Trạng thái tài khoản (active, banned, ...)
}
