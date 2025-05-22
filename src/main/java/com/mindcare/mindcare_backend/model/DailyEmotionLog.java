package com.mindcare.mindcare_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate; // Chỉ lưu trữ ngày, không cần thời gian cụ thể trong ngày
import java.time.LocalDateTime;

@Document(collection = "daily_emotion_logs")
// Tạo một compound index trên 'user' và 'date' và đảm bảo nó là duy nhất.
// Điều này ngăn chặn việc có nhiều hơn một bản ghi cảm xúc cho cùng một người dùng vào cùng một ngày.
@CompoundIndexes({
        @CompoundIndex(name = "user_date_unique_idx", def = "{'user': 1, 'date': 1}", unique = true)
})
public class DailyEmotionLog {

    @Id
    private String id;

    @DBRef
    @NotNull(message = "Người dùng không được để trống")
    private User user;

    @NotNull(message = "Ngày ghi nhận cảm xúc không được để trống")
    private LocalDate date; // Ngày cụ thể mà cảm xúc này được ghi nhận

    @NotBlank(message = "Trường cảm xúc không được để trống")
    private String emotion; // Tên của cảm xúc (ví dụ: "HAPPY", "SAD", "ANXIOUS", "CALM").

    @NotNull(message = "Nguồn gốc cảm xúc không được để trống")
    private EEmotionSource source; // Từ Enum EEmotionSource).

    @CreatedDate // Thời gian bản ghi này được tạo
    private LocalDateTime createdAt;

    @LastModifiedDate // Thời gian bản ghi này được cập nhật lần cuối
    private LocalDateTime updatedAt;


    // Constructors
    public DailyEmotionLog() {
    }

    public DailyEmotionLog(User user, LocalDate date, String emotion, EEmotionSource source) {
        this.user = user;
        this.date = date;
        this.emotion = emotion;
        this.source = source;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getEmotion() {
        return emotion;
    }

    public void setEmotion(String emotion) {
        this.emotion = emotion;
    }

    public EEmotionSource getSource() {
        return source;
    }

    public void setSource(EEmotionSource source) {
        this.source = source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "DailyEmotionLog{" +
                "id='" + id + '\'' +
                ", userId=" + (user != null ? user.getId() : "null") +
                ", date=" + date +
                ", emotion='" + emotion + '\'' +
                ", source=" + source +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}