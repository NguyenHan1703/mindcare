package com.mindcare.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data // Lombok: Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Tự động tạo constructor không tham số
@AllArgsConstructor // Lombok: Tự động tạo constructor với tất cả tham số
public class UserProfileDto {
    private String id;
    private String username;
    private String avatarUrl;
    private List<String> roles; // Danh sách tên các vai trò của người dùng
}