package com.mindcare.mindcare_backend.dto.response;

import java.util.Set;

// Không trả về password
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Set<String> roles; // Chỉ trả về tên các roles

    // Constructor, Getters and Setters
    public UserResponse(String id, String username, String email, String displayName, String avatarUrl, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.roles = roles;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
