package com.mindcare.backend.repository;

import com.mindcare.backend.enums.ERole;
import com.mindcare.backend.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Đánh dấu đây là một Spring Data repository
public interface RoleRepository extends MongoRepository<Role, String> {
    // Spring Data MongoDB sẽ tự động hiểu phương thức này
    // để tìm kiếm Role dựa trên trường 'name' (là kiểu ERole)
    Optional<Role> findByName(ERole name);
}