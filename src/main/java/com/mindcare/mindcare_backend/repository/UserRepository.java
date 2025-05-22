package com.mindcare.mindcare_backend.repository;

import com.mindcare.mindcare_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByDisplayNameAndIdNot(String displayName, String id);
    Boolean existsByEmailAndIdNot(String email, String id);
}