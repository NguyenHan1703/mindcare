package com.mindcare.backend.dto.conversation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Lombok: Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Tự động tạo constructor không tham số
@AllArgsConstructor // Lombok: Tự động tạo constructor với tất cả tham số
public class MessageRequest {

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 5000, message = "Nội dung tin nhắn không được vượt quá 5000 ký tự")
    private String content;

    // conversationId thường sẽ được lấy từ @PathVariable trong Controller,
    // nên không nhất thiết phải có ở đây.
    // Nếu có trường hợp client cần gửi conversationId trong body, bạn có thể thêm vào.
    // private String conversationId;
}