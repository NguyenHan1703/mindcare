package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private int age;
    private String email;
    private String password;
}
