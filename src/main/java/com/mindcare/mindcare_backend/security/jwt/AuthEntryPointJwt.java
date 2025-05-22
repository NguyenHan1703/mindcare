package com.mindcare.mindcare_backend.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

// AuthEntryPointJwt xử lý các lỗi AuthenticationException.
// Trả về một response lỗi 401 Unauthorized.

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        logger.error("Lỗi xác thực không thành công: {}", authException.getMessage());
        // Ghi log chi tiết hơn về request nếu cần cho việc debug
        // logger.error("Yêu cầu không được phép đến: {}", request.getServletPath());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE); // Đặt kiểu content là JSON
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);   // Đặt HTTP status là 401

        // Tạo một body JSON cho response lỗi
        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", authException.getMessage()); // Thông điệp lỗi từ exception
        body.put("path", request.getServletPath());    // Đường dẫn API gây ra lỗi

        final ObjectMapper mapper = new ObjectMapper(); // Dùng ObjectMapper để ghi Map thành JSON
        mapper.writeValue(response.getOutputStream(), body); // Ghi JSON vào output stream của response
    }
}
