package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.DailyEmotionLog;
import com.mindcare.mindcare_backend.model.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyEmotionLogRepository extends MongoRepository<DailyEmotionLog, String> { // DailyEmotionLog là Entity, String là kiểu Id
    // Tìm kiếm bản ghi cảm xúc hàng ngày của một người dùng cụ thể vào một ngày cụ thể.
    // Hữu ích để kiểm tra xem người dùng đã ghi nhận cảm xúc cho ngày đó chưa,
    // hoặc để lấy/cập nhật bản ghi cảm xúc của ngày đó.
    Optional<DailyEmotionLog> findByUserIdAndDate(String userId, LocalDate date);

    // Tìm kiếm tất cả các bản ghi cảm xúc hàng ngày của một người dùng cụ thể
    // trong một khoảng thời gian cho trước.
    List<DailyEmotionLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate, Sort sort);

    // Xóa tất cả các bản ghi nhật ký cảm xúc của một người dùng cụ thể.
    void deleteAllByUserId(String userId);

}