package com.mindcare.mindcare_backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;  // Thời gian lỗi xảy ra
    private int status;               // Mã lỗi HTTP
    private String message;           // Thông điệp lỗi
    private String details;           // Chi tiết lỗi (nếu có)
}
