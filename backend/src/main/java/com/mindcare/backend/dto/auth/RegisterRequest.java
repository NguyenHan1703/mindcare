package com.mindcare.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Lombok: Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Tự động tạo constructor không tham số
@AllArgsConstructor // Lombok: Tự động tạo constructor với tất cả tham số
public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải có từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 120, message = "Mật khẩu phải có từ 6 đến 120 ký tự")
    private String password;

    // Bạn có thể thêm các trường khác ở đây nếu cần cho quá trình đăng ký,
    // ví dụ: email, fullName, etc.
    // private String email;
    // private String avatarUrl; // Nếu muốn cho phép đặt avatar ngay khi đăng ký
}