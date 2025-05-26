package com.mindcare.backend.repository;

import com.mindcare.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository // Đánh dấu đây là một Spring Data repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    /**
     * Tìm tất cả các cuộc hội thoại của một người dùng cụ thể,
     * sắp xếp theo thời gian cập nhật cuối cùng giảm dần (cuộc hội thoại mới nhất lên đầu).
     *
     * @param userId ID của người dùng
     * @return Danh sách các Conversation
     */
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId);

    /**
     * Tìm một cuộc hội thoại cụ thể bằng ID và ID của người dùng.
     * Hữu ích để đảm bảo người dùng chỉ có thể truy cập vào cuộc hội thoại của chính họ.
     *
     * @param id ID của cuộc hội thoại
     * @param userId ID của người dùng
     * @return Optional chứa Conversation nếu tìm thấy và thuộc về người dùng
     */
    Optional<Conversation> findByIdAndUserId(String id, String userId);

    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh khác nếu cần
    // Ví dụ:
    // List<Conversation> findByUserIdAndTitleContainingIgnoreCase(String userId, String titleKeyword);
}