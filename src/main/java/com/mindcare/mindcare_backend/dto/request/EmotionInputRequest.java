package com.mindcare.mindcare_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class EmotionInputRequest {

    @NotBlank(message = "Thông tin cảm xúc không được để trống")
    private String emotion; // Chuỗi biểu thị cảm xúc, ví dụ: "HAPPY", "SAD"

    // Getters and Setters
    public String getEmotion() {
        return emotion;
    }

    public void setEmotion(String emotion) {
        this.emotion = emotion;
    }
}