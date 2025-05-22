package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.response.MessageResponse;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.*; // User, Conversation, Message, ESenderType, EEmotionSource
import com.mindcare.mindcare_backend.repository.ConversationRepository;
import com.mindcare.mindcare_backend.repository.MessageRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.service.AiChatService;
import com.mindcare.mindcare_backend.service.EmotionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// Các import cho Gemini AI SDK (ví dụ)
// import com.google.cloud.vertexai.VertexAI;
// import com.google.cloud.vertexai.api.GenerateContentResponse;
// import com.google.cloud.vertexai.generativeai.GenerativeModel;
// import com.google.cloud.vertexai.generativeai.Content;
// import com.google.cloud.vertexai.generativeai.Part;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

//@Service
public class AiChatServiceImpl implements AiChatService {

    private static final Logger logger = LoggerFactory.getLogger(AiChatServiceImpl.class);

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final EmotionService emotionService;
    private final ResourceLoader resourceLoader;

    @Value("${mindcare_backend.ai.basePromptPath:classpath:prompts/therapy_prompt_v1.txt}")
    private String basePromptPath;
    private String baseTherapyPromptPath;
    private String loadedBaseTherapyPrompt = "Chào bạn, tôi là MindCare AI. Tôi ở đây để lắng nghe và trò chuyện cùng bạn.";

    // Giả sử có một user đặc biệt cho AI Bot
    private static final String AI_BOT_USERNAME = "AI_MINDCARE_BOT";


    @Autowired
    public AiChatServiceImpl(UserRepository userRepository,
                             ConversationRepository conversationRepository,
                             MessageRepository messageRepository,
                             EmotionService emotionService,
                             ResourceLoader resourceLoader) {
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.emotionService = emotionService;
        this.resourceLoader = resourceLoader;
        loadBaseTherapyPrompt();
    }

    private void loadBaseTherapyPrompt() {
        try {
            Resource resource = resourceLoader.getResource(baseTherapyPromptPath);
            if (resource.exists()) {
                this.loadedBaseTherapyPrompt = resource.getContentAsString(StandardCharsets.UTF_8);
                logger.info("Đã tải thành công prompt trị liệu từ: {}", baseTherapyPromptPath);
            } else {
                logger.warn("Không tìm thấy file prompt tại: {}, sử dụng prompt mặc định.", baseTherapyPromptPath);
            }
        } catch (IOException e) {
            logger.error("Lỗi khi đọc file prompt: {}", baseTherapyPromptPath, e);
        }
    }

