package com.mindcare.backend.service.interfaces;

import com.mindcare.backend.dto.auth.ForgotPasswordRequestDto;
import com.mindcare.backend.dto.auth.LoginRequest;
import com.mindcare.backend.dto.auth.JwtResponse;
import com.mindcare.backend.dto.auth.RegisterRequest;
import com.mindcare.backend.dto.response.MessageResponse;

public interface AuthService {
    // Đăng ký một người dùng mới.
    MessageResponse registerUser(RegisterRequest registerRequest);

    // Đăng nhập người dùng và tạo JWT.
    JwtResponse loginUser(LoginRequest loginRequest);

    /**
     * Xử lý yêu cầu đặt lại mật khẩu cho người dùng.
     * (Phiên bản đơn giản: không gửi email xác nhận)
     */
    MessageResponse forgotPassword(ForgotPasswordRequestDto forgotPasswordRequest);
}