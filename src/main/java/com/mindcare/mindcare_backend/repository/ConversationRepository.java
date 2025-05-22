package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.Conversation;
import com.mindcare.mindcare_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    // Tìm kiếm tất cả các cuộc hội thoại của một người dùng cụ thể
    // sắp xếp theo thời gian tin nhắn cuối cùng (lastMessageAt) giảm dần
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(String userId);

    // Tìm kiếm tất cả các cuộc hội thoại của một người dùng cụ thể với phân trang và sắp xếp
    // Yêu cầu dữ liệu của hội thoại theo trang, cần kiểm tra lại
    Page<Conversation> findByUserId(String userId, Pageable pageable);

    // Đếm số lượng cuộc hội thoại
    long countByUser(User user); // Hoặc long countByUserId(String userId);

    // Tìm kiếm một cuộc hội thoại dựa trên ID
    Optional<Conversation> findByIdAndUserId(String id, String userId);

    // Xóa tất cả các cuộc hội thoại thuộc về một người dùng cụ thể
    void deleteAllByUserId(String userId);
}
