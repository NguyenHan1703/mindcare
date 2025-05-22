package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.request.LoginRequest;
import com.mindcare.mindcare_backend.dto.request.RegisterRequest;
import com.mindcare.mindcare_backend.dto.response.GenericApiResponse;
import com.mindcare.mindcare_backend.dto.response.JwtResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<GenericApiResponse<UserResponse>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        UserResponse registeredUser = authService.registerUser(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(GenericApiResponse.success(registeredUser, "Đăng ký tài khoản thành công!"));
    }

    // API endpoint để đăng nhập người dùng.

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}