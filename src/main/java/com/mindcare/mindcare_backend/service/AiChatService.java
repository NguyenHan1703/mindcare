package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.response.MessageResponse;

public interface AiChatService {

/**
 * Xử lý tin nhắn từ người dùng:
 * 1. Lưu tin nhắn của người dùng.
 * 2. Nếu là tin nhắn đầu trong ngày (và chưa có ghi nhận cảm xúc từ icon),
 * phân tích cảm xúc từ tin nhắn và ghi nhận vào DailyEmotionLog.
 * 3. Gọi AI (Gemini) để lấy phản hồi dựa trên tin nhắn người dùng,
 * lịch sử chat và cảm xúc (nếu có).
 * 4. Lưu tin nhắn phản hồi từ AI.
 * 5. Trả về thông tin tin nhắn phản hồi từ AI.
 **/
    MessageResponse processUserMessageAndGetResponse(String conversationId, String senderUserId, String userMessageContent);

/**
 * Xử lý khi người dùng chọn một icon cảm xúc:
 * 1. Ghi nhận cảm xúc vào DailyEmotionLog (ưu tiên hơn phân tích text).
 * 2. Yêu cầu AI phản hồi dựa trên cảm xúc đó.
 * 3. Lưu tin nhắn phản hồi từ AI.
 * 4. Trả về thông tin tin nhắn phản hồi từ AI.
 **/
    MessageResponse processUserEmotionAndGetResponse(String conversationId, String senderUserId, String selectedEmotion);

    // Gửi tin nhắn chào mừng/câu hỏi cảm xúc ban đầu từ AI khi một cuộc hội thoại mới được tạo.
    // Phương thức này sẽ tạo và lưu một Message từ AI.
    MessageResponse sendInitialAiGreeting(String conversationId, String userId);


}