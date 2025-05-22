package com.mindcare.mindcare_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary // Đánh dấu là ObjectMapper chính sẽ được sử dụng
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        // Đăng ký module để hỗ trợ serialize/deserialize Java Time API (LocalDate, LocalDateTime, ...)
        objectMapper.registerModule(new JavaTimeModule());
        // Cấu hình không ghi Dates như Timestamps (số mili giây) mà ghi theo định dạng ISO chuẩn
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Các cấu hình khác của Jackson nếu bạn cần
        // objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")); // Ví dụ định dạng ngày giờ cụ thể
        return objectMapper;
    }
}