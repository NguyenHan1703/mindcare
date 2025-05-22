package com.mindcare.mindcare_backend.config; // Hoặc package phù hợp với dự án của bạn

import com.mindcare.mindcare_backend.model.ERole;
import com.mindcare.mindcare_backend.model.Role;
import com.mindcare.mindcare_backend.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order; // Để kiểm soát thứ tự thực thi nếu có nhiều CommandLineRunner

@Configuration
@Order(1) // (Tùy chọn) Đặt thứ tự nếu bạn có nhiều CommandLineRunner và muốn cái này chạy sớm
public class DataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    /**
     * Bean CommandLineRunner này sẽ được Spring Boot tự động thực thi
     * sau khi ApplicationContext đã được tải.
     * Nó dùng để khởi tạo các dữ liệu cần thiết ban đầu cho ứng dụng,
     * ví dụ như các vai trò (Roles).
     *
     * @param roleRepository Repository để tương tác với collection 'roles'.
     * @return một đối tượng CommandLineRunner.
     */
    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository) {
        return args -> {
            logger.info("Bắt đầu quá trình khởi tạo dữ liệu (Data Seeding)...");

            // Khởi tạo ROLE_USER
            if (!roleRepository.existsByName(ERole.ROLE_USER)) {
                try {
                    roleRepository.save(new Role(ERole.ROLE_USER));
                    logger.info("Đã tạo thành công vai trò: {}", ERole.ROLE_USER);
                } catch (Exception e) {
                    logger.error("Lỗi khi tạo vai trò {}: {}", ERole.ROLE_USER, e.getMessage());
                }
            } else {
                logger.info("Vai trò {} đã tồn tại trong CSDL.", ERole.ROLE_USER);
            }

            // Khởi tạo ROLE_ADMIN
            if (!roleRepository.existsByName(ERole.ROLE_ADMIN)) {
                try {
                    roleRepository.save(new Role(ERole.ROLE_ADMIN));
                    logger.info("Đã tạo thành công vai trò: {}", ERole.ROLE_ADMIN);
                } catch (Exception e) {
                    logger.error("Lỗi khi tạo vai trò {}: {}", ERole.ROLE_ADMIN, e.getMessage());
                }
            } else {
                logger.info("Vai trò {} đã tồn tại trong CSDL.", ERole.ROLE_ADMIN);
            }

            // Bạn có thể thêm logic để seed các dữ liệu khác ở đây nếu cần,
            // ví dụ như tạo một tài khoản Admin mặc định.

            logger.info("Quá trình khởi tạo dữ liệu đã hoàn tất.");
        };
    }

    // (Tùy chọn) Ví dụ tạo tài khoản Admin mặc định
    /*
    @Autowired
    private UserRepository userRepository; // Bạn cần inject UserRepository nếu muốn seed user
    @Autowired
    private PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    @Bean
    @Order(2) // Chạy sau khi Role đã được tạo
    CommandLineRunner initAdminUser(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = "admin";
            if (!userRepository.existsByUsername(adminUsername)) {
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò ROLE_ADMIN không tìm thấy để tạo admin user."));

                User adminUser = new User();
                adminUser.setUsername(adminUsername);
                adminUser.setEmail("admin@mindcare.com"); // Thay bằng email thực của bạn
                adminUser.setPassword(passwordEncoder.encode("admin123")); // Thay bằng mật khẩu mạnh
                adminUser.setDisplayName("MindCare Administrator");
                adminUser.setRoles(Set.of(adminRole));
                // adminUser.setActive(true); // Nếu bạn còn dùng trường active

                userRepository.save(adminUser);
                logger.info("Đã tạo tài khoản Admin mặc định: {}", adminUsername);
            } else {
                logger.info("Tài khoản Admin '{}' đã tồn tại.", adminUsername);
            }
        };
    }
    */
}