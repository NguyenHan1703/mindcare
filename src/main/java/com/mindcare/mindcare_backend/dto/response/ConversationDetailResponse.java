package com.mindcare.mindcare_backend.dto.response;

import java.time.LocalDateTime;


public class ConversationDetailResponse {
    private String id;
    private String title;
    private String userId;
    private String userDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String latestEmotion;
    private MessageResponse initialAiMessage; // Tin nhắn chào mừng đầu tiên từ AI

    public ConversationDetailResponse() {
    }

    public ConversationDetailResponse(String id, String title, String userId, String userDisplayName, LocalDateTime createdAt, LocalDateTime lastMessageAt, String latestEmotion, MessageResponse initialAiMessage) {
        this.id = id;
        this.title = title;
        this.userId = userId;
        this.userDisplayName = userDisplayName;
        this.createdAt = createdAt;
        this.lastMessageAt = lastMessageAt;
        this.latestEmotion = latestEmotion;
        this.initialAiMessage = initialAiMessage;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    public String getLatestEmotion() { return latestEmotion; }
    public void setLatestEmotion(String latestEmotion) { this.latestEmotion = latestEmotion; }
    public MessageResponse getInitialAiMessage() { return initialAiMessage; }
    public void setInitialAiMessage(MessageResponse initialAiMessage) { this.initialAiMessage = initialAiMessage; }
}