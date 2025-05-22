package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.request.LoginRequest;
import com.mindcare.mindcare_backend.dto.request.RegisterRequest;
import com.mindcare.mindcare_backend.dto.response.JwtResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import org.springframework.security.core.AuthenticationException;

public interface AuthService {
    // Đăng ký một người dùng mới vào hệ thống
    UserResponse registerUser(RegisterRequest registerRequest);
    // Xác thực người dùng và tạo JWT token nếu thành công.
    JwtResponse loginUser(LoginRequest loginRequest) throws AuthenticationException;
}
