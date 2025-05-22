package com.mindcare.mindcare_backend.dto.request;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;

public class UserProfileUpdateRequest {

    @Size(max = 100, message = "Tên hiển thị không được vượt quá 100 ký tự")
    private String displayName;

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    // Trường avatarUrl thường được xử lý riêng nếu là upload file.
    // Nếu chỉ là cập nhật URL từ một nguồn bên ngoài, có thể thêm vào đây.
    // Trong trường hợp upload file, controller sẽ nhận MultipartFile riêng.
    // Giả sử ở đây chúng ta cho phép cập nhật URL avatar (nếu người dùng tự cung cấp URL)
    @Size(max = 255, message = "URL ảnh đại diện không được vượt quá 255 ký tự")
    private String avatarUrl;


    // Getters and Setters
    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
         return email;
    }

    public void setEmail(String email) {
         this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
