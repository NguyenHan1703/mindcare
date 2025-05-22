package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.request.LoginRequest;
import com.mindcare.mindcare_backend.dto.request.RegisterRequest;
import com.mindcare.mindcare_backend.dto.response.JwtResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.exception.BadRequestException;
import com.mindcare.mindcare_backend.model.ERole;
import com.mindcare.mindcare_backend.model.Role;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.RoleRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.security.jwt.JwtUtils;
import com.mindcare.mindcare_backend.security.services.UserDetailsImpl;
import com.mindcare.mindcare_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager; // Inject AuthenticationManager

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils; // Inject JwtUtils

    @Override
    @Transactional
    public UserResponse registerUser(RegisterRequest registerRequest) {
        // ... (logic đăng ký như đã viết ở phản hồi trước)
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Tên đăng nhập \"" + registerRequest.getUsername() + "\" đã được sử dụng!");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Địa chỉ email \"" + registerRequest.getEmail() + "\" đã được sử dụng!");
        }
        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword())
        );
        user.setDisplayName(registerRequest.getUsername()); // Gán tạm displayName bằng username

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò ROLE_USER không tồn tại trong CSDL."));
        roles.add(userRole);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        Set<String> roleNames = savedUser.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getDisplayName(),
                savedUser.getAvatarUrl(),
                roleNames
        );
    }

    @Override
    @Transactional
    public JwtResponse loginUser(LoginRequest loginRequest) throws AuthenticationException {
        // 1. Tạo đối tượng UsernamePasswordAuthenticationToken từ thông tin đăng nhập
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        // 2. Nếu xác thực thành công, Spring Security sẽ lưu đối tượng Authentication vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Tạo JWT token từ đối tượng Authentication
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 4. Lấy thông tin UserDetailsImpl từ đối tượng Authentication để xây dựng response
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 5. Lấy danh sách các quyền (roles) dưới dạng String
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 6. Tạo và trả về JwtResponse
        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getDisplayName(),
                userDetails.getAvatarUrl(),
                roles);
    }
}