package com.mindcare.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set; // Sử dụng Set cho roles để thể hiện tính duy nhất

@Data // Lombok: Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Tự động tạo constructor không tham số
@AllArgsConstructor // Lombok: Tự động tạo constructor với tất cả tham số
public class AdminUserViewDto {
    private String id;
    private String username;
    private String avatarUrl;
    private Set<String> roles; // Danh sách tên các vai trò của người dùng (dùng Set cho rõ ràng)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Bạn có thể thêm các trường khác mà admin cần xem, ví dụ:
    // private boolean enabled;
    // private String email; (nếu User model có email)
}