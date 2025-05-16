package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.EmotionLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface EmotionLogRepository extends MongoRepository<EmotionLog, String> {
    List<EmotionLog> findByUserId(String userId);
    List<EmotionLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}
