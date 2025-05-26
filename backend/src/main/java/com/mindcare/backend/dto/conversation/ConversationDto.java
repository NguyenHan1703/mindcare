package com.mindcare.backend.dto.conversation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private String id;
    private String userId;
    private String title;
    private String aiModel; // Model AI được sử dụng (sẽ được cấu hình)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // Thời điểm cập nhật cuối (ví dụ, khi có tin nhắn mới)
    // Bạn có thể thêm các trường như lastMessagePreview, unreadCount sau này nếu cần
}