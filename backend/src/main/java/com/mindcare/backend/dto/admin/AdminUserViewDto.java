package com.mindcare.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set; // Sử dụng Set cho roles để thể hiện tính duy nhất

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserViewDto {
    private String id;
    private String username;
    private String avatarUrl;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}