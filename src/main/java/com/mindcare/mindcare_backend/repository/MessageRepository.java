package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    // Hiển thị lịch sử chat theo thời gian (timestamp) tăng dần.
    // Tìm kiếm tất cả các tin nhắn của một cuộc hội thoại cụ thể,
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);

    // Tìm kiếm các tin nhắn của một cuộc hội thoại cụ thể với phân trang và sắp xếp.
    Page<Message> findByConversationId(String conversationId, Pageable pageable);

    // Tìm kiếm N tin nhắn gần nhất của một cuộc hội thoại.
    List<Message> findTopNByConversationIdOrderByTimestampDesc(String conversationId, Pageable pageable);
    // List<Message> findFirst10ByConversationIdOrderByTimestampDesc(String conversationId); // Lấy 10 tin nhắn

    // Xóa tin nhắn của cuộc hội thoại
    void deleteAllByConversationId(String conversationId);
}