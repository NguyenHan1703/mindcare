package com.mindcare.mindcare_backend.dto.response;

import com.mindcare.mindcare_backend.model.EEmotionSource;
import java.time.LocalDate;

public class DailyEmotionLogResponse {
    private String id;              // ID của bản ghi log
    private String userId;          // ID của người dùng (có thể không cần nếu API đã theo context user)
    private LocalDate date;         // Ngày ghi nhận cảm xúc
    private String emotion;         // Tên cảm xúc (ví dụ: "HAPPY", "SAD")
    private EEmotionSource source;  // Nguồn gốc cảm xúc (ICON_SELECTION, TEXT_ANALYSIS)

    // Constructors
    public DailyEmotionLogResponse() {
    }

    public DailyEmotionLogResponse(String id, String userId, LocalDate date, String emotion, EEmotionSource source) {
        this.id = id;
        this.userId = userId; // Hữu ích nếu admin xem log của user khác
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
}
