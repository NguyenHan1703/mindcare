package com.mindcare.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Objects;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Field("conversation_id")
    @Indexed
    private String conversationId;

    @Field("sender") // "USER" hoặc "AI"
    private String sender;

    @Field("content")
    private String content;

    @Field("timestamp")
    @Indexed
    private LocalDateTime timestamp;

    // No-argument constructor
    public Message() {
        this.timestamp = LocalDateTime.now(); // Gán giá trị mặc định
    }

    // Constructor tùy chỉnh
    public Message(String conversationId, String sender, String content) {
        this(); // Gọi no-arg constructor để set timestamp
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
    }

    // Constructor với tất cả các trường
    public Message(String id, String conversationId, String sender, String content, LocalDateTime timestamp) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }


    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
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

    // equals() and hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return Objects.equals(id, message.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // toString()
    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", conversationId='" + conversationId + '\'' +
                ", sender='" + sender + '\'' +
                ", content='" + (content != null && content.length() > 50 ? content.substring(0, 50) + "..." : content) + '\'' + // Rút gọn content nếu quá dài
                ", timestamp=" + timestamp +
                '}';
    }
}