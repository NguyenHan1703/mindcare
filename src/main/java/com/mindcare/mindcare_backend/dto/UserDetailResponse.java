package com.mindcare.mindcare_backend.dto;

import lombok.Data;
import java.util.List;
import com.mindcare.mindcare_backend.dto.EmotionLogResponse;
import com.mindcare.mindcare_backend.dto.ChatSummaryResponse;

@Data
public class UserDetailResponse {
    private UserResponse userInfo;
    private List<EmotionLogResponse> emotionLogs;         // Lịch sử cảm xúc chi tiết
    private List<ChatSummaryResponse> chatSummaries;      // Danh sách tóm tắt các cuộc hội thoại
}
