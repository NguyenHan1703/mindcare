package com.mindcare.backend.repository;

import com.mindcare.backend.model.DailyEmotionLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyEmotionLogRepository extends MongoRepository<DailyEmotionLog, String> {

    // Tìm kiếm một bản ghi cảm xúc hàng ngày của một người dùng cụ thể vào một ngày cụ thể.
    Optional<DailyEmotionLog> findByUserIdAndLogDate(String userId, LocalDate logDate);

    /**
     * Tìm kiếm tất cả các bản ghi cảm xúc hàng ngày của một người dùng cụ thể
     * trong một khoảng thời gian nhất định, sắp xếp theo ngày tăng dần.
     * Cho việc hiển thị lịch sử cảm xúc trên lịch hoặc biểu đồ.
     */
    List<DailyEmotionLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(String userId, LocalDate startDate, LocalDate endDate);


    void deleteAllByUserId(String userId);
}