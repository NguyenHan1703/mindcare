package com.mindcare.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
// import org.springframework.data.mongodb.core.index.Indexed; // Đã có trong CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Document(collection = "daily_emotion_logs")
@CompoundIndex(name = "user_date_emotion_idx", def = "{'user_id' : 1, 'log_date': 1}", unique = true)
public class DailyEmotionLog {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("emotion")
    private String emotion;

    @Field("log_date")
    private LocalDate logDate;

    @Field("created_at")
    private LocalDateTime createdAt;

    // No-argument constructor
    public DailyEmotionLog() {
        this.createdAt = LocalDateTime.now(); // Có thể gán giá trị mặc định
    }

    // Constructor tùy chỉnh
    public DailyEmotionLog(String userId, String emotion, LocalDate logDate) {
        this.userId = userId;
        this.emotion = emotion;
        this.logDate = logDate;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor với tất cả các trường (nếu cần)
    public DailyEmotionLog(String id, String userId, String emotion, LocalDate logDate, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.emotion = emotion;
        this.logDate = logDate;
        this.createdAt = createdAt;
    }


    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmotion() {
        return emotion;
    }

    public void setEmotion(String emotion) {
        this.emotion = emotion;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // equals() and hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DailyEmotionLog that = (DailyEmotionLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // toString()
    @Override
    public String toString() {
        return "DailyEmotionLog{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", emotion='" + emotion + '\'' +
                ", logDate=" + logDate +
                ", createdAt=" + createdAt +
                '}';
    }
}