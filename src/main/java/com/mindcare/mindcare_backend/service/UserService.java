package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.UserResponse;
import com.mindcare.mindcare_backend.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUser();
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    UserResponse updateUser(String id, String name, int age, MultipartFile avatarFile);
    void deleteUser(String id);
}
