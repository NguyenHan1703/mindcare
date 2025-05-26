package com.mindcare.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequestDto {

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 120, message = "Mật khẩu mới phải có từ 6 đến 120 ký tự")
    private String newPassword;

    // Frontend sẽ có trường "Nhập lại mật khẩu mới" để xác nhận,
    // nhưng chỉ cần gửi newPassword lên backend là đủ cho phiên bản đơn giản này.
    // Việc so sánh confirmPassword nên được thực hiện ở frontend trước khi gửi.
}