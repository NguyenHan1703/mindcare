package com.mindcare.backend.exception;

import com.mindcare.backend.dto.response.ErrorResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({BadRequestException.class, UserAlreadyExistsException.class})
    public ResponseEntity<ErrorResponseDto> handleBadRequestException(
            RuntimeException ex, WebRequest request) {
        logger.warn("Bad request: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        logger.warn("Illegal argument: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Illegal Argument",
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        logger.warn("Validation error: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Dữ liệu đầu vào không hợp lệ.",
                request.getDescription(false),
                errors
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDto> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication failed: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Xác thực thất bại: " + ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        logger.warn("Access denied: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "Bạn không có quyền truy cập tài nguyên này.",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Bắt các lỗi liên quan đến việc gọi dịch vụ AI (ví dụ: Ollama không phản hồi, lỗi API AI).
     * Trả về HTTP Status 503 SERVICE_UNAVAILABLE để báo cho client biết rằng
     * một dịch vụ phụ thuộc (AI service) đang gặp sự cố.
     */
    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponseDto> handleAiServiceException(
            AiServiceException ex, WebRequest request) {
        logger.error("AI Service Exception: {} (Path: {})", ex.getMessage(), request.getDescription(false), ex.getCause());
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.SERVICE_UNAVAILABLE.value(), // 503 Service Unavailable
                "AI Service Error",
                ex.getMessage(), // "Lỗi khi giao tiếp với dịch vụ AI: [chi tiết lỗi gốc]"
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Xử lý tất cả các Exception khác không được bắt cụ thể
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGlobalException(
            Exception ex, WebRequest request) {
        logger.error("An unexpected error occurred: {} (Path: {})", ex.getMessage(), request.getDescription(false), ex);
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Đã có lỗi không mong muốn xảy ra trong hệ thống. Vui lòng thử lại sau.",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}