package com.mindcare.mindcare_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // (Tùy chọn) Lấy danh sách các origin được phép từ application.properties
    // Ví dụ: mindcare.app.cors.allowedOrigins=http://localhost:8081,http://localhost:19006,https://your-app-domain.com
    // @Value("${mindcare.app.cors.allowedOrigins:http://localhost:8081,http://localhost:19006}")
    // private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng CORS cho tất cả các API có tiền tố /api/**
                // .allowedOrigins(allowedOrigins) // Sử dụng danh sách từ properties
                .allowedOrigins(
                        "http://localhost:8081", // Expo Go Web
                        "http://localhost:19000", // Metro Bundler
                        "http://localhost:19001", // Metro Bundler
                        "http://localhost:19002", // Metro Bundler
                        "exp://*",                // Cho Expo Go trên thiết bị thật (cần kiểm tra kỹ địa chỉ IP của máy dev)
                        " http://192.168.1.100:8081"
                        // Thêm domain của frontend khi deploy production
                        // "https://your-frontend-app.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Các phương thức HTTP được phép
                .allowedHeaders("*")    // Cho phép tất cả các header
                .allowCredentials(true) // Cho phép gửi cookie hoặc thông tin xác thực (nếu có)
                .maxAge(3600);          // Thời gian pre-flight request được cache (giây)
    }
}