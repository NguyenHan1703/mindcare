package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.ai.OllamaChatMessage;
import com.mindcare.backend.dto.ai.OllamaChatRequest;
import com.mindcare.backend.dto.ai.OllamaChatResponse;
import com.mindcare.backend.dto.conversation.MessageDto;
import com.mindcare.backend.exception.AiServiceException; // ✨ IMPORT CUSTOM EXCEPTION ✨
import com.mindcare.backend.service.interfaces.AiChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException; // Import để bắt lỗi HTTP cụ thể
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
// import java.util.Map; // Bỏ comment nếu bạn muốn dùng options cho OllamaChatRequest

@Service
public class GemmaChatServiceImpl implements AiChatService {

    private static final Logger logger = LoggerFactory.getLogger(GemmaChatServiceImpl.class);

    private final WebClient webClient;
    private final String ollamaModelName;
    private final String systemPromptContent;

    @Autowired
    public GemmaChatServiceImpl(WebClient.Builder webClientBuilder,
                                @Value("${ollama.api.baseurl:http://localhost:11434}") String ollamaApiBaseUrl,
                                @Value("${ollama.model.name}") String ollamaModelName,
                                @Value("${gemma.system.prompt}") String systemPromptContent) {
        this.webClient = webClientBuilder.baseUrl(ollamaApiBaseUrl).build();
        this.ollamaModelName = ollamaModelName;
        this.systemPromptContent = systemPromptContent;
        logger.info("GemmaChatService initialized with base URL: {}, model: {}", ollamaApiBaseUrl, ollamaModelName);
    }

    @Override
    public String getAiResponse(String conversationId, List<MessageDto> conversationHistory, String userMessage) {
        logger.debug("Requesting AI response for conversationId: {}. User message: '{}'", conversationId, userMessage);

        List<OllamaChatMessage> messagesForOllama = new ArrayList<>();

        // 1. Thêm System Prompt
        if (systemPromptContent != null && !systemPromptContent.isBlank()) {
            messagesForOllama.add(new OllamaChatMessage("system", systemPromptContent));
        }

        // 2. Chuyển đổi lịch sử hội thoại
        if (conversationHistory != null) {
            for (MessageDto historyMsg : conversationHistory) {
                String role = "user";
                if ("AI".equalsIgnoreCase(historyMsg.getSender()) ||
                        "ASSISTANT".equalsIgnoreCase(historyMsg.getSender())) {
                    role = "assistant";
                }
                messagesForOllama.add(new OllamaChatMessage(role, historyMsg.getContent()));
            }
        }


        // 3. Tạo Request Body cho Ollama
        OllamaChatRequest ollamaRequest = new OllamaChatRequest();
        ollamaRequest.setModel(this.ollamaModelName);
        ollamaRequest.setMessages(messagesForOllama); // messagesForOllama nên là toàn bộ context bao gồm cả tin nhắn user mới nhất
        ollamaRequest.setStream(false);
        // Ví dụ options:
        // ollamaRequest.setOptions(Map.of("temperature", 0.7));

        // 4. Gọi API Ollama bằng WebClient
        try {
            logger.info("Sending request to Ollama model: {}. Number of messages in context: {}", this.ollamaModelName, messagesForOllama.size());
            OllamaChatResponse ollamaResponse = webClient.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(ollamaRequest)
                    .retrieve()
                    .bodyToMono(OllamaChatResponse.class)
                    .timeout(Duration.ofSeconds(60)) // Đặt timeout
                    .block();

            if (ollamaResponse != null && ollamaResponse.getMessage() != null && ollamaResponse.getMessage().getContent() != null) {
                logger.info("Received response from Ollama successfully for conversationId: {}", conversationId);
                return ollamaResponse.getMessage().getContent();
            } else {
                logger.error("Received invalid or empty content from Ollama. Response: {}", ollamaResponse);
                // NÉM AiServiceException
                throw new AiServiceException("Phản hồi không hợp lệ hoặc rỗng từ dịch vụ AI.");
            }
        } catch (WebClientResponseException e) { // Bắt lỗi HTTP cụ thể từ WebClient
            logger.error("Ollama API error for conversationId {}: Status Code {}, Body {}", conversationId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            // NÉM AiServiceException
            throw new AiServiceException("Lỗi từ dịch vụ AI: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (Exception e) { // Bắt các lỗi khác (ví dụ: timeout, connection error)
            logger.error("Error calling Ollama API for conversationId {}: {}", conversationId, e.getMessage(), e);
            // NÉM AiServiceException
            throw new AiServiceException("Lỗi khi giao tiếp với dịch vụ AI: " + e.getMessage(), e);
        }
    }
}