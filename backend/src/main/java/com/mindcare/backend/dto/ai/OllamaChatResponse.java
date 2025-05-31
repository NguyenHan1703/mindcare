package com.mindcare.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime; // Chuẩn ISO 8601

@Data
@NoArgsConstructor
public class OllamaChatResponse {
    private String model;

    @JsonProperty("created_at") // Ánh xạ tên field "created_at" trong JSON sang createdAt
    private OffsetDateTime createdAt;

    private OllamaChatMessage message; // Tin nhắn phản hồi từ AI

    private boolean done;

    @JsonProperty("total_duration")
    private Long totalDuration;

    @JsonProperty("load_duration")
    private Long loadDuration;

    @JsonProperty("prompt_eval_count")
    private Integer promptEvalCount;

    @JsonProperty("prompt_eval_duration")
    private Long promptEvalDuration;

    @JsonProperty("eval_count")
    private Integer evalCount;

    @JsonProperty("eval_duration")
    private Long evalDuration;

    // Constructor để tạo đối tượng thủ công
    public OllamaChatResponse(String model, OffsetDateTime createdAt, OllamaChatMessage message, boolean done) {
        this.model = model;
        this.createdAt = createdAt;
        this.message = message;
        this.done = done;
    }
}