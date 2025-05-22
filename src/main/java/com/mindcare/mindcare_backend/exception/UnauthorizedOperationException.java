package com.mindcare.mindcare_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN) // Tự động trả về HTTP 403 Forbidden
public class UnauthorizedOperationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public UnauthorizedOperationException(String message) {
        super(message);
    }
}