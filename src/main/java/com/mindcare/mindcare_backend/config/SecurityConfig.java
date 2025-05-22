package com.mindcare.mindcare_backend.config;

import com.mindcare.mindcare_backend.security.jwt.AuthEntryPointJwt;
import com.mindcare.mindcare_backend.security.jwt.AuthTokenFilter;
import com.mindcare.mindcare_backend.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity // Kích hoạt Spring Security cho ứng dụng web
@EnableMethodSecurity // Kích hoạt bảo mật ở cấp độ phương thức (ví dụ: @PreAuthorize)

public class SecurityConfig {
    @Autowired
    private UserDetailsServiceImpl userDetailsService; // Dịch vụ tải thông tin người dùng

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler; // Xử lý lỗi khi truy cập trái phép

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        // Bean này sẽ được tạo và sử dụng trong SecurityFilterChain
        // Chúng ta sẽ viết lớp AuthTokenFilter sau
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // Cung cấp cơ chế xác thực dựa trên UserDetailsService và PasswordEncoder
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Cung cấp UserDetailsService
        authProvider.setPasswordEncoder(passwordEncoder());     // Cung cấp PasswordEncoder
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        // Quản lý quá trình xác thực, cần thiết cho việc đăng nhập
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Sử dụng BCrypt để mã hóa mật khẩu
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF vì chúng ta dùng JWT (stateless)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) // Xử lý lỗi xác thực
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không tạo session (stateless)
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**").permitAll()       // Cho phép tất cả truy cập vào các API xác thực
                                .requestMatchers("/api/test/all").permitAll()
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                .requestMatchers("/api/users/me/**").hasRole("USER") // Ví dụ, nếu muốn chỉ USER mới truy cập /me
                                .anyRequest().authenticated()
                );

        // Thêm DaoAuthenticationProvider vào HttpSecurity
        http.authenticationProvider(authenticationProvider());

        // Thêm AuthTokenFilter vào trước UsernamePasswordAuthenticationFilter
        // để xử lý JWT token trước khi Spring Security xử lý username/password
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
