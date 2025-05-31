package com.mindcare.backend.dto.auth;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer"; // Loại token, mặc định là Bearer
    private String id;
    private String username;
    private String avatarUrl; // Thêm avatarUrl để tiện cho client hiển thị
    private List<String> roles;

    public JwtResponse(String accessToken, String id, String username, String avatarUrl, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.roles = roles;
    }
}