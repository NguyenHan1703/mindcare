package com.mindcare.mindcare_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
/**
 * Model Conversation đại diện cho một cuộc hội thoại giữa người dùng và AI Chatbot.
 * Mỗi cuộc hội thoại thuộc về một người dùng cụ thể và có một tiêu đề.
 */
@Document(collection = "conversations")

public class Conversation {

    @Id // Khóa chính của document
    private String id;

    @DBRef // Tạo một tham chiếu đến User document sở hữu cuộc hội thoại này.
    // Cần cải thiện nếu có nhiều hội thoại, ager hiện tại có thể chấp nhận được.
    @Indexed
    private User user;

    @NotBlank(message = "Tiêu đề hội thoại không được để trống")
    @Size(max = 200, message = "Tiêu đề hội thoại không được vượt quá 200 ký tự")
    private String title; // Tiêu đề của cuộc hội thoại (ví dụ: "Cuộc hội thoại 1", "Chuyện hôm nay")

    // Cảm xúc gần nhất được ghi nhận hoặc phân tích trong cuộc hội thoại này.
    // Có thể được cập nhật từ DailyEmotionLog hoặc từ phân tích tin nhắn mới nhất.
    private String latestEmotion;

    @CreatedDate // Tự động gán thời gian tạo khi document được lưu lần đầu.
    private LocalDateTime createdAt;

    // Thời gian của tin nhắn cuối cùng trong hội thoại này.
    // Quan trọng để sắp xếp danh sách hội thoại theo hoạt động gần nhất.
    // Sẽ được cập nhật mỗi khi có tin nhắn mới.
    @Indexed
    private LocalDateTime lastMessageAt;

    // Constructors
    public Conversation() {
    }

    public Conversation(User user, String title) {
        this.user = user;
        this.title = title;
        this.lastMessageAt = LocalDateTime.now(); // Khởi tạo khi tạo hội thoại
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLatestEmotion() {
        return latestEmotion;
    }

    public void setLatestEmotion(String latestEmotion) {
        this.latestEmotion = latestEmotion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    @Override
    public String toString() {
        return "Conversation{" +
                "id='" + id + '\'' +
                ", userId=" + (user != null ? user.getId() : "null") + // Tránh NullPointerException nếu user chưa được set
                ", title='" + title + '\'' +
                ", latestEmotion='" + latestEmotion + '\'' +
                ", createdAt=" + createdAt +
                ", lastMessageAt=" + lastMessageAt +
                '}';
    }
}