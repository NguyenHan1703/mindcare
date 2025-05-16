package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String newPassword;
    private String confirmPassword;
}
