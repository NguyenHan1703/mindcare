package com.mindcare.backend.config; // Hoặc package bạn chọn

import com.mindcare.backend.enums.ERole;
import com.mindcare.backend.model.Role;
import com.mindcare.backend.model.User;
import com.mindcare.backend.repository.RoleRepository;
import com.mindcare.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.username}")
    private String adminUsername;

    @Value("${admin.default.password}")
    private String adminPassword;

    // @Value("${admin.default.avatarUrl:#{null}}") // Lấy avatarUrl, nếu không có thì là null
    // private String adminAvatarUrl;


    @Autowired
    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Data Initializer running...");

        // 1. Tạo các Roles nếu chưa tồn tại
        createRoleIfNotFound(ERole.ROLE_USER);
        Role adminRoleEntity = createRoleIfNotFound(ERole.ROLE_ADMIN);
        Role userRoleEntity = roleRepository.findByName(ERole.ROLE_USER).orElse(null); // Lấy lại ROLE_USER để gán cho admin

        // 2. Tạo tài khoản Admin mặc định nếu chưa tồn tại
        if (!userRepository.existsByUsername(adminUsername)) {
            User adminUser = new User();
            adminUser.setUsername(adminUsername);
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            // adminUser.setAvatarUrl(adminAvatarUrl); // Nếu có

            Set<Role> roles = new HashSet<>();
            if (adminRoleEntity != null) {
                roles.add(adminRoleEntity);
            }
            if (userRoleEntity != null) { // Admin cũng có thể là một USER bình thường
                roles.add(userRoleEntity);
            }
            adminUser.setRoles(roles);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            userRepository.save(adminUser);
            logger.info("Default admin account created successfully with username: {}", adminUsername);
        } else {
            logger.info("Default admin account with username: {} already exists.", adminUsername);
        }
        logger.info("Data Initializer finished.");
    }

    private Role createRoleIfNotFound(ERole roleName) {
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isEmpty()) {
            Role newRole = new Role(roleName);
            Role savedRole = roleRepository.save(newRole);
            logger.info("Role {} created.", roleName);
            return savedRole;
        } else {
            logger.info("Role {} already exists.", roleName);
            return roleOpt.get();
        }
    }
}