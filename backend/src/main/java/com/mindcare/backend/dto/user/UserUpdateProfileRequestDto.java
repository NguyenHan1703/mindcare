package com.mindcare.backend.dto.user;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateProfileRequestDto {

    // Cho phép cập nhật username, nhưng service sẽ kiểm tra tính duy nhất nếu thay đổi
    @Size(min = 3, max = 50, message = "Username phải có từ 3 đến 50 ký tự")
    private String username; // Để null nếu không muốn thay đổi username

    private String avatarUrl; // Để null nếu không muốn thay đổi avatar
}