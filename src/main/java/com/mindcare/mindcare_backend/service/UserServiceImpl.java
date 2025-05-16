package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.UserResponse;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.security.JwtUtils;
import com.mindcare.mindcare_backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> modelMapper.map(user, UserResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse updateUser(String id, String name, int age, MultipartFile avatarFile) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setName(name);
        user.setAge(age);

        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String base64Avatar = Base64.getEncoder().encodeToString(avatarFile.getBytes());
                user.setAvatar(base64Avatar);
            } catch (IOException e) {
                throw new RuntimeException("Error while processing avatar image", e);
            }
        }

        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }

    @Override
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
