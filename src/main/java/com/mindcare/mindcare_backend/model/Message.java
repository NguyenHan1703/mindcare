package com.mindcare.mindcare_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Model Message đại diện cho một tin nhắn trong một cuộc hội thoại.
 * Mỗi tin nhắn thuộc về một Conversation và có một người gửi (User hoặc AI).
 */

@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @DBRef
    @NotNull(message = "Hội thoại không được để trống")
    @Indexed
    private Conversation conversation;

    @DBRef
    @NotNull(message = "Người gửi không được để trống")
    @Indexed
    private User sender;

    @NotNull(message = "Loại người gửi không được để trống")
    private ESenderType senderType;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 5000)
    private String content; // Nội dung của tin nhắn

    @CreatedDate // Tự động gán thời gian tạo (cũng là thời gian gửi)
    @Indexed // Quan trọng để sắp xếp tin nhắn theo thứ tự thời gian
    private LocalDateTime timestamp;

    // Constructors
    public Message() {
    }

    public Message(Conversation conversation, User sender, ESenderType senderType, String content) {
        this.conversation = conversation;
        this.sender = sender;
        this.senderType = senderType;
        this.content = content;
        // timestamp sẽ được tự động gán bởi @CreatedDate
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public ESenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(ESenderType senderType) {
        this.senderType = senderType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", conversationId=" + (conversation != null ? conversation.getId() : "null") +
                ", senderId=" + (sender != null ? sender.getId() : "null") +
                ", senderType=" + senderType +
                ", content='" + (content != null && content.length() > 50 ? content.substring(0, 50) + "..." : content) + '\'' + // Tránh log quá dài
                ", timestamp=" + timestamp +
                '}';
    }
}