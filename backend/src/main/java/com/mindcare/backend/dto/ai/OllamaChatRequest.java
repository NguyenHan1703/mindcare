package com.mindcare.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaChatRequest {
    private String model;                       // Tên model trong Ollama (ví dụ: "gemma:7b")
    private List<OllamaChatMessage> messages;   // Lịch sử tin nhắn và tin nhắn hiện tại
    private String format;                      // Tùy chọn: "json" để yêu cầu output là JSON (nếu model hỗ trợ)
    private Map<String, Object> options;        // Tùy chọn: Các tham số như temperature, top_p, seed,...
    private boolean stream = false;             // Mặc định là false để nhận response hoàn chỉnh
    // private String template;                 // Tùy chọn: Template cho prompt
    // private String system;                   // Tùy chọn: System prompt (có thể đặt trong messages với role "system")
    // private boolean keep_alive;              // Tùy chọn: Giữ model trong memory
}