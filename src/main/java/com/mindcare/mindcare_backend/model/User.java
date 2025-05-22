package com.mindcare.mindcare_backend.model;

import jakarta.validation.constraints.Email; // Từ Jakarta Bean Validation (thay vì javax.validation cho Spring Boot 3+)
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Model User đại diện cho một người dùng trong hệ thống MindCare.
 * Chứa thông tin đăng nhập, thông tin cá nhân và các vai trò của người dùng.
 */
@Document(collection = "users") // Ánh xạ tới collection "users" trong MongoDB
public class User {

    @Id // Khóa chính của document
    private String id;

    @NotBlank // Không được rỗng hoặc chỉ chứa khoảng trắng
    @Size(min = 3, max = 50) // Giới hạn độ dài
    @Indexed(unique = true) // Tên đăng nhập phải là duy nhất, tạo index để truy vấn nhanh
    private String username;

    @NotBlank
    @Size(max = 100)
    @Email // Kiểm tra định dạng email hợp lệ
    @Indexed(unique = true) // Email phải là duy nhất, tạo index
    private String email;

    @NotBlank
    // Không cần @Size ở đây vì mật khẩu đã hash có độ dài cố định,
    // validation kích thước nên ở DTO lúc đăng ký/đổi mật khẩu
    private String password; // Mật khẩu đã được mã hóa (ví dụ: BCrypt)

    @Size(max = 100)
    private String displayName; // Tên hiển thị của người dùng, có thể thay đổi

    private String avatarUrl;   // URL đến ảnh đại diện của người dùng

    // @DBRef tạo một tham chiếu đến các document Role trong collection "roles".
    // Khi tải User, nếu không có lazy=true, nó sẽ cố gắng tải luôn các Role liên quan.
    // lazy=true giúp chỉ tải khi thực sự cần (ví dụ: user.getRoles()), cải thiện hiệu năng.
    @DBRef(lazy = true)
    private Set<Role> roles = new HashSet<>(); // Một người dùng có thể có nhiều vai trò

    // Trường 'active' đã được quyết định loại bỏ theo yêu cầu.

    @CreatedDate // Tự động gán giá trị thời gian hiện tại khi document được tạo lần đầu.
    // Yêu cầu @EnableMongoAuditing trong lớp cấu hình MongoConfig hoặc Application chính.
    private LocalDateTime createdAt;

    @LastModifiedDate // Tự động gán giá trị thời gian hiện tại khi document được cập nhật.
    // Yêu cầu @EnableMongoAuditing.
    private LocalDateTime updatedAt;

    // Constructors
    public User() {
        // Constructor rỗng cho MongoDB/Jackson
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public User(String username, String email, String password, String displayName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }

    // Getters and Setters (Cần cho tất cả các trường)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                // Không nên log password
                ", displayName='" + displayName + '\'' +
                ", avatarUrl='" + avatarUrl + '\'' +
                ", roles=" + (roles != null ? roles.stream().map(role -> role.getName().name()).toList() : "[]") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}