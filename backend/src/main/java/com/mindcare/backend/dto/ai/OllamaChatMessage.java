package com.mindcare.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaChatMessage {
    private String role;
    private String content;
    // private List<String> images; // Làm việc với model multimodal và muốn gửi ảnh
}