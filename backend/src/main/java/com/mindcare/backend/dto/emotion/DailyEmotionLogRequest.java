package com.mindcare.backend.dto.emotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Lombok: Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Tự động tạo constructor không tham số
@AllArgsConstructor // Lombok: Tự động tạo constructor với tất cả tham số
public class DailyEmotionLogRequest {

    @NotBlank(message = "Cảm xúc không được để trống")
    @Size(max = 50, message = "Tên cảm xúc không được quá 50 ký tự")
    private String emotion; // Ví dụ: "happy", "sad", "neutral"

    // Backend sẽ tự động lấy ngày hiện tại khi xử lý request này,
    // nên không cần client gửi lên logDate cho việc ghi nhận cảm xúc "hôm nay".
    // Nếu có nhu cầu cho phép client chọn ngày (ví dụ: ghi nhận cho ngày cũ),
    // bạn có thể thêm trường 'private LocalDate logDate;' vào đây.
}