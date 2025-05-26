package com.mindcare.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Chỉ bao gồm các trường không null trong JSON response
public class ErrorResponseDto {
    private LocalDateTime timestamp;
    private int status;
    private String error; // Ví dụ: "Not Found", "Bad Request"
    private String message;
    private String path;
    private Map<String, String> validationErrors; // Cho lỗi validation chi tiết
    private List<String> details; // Cho các chi tiết lỗi khác

    public ErrorResponseDto(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public ErrorResponseDto(int status, String error, String message, String path, Map<String, String> validationErrors) {
        this(status, error, message, path);
        this.validationErrors = validationErrors;
    }

    public ErrorResponseDto(int status, String error, String message, String path, List<String> details) {
        this(status, error, message, path);
        this.details = details;
    }
}