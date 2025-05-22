package com.mindcare.mindcare_backend.dto.response;

import com.mindcare.mindcare_backend.model.ERole;
import java.time.LocalDateTime;
import java.util.Set;

public class AdminUserViewResponse {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Set<String> roles; // Danh sách tên các vai trò
    private long conversationCount; // Số lượng hội thoại của user
    private LocalDateTime createdAt;

    // Constructors
    public AdminUserViewResponse() {}

    public AdminUserViewResponse(String id, String username, String email, String displayName, String avatarUrl, Set<String> roles, long conversationCount, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.roles = roles;
        this.conversationCount = conversationCount;
        this.createdAt = createdAt;
    }

    // Getters and Setters
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
    public long getConversationCount() { return conversationCount; }
    public void setConversationCount(long conversationCount) { this.conversationCount = conversationCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}