    @Override
    @Transactional
    public MessageResponse processUserMessageAndGetResponse(String conversationId, String senderUserId, String userMessageContent) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderUserId));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        // --- (1) Lưu tin nhắn của User ---
        Message userMessage = saveMessage(conversation, sender, ESenderType.USER, userMessageContent);
        updateConversationLastMessageAt(conversation, userMessage.getTimestamp()); // Cập nhật thời gian tin nhắn cuối
        logger.info("Đã lưu tin nhắn từ User ID: {} cho Conversation ID: {}", senderUserId, conversationId);

        // --- (2) Xử lý cảm xúc nếu là tương tác đầu ngày và chưa có ghi nhận từ icon ---
        String emotionForPromptContext = null; // Cảm xúc này sẽ được dùng để làm phong phú prompt cho AI
        LocalDate today = LocalDate.now();
        if (emotionService.isFirstEmotionLogOfDay(senderUserId, today)) {
            // Gọi hàm nội bộ để phân tích cảm xúc từ text
            String detectedEmotion = analyzeSentimentFromMessageInternal(userMessageContent);
            if (detectedEmotion != null && !detectedEmotion.isBlank()) {
                // Ghi nhận cảm xúc này
                emotionService.recordOrUpdateDailyEmotion(senderUserId, conversationId, today, detectedEmotion, EEmotionSource.TEXT_ANALYSIS);
                emotionForPromptContext = detectedEmotion;
                logger.info("Đã ghi nhận cảm xúc '{}' từ phân tích text cho User ID: {} vào ngày {}", detectedEmotion, senderUserId, today);
            } else {
                logger.info("Không phân tích được cảm xúc từ text cho User ID: {} vào ngày {}", senderUserId, today);
            }
        } else {
            // Nếu đã có log cảm xúc trong ngày (ví dụ từ icon), có thể lấy cảm xúc đó làm context
            // Hoặc bỏ qua nếu không muốn ảnh hưởng đến prompt từ cảm xúc cũ
            // DailyEmotionLog existingLog = dailyEmotionLogRepository.findByUserIdAndDate(senderUserId, today).orElse(null);
            // if (existingLog != null) {
            //     emotionForPromptContext = existingLog.getEmotion();
            // }
            logger.debug("User ID: {} đã có log cảm xúc trong ngày {}.", senderUserId, today);
        }

        // --- (3) Gọi AI (Gemini) để lấy phản hồi ---
        // Xây dựng prompt dựa trên tin nhắn user, lịch sử chat và cảm xúc (nếu có)
        String aiResponseContent = getResponseFromAIInternal(conversation, userMessageContent, emotionForPromptContext);

        // --- (4. Lưu tin nhắn của AI ---
        User aiBotUser = getAiBotUser();
        Message aiMessage = saveMessage(conversation, aiBotUser, ESenderType.AI, aiResponseContent);
        updateConversationLastMessageAt(conversation, aiMessage.getTimestamp()); // Cập nhật lại thời gian tin nhắn cuối
        logger.info("Đã lưu phản hồi từ AI cho Conversation ID: {}", conversationId);

        // --- (5) Trả về tin nhắn phản hồi từ AI ---
        return mapToMessageResponse(aiMessage);
    }

    @Override
    @Transactional
    public MessageResponse processUserEmotionAndGetResponse(String conversationId, String senderUserId, String selectedEmotion) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderUserId));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        // 1. Ghi nhận cảm xúc (EmotionService sẽ xử lý logic chỉ ghi 1 lần/ngày, ưu tiên ICON)
        emotionService.recordOrUpdateDailyEmotion(senderUserId, conversationId, LocalDate.now(), selectedEmotion, EEmotionSource.ICON_SELECTION);
        logger.info("Đã ghi nhận cảm xúc '{}' từ ICON cho User ID: {} vào ngày {}", selectedEmotion, senderUserId, LocalDate.now());

        // 2. Xây dựng prompt dựa trên cảm xúc đã chọn và gọi AI
        String builtPrompt = buildPromptForEmotionSelection(conversation, selectedEmotion);
        String aiResponseContent = callGeminiAI(builtPrompt);

        // 3. Lưu tin nhắn của AI
        User aiBotUser = getAiBotUser();
        Message aiMessage = saveMessage(conversation, aiBotUser, ESenderType.AI, aiResponseContent);
        updateConversationLastMessageAt(conversation, aiMessage.getTimestamp());

        logger.info("AI phản hồi dựa trên cảm xúc ICON cho Conversation ID: {}", conversationId);
        return mapToMessageResponse(aiMessage);
    }


    @Override
    @Transactional
    public MessageResponse sendInitialAiGreeting(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));
        User aiBotUser = getAiBotUser();

        String greetingContent = "Chào bạn, tôi là MindCare. Hôm nay bạn cảm thấy thế nào?";
        // TODO: Có thể gọi AI để tạo câu chào động hơn hoặc lấy từ một prompt đặc biệt.
        // String greetingContent = callGeminiAI(buildInitialGreetingPrompt(conversation));

        Message aiMessage = saveMessage(conversation, aiBotUser, ESenderType.AI, greetingContent);
        updateConversationLastMessageAt(conversation, aiMessage.getTimestamp());

        logger.info("Đã gửi tin nhắn chào mừng cho Conversation ID: {}", conversationId);
        return mapToMessageResponse(aiMessage);
    }

    // --- Các phương thức nội bộ (private) ---

    private Message saveMessage(Conversation conversation, User sender, ESenderType senderType, String content) {
        Message message = new Message(conversation, sender, senderType, content);
        // timestamp sẽ được tự động gán bởi @CreatedDate
        return messageRepository.save(message);
    }

    private void updateConversationLastMessageAt(Conversation conversation, LocalDateTime timestamp) {
        conversation.setLastMessageAt(timestamp);
        // Nếu có logic cập nhật latestEmotion trong conversation dựa trên tin nhắn mới nhất,
        // thì có thể làm ở đây hoặc khi record emotion.
        conversationRepository.save(conversation);
    }

    private User getAiBotUser() {
        return userRepository.findByUsername(AI_BOT_USERNAME)
                .orElseGet(() -> {
                    logger.warn("Không tìm thấy User đại diện cho AI ('{}'). Đang tạo mới...", AI_BOT_USERNAME);
                    User aiBot = new User(AI_BOT_USERNAME, AI_BOT_USERNAME + "@mindcare.system", "STATIC_AI_PASSWORD_NOT_USED_FOR_LOGIN");
                    aiBot.setDisplayName("MindCare AI");
                    // Gán role đặc biệt cho AI nếu cần (ví dụ: ROLE_SYSTEM)
                    // Role systemRole = roleRepository.findByName(ERole.ROLE_SYSTEM)... roles.add(systemRole)
                    // aiBot.setRoles(roles);
                    return userRepository.save(aiBot);
                });
    }

    private String getResponseFromAIInternal(Conversation conversation, String currentUserMessage, String emotionContext) {
        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "timestamp")); // Lấy 5 tin nhắn mới nhất
        List<Message> recentMessages = messageRepository.findByConversationId(conversation.getId(), pageable).getContent();
        Collections.reverse(recentMessages); // Sắp xếp lại theo thứ tự thời gian tăng dần cho prompt

        String finalPrompt = buildPromptForGemini(conversation, recentMessages, currentUserMessage, emotionContext);
        logger.debug("Prompt gửi đến Gemini AI (Conversation ID: {}): {}", conversation.getId(), finalPrompt.substring(0, Math.min(finalPrompt.length(), 300))+"...");

        String aiResponse = callGeminiAI(finalPrompt);
        logger.debug("Phản hồi từ Gemini AI (Conversation ID: {}): {}", conversation.getId(), aiResponse.substring(0, Math.min(aiResponse.length(), 300))+"...");
        return aiResponse;
    }

    private String analyzeSentimentFromMessageInternal(String text) {
        // TODO: Triển khai logic gọi Gemini AI với prompt chuyên để phân tích cảm xúc
        // Ví dụ prompt: "Phân tích cảm xúc chính trong câu sau và trả về một trong các nhãn [HAPPY, SAD, NEUTRAL, ANGRY, ANXIOUS, CALM]: \"" + text + "\""
        // String sentimentPrompt = "Phân tích cảm xúc chính của đoạn văn bản sau và chỉ trả về MỘT trong các nhãn sau (viết hoa, không giải thích thêm): HAPPY, SAD, NEUTRAL, ANGRY, ANXIOUS, CALM. Đoạn văn: \"" + text + "\"";
        // String sentimentLabel = callGeminiAI(sentimentPrompt);
        // Xử lý kết quả trả về từ AI để lấy đúng nhãn cảm xúc
        // return normalizeSentimentLabel(sentimentLabel);

        logger.warn("Chức năng phân tích cảm xúc từ text chưa được triển khai đầy đủ, trả về giá trị mặc định 'NEUTRAL'.");
        // Giả lập một số trường hợp để test
        if (text.toLowerCase().contains("vui") || text.toLowerCase().contains("tuyệt")) return "HAPPY";
        if (text.toLowerCase().contains("buồn") || text.toLowerCase().contains("chán")) return "SAD";
        return "NEUTRAL"; // Giá trị mặc định
    }

    private String buildPromptForEmotionSelection(Conversation conversation, String selectedEmotion) {
        // Lấy lịch sử chat gần nhất (nếu cần)
        Pageable pageable = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<Message> recentMessages = messageRepository.findByConversationId(conversation.getId(), pageable).getContent();
        Collections.reverse(recentMessages);

        StringBuilder promptBuilder = new StringBuilder(this.loadedBaseTherapyPrompt);
        promptBuilder.append("\n\n--- Ngữ cảnh hội thoại trước đó (nếu có) ---");
        if(recentMessages.isEmpty()){
            promptBuilder.append("\n(Đây là sự tương tác đầu tiên về cảm xúc trong hội thoại này.)");
        } else {
            for (Message msg : recentMessages) {
                String prefix = msg.getSenderType() == ESenderType.USER ? "\nNgười dùng: " : "\nMindCare AI: ";
                promptBuilder.append(prefix).append(msg.getContent());
            }
        }
        promptBuilder.append("\n--- Tình huống hiện tại ---");
        promptBuilder.append("\nNgười dùng vừa cho biết họ đang cảm thấy: ").append(selectedEmotion.toUpperCase()).append(".");
        promptBuilder.append("\nHãy phản hồi một cách đồng cảm, xác nhận cảm xúc của họ (\"Tôi hiểu bạn đang cảm thấy ").append(selectedEmotion.toLowerCase()).append(".\") và đặt một câu hỏi mở, nhẹ nhàng để khuyến khích họ chia sẻ thêm về lý do hoặc tình huống dẫn đến cảm xúc đó. Tránh đưa ra lời khuyên trực tiếp hoặc các giải pháp ngay lập tức. Hãy tập trung vào việc lắng nghe và thấu hiểu.");
        promptBuilder.append("\nMindCare AI: ");
        return promptBuilder.toString();
    }


    private String buildPromptForGemini(Conversation conversation, List<Message> recentMessages, String currentUserMessage, String analyzedEmotionContext) {
        StringBuilder promptBuilder = new StringBuilder(this.loadedBaseTherapyPrompt);

        // promptBuilder.append("\n\nThông tin về người dùng (nếu có và được phép):");
        // promptBuilder.append("\n- Tên hiển thị: ").append(conversation.getUser().getDisplayName());
        // (Cân nhắc về quyền riêng tư khi thêm thông tin cá nhân vào prompt)

        if (analyzedEmotionContext != null && !analyzedEmotionContext.isBlank()) {
            promptBuilder.append("\n\nPhân tích gần đây cho thấy người dùng có thể đang cảm thấy: ").append(analyzedEmotionContext.toUpperCase()).append(".");
            promptBuilder.append(" Hãy cân nhắc điều này trong phản hồi của bạn.");
        }

        promptBuilder.append("\n\n--- Lịch sử hội thoại gần đây (tin nhắn mới nhất ở cuối) ---");
        if(recentMessages.isEmpty() && (analyzedEmotionContext == null || analyzedEmotionContext.isBlank())){
            promptBuilder.append("\n(Đây là tin nhắn đầu tiên của người dùng trong hội thoại này.)");
        }
        for (Message msg : recentMessages) {
            String prefix = msg.getSenderType() == ESenderType.USER ? "\nNgười dùng: " : "\nMindCare AI: ";
            promptBuilder.append(prefix).append(msg.getContent());
        }
        promptBuilder.append("\nNgười dùng: ").append(currentUserMessage);
        promptBuilder.append("\nMindCare AI: (Hãy phản hồi một cách đồng cảm, sâu sắc, mang tính trị liệu. Sử dụng câu hỏi mở để khuyến khích người dùng chia sẻ. Tránh đưa ra lời khuyên trực tiếp quá sớm. Nếu người dùng chia sẻ vấn đề nghiêm trọng, hãy gợi ý tìm sự giúp đỡ chuyên nghiệp một cách khéo léo.)");
        return promptBuilder.toString();
    }

    private String callGeminiAI(String prompt) {
        // TODO: Thay thế phần này bằng code gọi API Gemini AI thực tế
        // Ví dụ sử dụng Google Vertex AI SDK (giả định đã cấu hình geminiGenerativeModel):
        /*
        try {
            Content content = Content.newBuilder().addParts(Part.newBuilder().setText(prompt)).build();
            // Cân nhắc thêm safety settings nếu cần
            // List<SafetySetting> safetySettings = Arrays.asList(
            // SafetySetting.newBuilder()
            // .setCategory(HarmCategory.HARM_CATEGORY_HARASSMENT)
            // .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_ONLY_HIGH)
            // .build());
            // GenerateContentResponse response = this.geminiGenerativeModel.generateContent(content, safetySettings);

            GenerateContentResponse response = this.geminiGenerativeModel.generateContent(content);

            if (response.getCandidatesCount() > 0 &&
                response.getCandidates(0).getContent().getPartsCount() > 0 &&
                response.getCandidates(0).getContent().getParts(0).hasText()) {
                return response.getCandidates(0).getContent().getParts(0).getText();
            }
            logger.warn("Gemini AI không trả về nội dung hợp lệ cho prompt.");
            return "Xin lỗi, tôi chưa thể xử lý yêu cầu này ngay bây giờ. Bạn có thể thử lại sau được không?";
        } catch (Exception e) {
            logger.error("Lỗi khi gọi Gemini AI: {}", e.getMessage(), e);
            return "Đã có lỗi xảy ra trong quá trình kết nối với AI. Vui lòng thử lại sau.";
        }
        */

        // --- Code giả lập cho mục đích phát triển ---
        logger.info("Đang gọi Gemini AI với prompt (giả lập). Chiều dài prompt: {} ký tự.", prompt.length());
        if (prompt.toLowerCase().contains("buồn") || prompt.toLowerCase().contains("sad")) {
            return "Tôi hiểu rằng bạn đang cảm thấy buồn. Đôi khi việc chia sẻ về những gì đang làm bạn phiền lòng có thể giúp bạn cảm thấy nhẹ nhõm hơn. Bạn có muốn kể thêm về điều đó không?";
        } else if (prompt.toLowerCase().contains("vui") || prompt.toLowerCase().contains("happy")) {
            return "Thật tuyệt khi bạn đang cảm thấy vui! Niềm vui là một cảm xúc tuyệt vời. Có điều gì đặc biệt mang lại niềm vui cho bạn hôm nay không?";
        } else if (prompt.toLowerCase().contains("cảm thấy thế nào")) {
            return "Cảm ơn bạn đã hỏi. Tôi là một AI và không có cảm xúc như con người, nhưng tôi ở đây để lắng nghe và hỗ trợ bạn. Hôm nay bạn thế nào?";
        }
        return "Cảm ơn bạn đã chia sẻ. Bạn có thể nói rõ hơn về những gì bạn đang trải qua được không?";
        // --- Kết thúc code giả lập ---
    }

    // Helper method để map Message model sang MessageResponse DTO
    private MessageResponse mapToMessageResponse(Message message) {
        User sender = message.getSender(); // User object
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                sender.getId(),
                sender.getUsername(),
                sender.getDisplayName(),
                sender.getAvatarUrl(),
                message.getSenderType(),
                message.getContent(),
                message.getTimestamp()
        );
    }
}