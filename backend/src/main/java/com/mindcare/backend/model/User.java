package com.mindcare.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;


@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Field("username")
    @Indexed(unique = true)
    private String username;

    @Field("password")
    private String password;

    @Field("avatar_url")
    private String avatarUrl;

    @DBRef
    @Field("roles")
    private Set<Role> roles = new HashSet<>();

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // No-argument constructor
    public User() {
        this.roles = new HashSet<>(); // Khởi tạo để tránh NullPointerException
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor tùy chỉnh (1)
    public User(String username, String password) {
        this(); // Gọi constructor không tham số để khởi tạo roles, createdAt, updatedAt
        this.username = username;
        this.password = password;
    }

    // Constructor tùy chỉnh (2)
    public User(String username, String password, String avatarUrl) {
        this(username, password); // Gọi constructor ở trên
        this.avatarUrl = avatarUrl;
    }

    // Constructor với tất cả các trường (All-argument constructor - tùy chỉnh nếu cần)
    // Bạn có thể tạo một constructor đầy đủ hơn nếu muốn, nhưng với entities,
    // việc set giá trị qua setters sau khi tạo bằng no-arg constructor cũng phổ biến.
    // Hoặc một constructor chỉ với các trường bắt buộc.

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // equals() and hashCode() - dựa trên 'id'
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id); // Chỉ so sánh id nếu cả hai đều đã được set
    }

    @Override
    public int hashCode() {
        return Objects.hash(id); // Chỉ hash id
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                // ", password='[PROTECTED]'" + // Không nên log password
                ", avatarUrl='" + avatarUrl + '\'' +
                ", roles=" + (roles != null ? roles.stream().map(role -> role.getName().name()).collect(Collectors.toSet()) : "null") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}