package com.mindcare.backend.service.impl;

import com.mindcare.backend.dto.emotion.DailyEmotionLogDto;
import com.mindcare.backend.dto.emotion.DailyEmotionLogRequest;
import com.mindcare.backend.exception.ResourceNotFoundException;
import com.mindcare.backend.model.DailyEmotionLog;
import com.mindcare.backend.model.User;
import com.mindcare.backend.repository.DailyEmotionLogRepository;
import com.mindcare.backend.repository.UserRepository;
import com.mindcare.backend.service.interfaces.DailyEmotionLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DailyEmotionLogServiceImpl implements DailyEmotionLogService {

    private static final Logger logger = LoggerFactory.getLogger(DailyEmotionLogServiceImpl.class);

    private final DailyEmotionLogRepository dailyEmotionLogRepository;
    private final UserRepository userRepository;

    @Autowired
    public DailyEmotionLogServiceImpl(DailyEmotionLogRepository dailyEmotionLogRepository,
                                      UserRepository userRepository) {
        this.dailyEmotionLogRepository = dailyEmotionLogRepository;
        this.userRepository = userRepository;
    }

    // Helper method để kiểm tra User tồn tại
    private User findUserByIdOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to operate on non-existent UserID: {}", userId);
                    return new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
                });
    }

    @Override
    @Transactional
    public DailyEmotionLogDto logOrUpdateDailyEmotion(String userId, DailyEmotionLogRequest emotionRequest) {
        findUserByIdOrThrow(userId); // Kiểm tra user tồn tại

        LocalDate today = LocalDate.now();
        logger.info("Logging or updating daily emotion for UserID: {} on Date: {} with Emotion: {}",
                userId, today, emotionRequest.getEmotion());

        Optional<DailyEmotionLog> existingLogOpt = dailyEmotionLogRepository.findByUserIdAndLogDate(userId, today);

        DailyEmotionLog logToSave;
        if (existingLogOpt.isPresent()) {
            logToSave = existingLogOpt.get();
            logger.debug("Existing emotion log found for UserID: {}, Date: {}. Updating emotion to: {}",
                    userId, today, emotionRequest.getEmotion());
            logToSave.setEmotion(emotionRequest.getEmotion());
            // Nếu có trường updatedAt, cập nhật ở đây. Hiện tại, model không có.
            // logToSave.setUpdatedAt(LocalDateTime.now());
        } else {
            logger.debug("No existing emotion log found for UserID: {}, Date: {}. Creating new log with Emotion: {}",
                    userId, today, emotionRequest.getEmotion());
            logToSave = new DailyEmotionLog(
                    userId,
                    emotionRequest.getEmotion(),
                    today
            );
        }

        DailyEmotionLog savedLog = dailyEmotionLogRepository.save(logToSave);
        logger.info("Daily emotion log saved/updated successfully for UserID: {}. LogID: {}", userId, savedLog.getId());
        return mapToDto(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyEmotionLogDto> getEmotionLogsForPeriod(String userId, LocalDate startDate, LocalDate endDate) {
        findUserByIdOrThrow(userId); // Kiểm tra user tồn tại
        logger.debug("Fetching emotion logs for UserID: {} from {} to {}", userId, startDate, endDate);

        List<DailyEmotionLog> logs = dailyEmotionLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, startDate, endDate);
        return logs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getEmotionStatsSummary(String userId, LocalDate startDate, LocalDate endDate) {
        findUserByIdOrThrow(userId); // Kiểm tra user tồn tại
        logger.debug("Fetching emotion stats summary for UserID: {} from {} to {}", userId, startDate, endDate);

        List<DailyEmotionLog> logs = dailyEmotionLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, startDate, endDate);

        return logs.stream()
                .collect(Collectors.groupingBy(
                        DailyEmotionLog::getEmotion,
                        Collectors.counting()
                ));
    }


    // Phương thức helper để map Entity sang DTO
    private DailyEmotionLogDto mapToDto(DailyEmotionLog dailyEmotionLog) {
        if (dailyEmotionLog == null) {
            return null;
        }
        return new DailyEmotionLogDto(
                dailyEmotionLog.getId(),
                dailyEmotionLog.getUserId(),
                dailyEmotionLog.getEmotion(),
                dailyEmotionLog.getLogDate(),
                dailyEmotionLog.getCreatedAt()
        );
    }
}