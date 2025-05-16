package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.security.JwtProvider;
import com.mindcare.mindcare_backend.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<JwtResponse> login(LoginRequest loginRequest) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        var user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
        String token = jwtProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtResponse(token, user.getId(), user.getEmail(), user.getRole().name()));
    }

    @Override
    public ResponseEntity<String> register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());
        user.setRole(registerRequest.getRole());
        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công!");
    }

    @Override
    public ResponseEntity<String> resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
    }
}
