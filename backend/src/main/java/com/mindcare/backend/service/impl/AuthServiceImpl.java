package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.auth.ForgotPasswordRequestDto;
import com.mindcare.backend.dto.auth.LoginRequest;
import com.mindcare.backend.dto.auth.JwtResponse;
import com.mindcare.backend.dto.auth.RegisterRequest;
import com.mindcare.backend.dto.response.MessageResponse;
import com.mindcare.backend.enums.ERole;
import com.mindcare.backend.exception.BadRequestException;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.exception.UserAlreadyExistsException;
import com.mindcare.backend.model.Role;
import com.mindcare.backend.model.User;
import com.mindcare.backend.repository.RoleRepository;
import com.mindcare.backend.repository.UserRepository;
import com.mindcare.backend.security.jwt.JwtUtils;
import com.mindcare.backend.security.services.UserDetailsImpl;
import com.mindcare.backend.service.interfaces.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException; // Để bắt lỗi xác thực cụ thể
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        logger.info("Attempting to register user: {}", registerRequest.getUsername());
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            logger.warn("Registration failed: Username '{}' is already taken.", registerRequest.getUsername());
            // SỬ DỤNG UserAlreadyExistsException
            throw new UserAlreadyExistsException("Lỗi: Tên đăng nhập '" + registerRequest.getUsername() + "' đã được sử dụng!");
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword())
        );

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                // SỬ DỤNG ResourceNotFoundException
                .orElseThrow(() -> {
                    logger.error("Critical error: Role 'ROLE_USER' is not found in the database. Please initialize roles.");
                    return new ResourceNotFoundException("Lỗi hệ thống: Vai trò người dùng mặc định không được cấu hình.");
                });
        roles.add(userRole);
        user.setRoles(roles);

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {} (ID: {})", savedUser.getUsername(), savedUser.getId());
        return new MessageResponse("Người dùng đã được đăng ký thành công!");
    }

    @Override
    public JwtResponse loginUser(LoginRequest loginRequest) {
        logger.info("Attempting to authenticate user: {}", loginRequest.getUsername());
        try {
            // 1. Xác thực người dùng bằng AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            // 2. Nếu xác thực thành công, đặt thông tin xác thực vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Tạo JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);

            // 4. Lấy thông tin UserDetails từ đối tượng Authentication
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // 5. Lấy danh sách các vai trò (roles)
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            // 6. Lấy thông tin avatarUrl từ User entity (nếu có)
            User userEntity = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User với ID: " + userDetails.getId() + " sau khi xác thực."));

            logger.info("User authenticated successfully: {}", userDetails.getUsername());
            return new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getAvatarUrl(),
                    roles
            );
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            throw new BadRequestException("Xác thực thất bại: Tên đăng nhập hoặc mật khẩu không đúng.");
        } catch (Exception e) {
            logger.error("Lỗi không xác định trong quá trình đăng nhập cho user {}: {}", loginRequest.getUsername(), e.getMessage(), e);
            throw e; // Ném lại để GlobalExceptionHandler xử lý như một lỗi server 500
        }
    }
    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequestDto forgotPasswordRequest) {
        String username = forgotPasswordRequest.getUsername();
        String newPassword = forgotPasswordRequest.getNewPassword();

        logger.info("Attempting to reset password for username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("Forgot password attempt for non-existent username: {}", username);
                    return new ResourceNotFoundException("Lỗi: Tên đăng nhập '" + username + "' không tồn tại.");
                });

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        logger.info("Password reset successfully for username: {}", username);
        return new MessageResponse("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.");
    }
}