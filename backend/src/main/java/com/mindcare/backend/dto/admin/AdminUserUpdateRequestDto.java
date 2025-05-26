package com.mindcare.backend.dto.admin;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserUpdateRequestDto {

    @Size(min = 3, max = 50, message = "Username phải có từ 3 đến 50 ký tự")
    private String username; // Để null nếu không muốn thay đổi username

    // Nếu admin muốn reset mật khẩu, họ sẽ cung cấp mật khẩu mới ở đây.
    // Service sẽ mã hóa mật khẩu này trước khi lưu.
    @Size(min = 6, max = 120, message = "Mật khẩu mới phải có từ 6 đến 120 ký tự")
    private String password; // Để null nếu không muốn thay đổi mật khẩu

    private String avatarUrl; // Để null nếu không muốn thay đổi avatar, gửi chuỗi rỗng "" nếu muốn xóa avatar

    private Set<String> roles; // Danh sách tên các vai trò mới (ví dụ: ["ROLE_USER", "ROLE_ADMIN"])
    // Để null nếu không muốn thay đổi vai trò. Service sẽ cần logic để map tên vai trò này sang Role entities.

    // private Boolean enabled; // Nếu bạn có trường 'enabled' trong User model và muốn admin có thể thay đổi
}