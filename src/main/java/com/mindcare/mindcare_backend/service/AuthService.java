package com.mindcare.mindcare_backend.service;

import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<JwtResponse> login(LoginRequest loginRequest);
    ResponseEntity<String> register(RegisterRequest registerRequest);
    ResponseEntity<String> resetPassword(String email, String newPassword);
}
