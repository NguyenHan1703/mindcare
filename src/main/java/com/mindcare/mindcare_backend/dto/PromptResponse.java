package com.mindcare.mindcare_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PromptResponse {
    private String promptId;  // ID prompt
    private String content;   // Nội dung prompt
    private String type;      // Loại prompt
}
