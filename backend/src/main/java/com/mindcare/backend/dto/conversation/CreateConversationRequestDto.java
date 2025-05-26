package com.mindcare.backend.dto.conversation;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequestDto {
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title; // Tiêu đề cho cuộc hội thoại, có thể là null hoặc rỗng
}