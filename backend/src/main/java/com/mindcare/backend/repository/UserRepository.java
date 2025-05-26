package com.mindcare.backend.repository;

import com.mindcare.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Đánh dấu đây là một Spring Data repository
public interface UserRepository extends MongoRepository<User, String> {
    // Tìm kiếm User dựa trên trường 'username'
    Optional<User> findByUsername(String username);

    // Kiểm tra sự tồn tại của User dựa trên 'username'
    Boolean existsByUsername(String username);


}