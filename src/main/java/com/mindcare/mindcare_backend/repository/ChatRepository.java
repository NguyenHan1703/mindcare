package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatRepository extends MongoRepository<Chat, String> {
    List<Chat> findByUserId(String userId);
}
