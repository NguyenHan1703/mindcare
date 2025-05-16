package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.EmotionLogRequest;
import com.mindcare.mindcare_backend.dto.EmotionLogResponse;

import java.util.List;

public interface EmotionService {
    void logEmotion(EmotionLogRequest request);
    List<EmotionLogResponse> getEmotionHistoryForCurrentUser();
}
