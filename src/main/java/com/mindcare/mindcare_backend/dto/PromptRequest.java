package com.mindcare.mindcare_backend.dto;

import lombok.Data;

@Data
public class PromptRequest {
    private String promptId;   // ID prompt, có thể để null khi tạo mới
    private String content;    // Nội dung prompt (câu hỏi, lời khuyên, ...)
    private String type;       // Loại prompt (ví dụ: "therapy", "greeting", "farewell", ...)
}
