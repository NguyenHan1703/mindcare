package com.mindcare.mindcare_backend.dto.response;

import java.time.LocalDateTime;

// Trả về thông tin tóm tắt của hội thoại
public class ConversationSnippetResponse {
    private String id;
    private String title;
    private String lastMessageSummary;
    private LocalDateTime lastMessageAt;
    private String latestEmotion;

    public ConversationSnippetResponse() {
    }

    public ConversationSnippetResponse(String id, String title, String lastMessageSummary, LocalDateTime lastMessageAt, String latestEmotion) {
        this.id = id;
        this.title = title;
        this.lastMessageSummary = lastMessageSummary;
        this.lastMessageAt = lastMessageAt;
        this.latestEmotion = latestEmotion;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLastMessageSummary() {
        return lastMessageSummary;
    }

    public void setLastMessageSummary(String lastMessageSummary) {
        this.lastMessageSummary = lastMessageSummary;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public String getLatestEmotion() {
        return latestEmotion;
    }

    public void setLatestEmotion(String latestEmotion) {
        this.latestEmotion = latestEmotion;
    }
}