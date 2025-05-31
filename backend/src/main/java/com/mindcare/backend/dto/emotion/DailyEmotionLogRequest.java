package com.mindcare.backend.dto.emotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyEmotionLogRequest {

    @NotBlank(message = "Cảm xúc không được để trống")
    @Size(max = 50, message = "Tên cảm xúc không được quá 50 ký tự")
    private String emotion; // Ví dụ: "happy", "sad", "neutral"

    // Backend sẽ tự động lấy ngày hiện tại khi xử lý request này,
    // nên không cần client gửi lên logDate cho việc ghi nhận cảm xúc "hôm nay".
}