package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.ERole;
import com.mindcare.mindcare_backend.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * RoleRepository là interface chịu trách nhiệm truy cập dữ liệu cho các đối tượng Role
 * trong MongoDB. Nó mở rộng MongoRepository để có các phương thức CRUD cơ bản.
 */

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
    boolean existsByName(ERole name);
}
