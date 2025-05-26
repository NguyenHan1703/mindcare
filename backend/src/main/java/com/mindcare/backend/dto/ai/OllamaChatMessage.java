package com.mindcare.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaChatMessage {
    private String role;    // "system", "user", hoặc "assistant"
    private String content;
    // private List<String> images; // Bỏ comment nếu bạn làm việc với model multimodal và muốn gửi ảnh (dưới dạng base64 encoded strings)
}