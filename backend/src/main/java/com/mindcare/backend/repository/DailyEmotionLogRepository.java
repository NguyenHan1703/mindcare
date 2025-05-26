package com.mindcare.backend.repository;

import com.mindcare.backend.model.DailyEmotionLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository // Đánh dấu đây là một Spring Data repository
public interface DailyEmotionLogRepository extends MongoRepository<DailyEmotionLog, String> {

    /**
     * Tìm kiếm một bản ghi cảm xúc hàng ngày của một người dùng cụ thể vào một ngày cụ thể.
     * Hữu ích để kiểm tra xem người dùng đã ghi nhận cảm xúc cho ngày đó chưa,
     * hoặc để lấy/cập nhật bản ghi hiện có (nếu logic upsert được áp dụng ở service).
     *
     * @param userId ID của người dùng
     * @param logDate Ngày ghi nhận
     * @return Optional chứa DailyEmotionLog nếu tìm thấy, ngược lại là Optional.empty()
     */
    Optional<DailyEmotionLog> findByUserIdAndLogDate(String userId, LocalDate logDate);

    /**
     * Tìm kiếm tất cả các bản ghi cảm xúc hàng ngày của một người dùng cụ thể
     * trong một khoảng thời gian nhất định, sắp xếp theo ngày tăng dần.
     * Hữu ích cho việc hiển thị lịch sử cảm xúc trên lịch hoặc biểu đồ.
     *
     * @param userId ID của người dùng
     * @param startDate Ngày bắt đầu (bao gồm)
     * @param endDate Ngày kết thúc (bao gồm)
     * @return Danh sách các DailyEmotionLog, sắp xếp theo logDate tăng dần
     */
    List<DailyEmotionLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(String userId, LocalDate startDate, LocalDate endDate);


    void deleteAllByUserId(String userId);
}