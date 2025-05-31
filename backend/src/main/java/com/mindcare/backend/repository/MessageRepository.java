package com.mindcare.backend.repository;

import com.mindcare.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Đánh dấu đây là một Spring Data repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Tìm tất cả các tin nhắn thuộc về một cuộc hội thoại cụ thể,
     * sắp xếp theo thời gian gửi tăng dần (tin nhắn cũ nhất lên đầu)
     */
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);

    /**
     * Tìm các tin nhắn thuộc về một cuộc hội thoại cụ thể với phân trang,
     * sắp xếp theo thời gian gửi giảm dần (tin nhắn mới nhất lên đầu - thường dùng cho lazy loading/infinite scroll)
     */
    Page<Message> findByConversationIdOrderByTimestampDesc(String conversationId, Pageable pageable);

    // Đếm số lượng tin nhắn trong một cuộc hội thoại
    long countByConversationId(String conversationId);

     // Xóa tất cả các tin nhắn thuộc về một conversationId cụ thể.
    void deleteAllByConversationId(String conversationId);
}