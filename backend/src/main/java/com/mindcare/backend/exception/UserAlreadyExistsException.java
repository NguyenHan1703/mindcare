package com.mindcare.backend.exception;

public class UserAlreadyExistsException extends BadRequestException { // Kế thừa BadRequestException
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}