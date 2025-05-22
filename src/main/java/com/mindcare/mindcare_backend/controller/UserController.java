package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.request.UserProfileUpdateRequest;
import com.mindcare.mindcare_backend.dto.response.DailyEmotionLogResponse; // Thêm import
import com.mindcare.mindcare_backend.dto.response.GenericApiResponse;
import com.mindcare.mindcare_backend.dto.response.UserResponse;
import com.mindcare.mindcare_backend.security.services.UserDetailsImpl;
import com.mindcare.mindcare_backend.service.EmotionService; // Thêm import
import com.mindcare.mindcare_backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat; // Thêm import
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('USER')")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final EmotionService emotionService; // Inject EmotionService

    @Autowired
    public UserController(UserService userService, EmotionService emotionService) {
        this.userService = userService;
        this.emotionService = emotionService; // Khởi tạo
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("Yêu cầu lấy thông tin profile cho User ID: {}", currentUser.getId());
        UserResponse userProfile = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping(value = "/me", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<GenericApiResponse<UserResponse>> updateUserProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestPart(value = "profileData", required = false) UserProfileUpdateRequest updateRequest,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {

        logger.info("Yêu cầu cập nhật profile cho User ID: {}", currentUser.getId());
        UserProfileUpdateRequest actualUpdateRequest = (updateRequest == null) ? new UserProfileUpdateRequest() : updateRequest;
        UserResponse updatedUserProfile = userService.updateUserProfile(currentUser.getId(), actualUpdateRequest, avatarFile);
        return ResponseEntity.ok(GenericApiResponse.success(updatedUserProfile, "Cập nhật hồ sơ thành công."));
    }

    // API endpoint để người dùng xem thống kê cảm xúc của chính họ.

    @GetMapping("/me/emotions/statistics")
    public ResponseEntity<List<DailyEmotionLogResponse>> getMyEmotionStatistics(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        logger.info("User ID: {} yêu cầu thống kê cảm xúc từ {} đến {}", currentUser.getId(), startDate, endDate);
        List<DailyEmotionLogResponse> statistics = emotionService.getEmotionStatistics(currentUser.getId(), startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
}