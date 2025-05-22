package com.mindcare.mindcare_backend.exception;

import com.mindcare.mindcare_backend.dto.response.GenericApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice // Kết hợp @ControllerAdvice và @ResponseBody
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Xử lý ResourceNotFoundException.
     * Trả về HTTP 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<GenericApiResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        logger.error("ResourceNotFoundException: {}", ex.getMessage());
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Xử lý BadRequestException.
     * Trả về HTTP 400 Bad Request.
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<GenericApiResponse<Void>> handleBadRequestException(
            BadRequestException ex, WebRequest request) {
        logger.error("BadRequestException: {}", ex.getMessage());
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý UnauthorizedOperationException.
     * Trả về HTTP 403 Forbidden.
     */
    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<GenericApiResponse<Void>> handleUnauthorizedOperationException(
            UnauthorizedOperationException ex, WebRequest request) {
        logger.error("UnauthorizedOperationException: {}", ex.getMessage());
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error(ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Xử lý AccessDeniedException (thường do Spring Security ném ra khi @PreAuthorize thất bại).
     * Trả về HTTP 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GenericApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        logger.error("AccessDeniedException: {}", ex.getMessage());
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error("Bạn không có quyền thực hiện hành động này.");
        return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Xử lý AuthenticationException (thường do Spring Security ném ra khi đăng nhập thất bại).
     * Trả về HTTP 401 Unauthorized.
     * Lưu ý: AuthEntryPointJwt cũng xử lý AuthenticationException, nhưng handler này
     * có thể bắt các trường hợp khác hoặc nếu bạn muốn tùy chỉnh response lỗi xác thực ở đây.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<GenericApiResponse<Void>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        logger.error("AuthenticationException: {}", ex.getMessage());
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error("Xác thực không thành công: " + ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.UNAUTHORIZED);
    }


    /**
     * Xử lý MethodArgumentNotValidException (khi validation DTO bằng @Valid thất bại).
     * Trả về HTTP 400 Bad Request cùng với chi tiết các lỗi validation.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Có thể dùng @ResponseStatus ở đây hoặc trong ResponseEntity
    public GenericApiResponse<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        logger.warn("Validation errors: {}", errors);
        return new GenericApiResponse<>(false, "Dữ liệu không hợp lệ", errors);
    }

    /**
     * Xử lý tất cả các exception không được xử lý cụ thể khác.
     * Trả về HTTP 500 Internal Server Error.
     * Đây là handler "cuối cùng" để đảm bảo client không nhận được stack trace.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericApiResponse<Void>> handleGlobalException(
            Exception ex, WebRequest request) {
        logger.error("Unhandled Exception: ", ex); // Log cả stack trace cho dev
        GenericApiResponse<Void> apiResponse = GenericApiResponse.error("Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.");
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}