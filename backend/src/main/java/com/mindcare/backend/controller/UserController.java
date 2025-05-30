package com.mindcare.backend.controller;

import com.mindcare.backend.dto.response.MessageResponse;
import com.mindcare.backend.dto.user.ChangePasswordRequest;
import com.mindcare.backend.dto.user.UserProfileDto;
import com.mindcare.backend.dto.user.UserUpdateProfileRequestDto;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.security.services.UserDetailsImpl;
import com.mindcare.backend.service.interfaces.UserService;
import com.mindcare.backend.dto.emotion.DailyEmotionLogDto;
import com.mindcare.backend.dto.emotion.DailyEmotionLogRequest;
import com.mindcare.backend.dto.emotion.EmotionStatsResponseDto; // Import DTO mới
import com.mindcare.backend.service.interfaces.DailyEmotionLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Cho phép bảo vệ ở cấp độ phương thức
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Lấy thông tin user đang đăng nhập
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate; // Import LocalDate
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600) // Cân nhắc dùng cấu hình CORS global trong SecurityConfig
@RestController
@RequestMapping("/api/users") // Tiền tố chung cho các API liên quan đến user
public class UserController {

    private final UserService userService;
    private final DailyEmotionLogService dailyEmotionLogService;

    @Autowired
    public UserController(UserService userService, DailyEmotionLogService dailyEmotionLogService) {
        this.userService = userService;
        this.dailyEmotionLogService = dailyEmotionLogService;
    }

    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại đang đăng nhập.
     * Yêu cầu người dùng đã được xác thực.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()") // Chỉ người dùng đã xác thực mới có thể truy cập
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            UserProfileDto userProfile = userService.getUserProfile(currentUser.getId());
            return ResponseEntity.ok(userProfile);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể lấy thông tin người dùng."));
        }
    }

    /**
     * Cập nhật thông tin hồ sơ của người dùng hiện tại đang đăng nhập.
     * Yêu cầu người dùng đã được xác thực.
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                      @Valid @RequestBody UserUpdateProfileRequestDto updateRequest) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            UserProfileDto updatedProfile = userService.updateUserProfile(currentUser.getId(), updateRequest);
            return ResponseEntity.ok(updatedProfile);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) { // Bắt lỗi như username đã tồn tại
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể cập nhật thông tin người dùng."));
        }
    }

    /**
     * Thay đổi mật khẩu cho người dùng hiện tại đang đăng nhập.
     * Yêu cầu người dùng đã được xác thực.
     */
    @PostMapping("/me/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changeCurrentUserPassword(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                       @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            userService.changePassword(currentUser.getId(), changePasswordRequest);
            return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) { // Bắt lỗi như mật khẩu cũ sai, mật khẩu mới không khớp
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Lỗi: Không thể đổi mật khẩu."));
        }
    }
    /**
     * Ghi nhận hoặc cập nhật cảm xúc hàng ngày cho người dùng hiện tại.
     * Ngày ghi nhận sẽ được tự động lấy là ngày hiện tại trên server.
     */
    @PostMapping("/me/emotions/daily")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logOrUpdateDailyEmotion(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody DailyEmotionLogRequest emotionRequest) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        try {
            DailyEmotionLogDto loggedEmotion = dailyEmotionLogService.logOrUpdateDailyEmotion(currentUser.getId(), emotionRequest);
            return ResponseEntity.ok(loggedEmotion);
        } catch (Exception e) {
            // Log lỗi chi tiết ở server
            // logger.error("Error logging emotion for user {}: {}", currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Không thể ghi nhận cảm xúc. Vui lòng thử lại."));
        }
    }

    /**
     * Lấy lịch sử và thống kê tóm tắt cảm xúc của người dùng hiện tại trong một khoảng thời gian.
     */
    @GetMapping("/me/emotions/daily/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDailyEmotionStats(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Lỗi: Người dùng chưa được xác thực."));
        }
        // Kiểm tra tính hợp lệ của startDate và endDate
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Ngày bắt đầu và kết thúc không hợp lệ."));
        }
        try {
            List<DailyEmotionLogDto> dailyLogs = dailyEmotionLogService.getEmotionLogsForPeriod(currentUser.getId(), startDate, endDate);
            Map<String, Long> summary = dailyEmotionLogService.getEmotionStatsSummary(currentUser.getId(), startDate, endDate);

            EmotionStatsResponseDto responseDto = new EmotionStatsResponseDto(dailyLogs, summary);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            // Log lỗi chi tiết ở server
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: Không thể lấy dữ liệu thống kê cảm xúc."));
        }
    }
}