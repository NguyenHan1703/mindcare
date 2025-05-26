package com.mindcare.backend.controller;

import com.mindcare.backend.dto.auth.ForgotPasswordRequestDto;
import com.mindcare.backend.dto.auth.LoginRequest;
import com.mindcare.backend.dto.auth.JwtResponse;
import com.mindcare.backend.dto.auth.RegisterRequest;
import com.mindcare.backend.dto.response.MessageResponse; // Import MessageResponse
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.exception.BadRequestException;
import com.mindcare.backend.service.interfaces.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600) // Cho phép CORS từ mọi nguồn, có thể cấu hình chi tiết hơn
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.loginUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (AuthenticationException e) {
            // Lỗi xác thực (sai username/password) thường được xử lý bởi Spring Security
            // và AuthEntryPointJwt sẽ trả về 401.
            // Tuy nhiên, nếu bạn muốn bắt và trả về thông điệp cụ thể hơn từ controller:
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Lỗi: Sai tên đăng nhập hoặc mật khẩu!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Đã có lỗi xảy ra trong quá trình đăng nhập."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.registerUser(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponse("Người dùng đã được đăng ký thành công!"));
        } catch (RuntimeException e) {
            // Bắt các lỗi như username đã tồn tại hoặc role không tìm thấy từ AuthService
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Đã có lỗi xảy ra trong quá trình đăng ký."));
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto forgotPasswordRequest) {
        logger.info("Received forgot password request for username: {}", forgotPasswordRequest.getUsername());
        try {
            authService.forgotPassword(forgotPasswordRequest);
            return ResponseEntity.ok(new MessageResponse("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại."));
        } catch (ResourceNotFoundException e) {
            logger.warn("Đặt lại thất bại: {}", e.getMessage());
            // GlobalExceptionHandler sẽ bắt ResourceNotFoundException và trả về 404
            // nhưng nếu bạn muốn tùy chỉnh message ở đây:
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
        // Bỏ comment nếu bạn có các validation khác trong service có thể ném BadRequestException
        catch (BadRequestException e) {
            logger.warn("Forgot password failed due to bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
        catch (Exception e) {
            logger.error("Internal server error during forgot password for username {}: {}", forgotPasswordRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Đã có lỗi xảy ra trong quá trình đặt lại mật khẩu."));
        }
    }
}