package com.mindcare.mindcare_backend.dto.request;

import com.mindcare.mindcare_backend.model.ERole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.Set;

public class AdminUserUpdateRequest {


    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @Size(min = 6, max = 120, message = "Mật khẩu phải từ 6 đến 120 ký tự")
    private String password; // Mật khẩu mới (nếu Admin muốn reset/thay đổi) - để trống nếu không đổi

    @Size(max = 100, message = "Tên hiển thị không được vượt quá 100 ký tự")
    private String displayName;

    private String avatarUrl;

    private Set<String> roles; // Danh sách tên các vai trò mới

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}