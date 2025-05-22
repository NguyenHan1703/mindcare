package com.mindcare.mindcare_backend.service.impl;

import com.mindcare.mindcare_backend.dto.response.DailyEmotionLogResponse;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
// import com.mindcare.model.Conversation; // Không cần trực tiếp ở getEmotionStatistics
import com.mindcare.mindcare_backend.model.DailyEmotionLog;
import com.mindcare.mindcare_backend.model.EEmotionSource;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.ConversationRepository;
import com.mindcare.mindcare_backend.repository.DailyEmotionLogRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.service.EmotionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmotionServiceImpl implements EmotionService {

    private static final Logger logger = LoggerFactory.getLogger(EmotionServiceImpl.class);

    private final DailyEmotionLogRepository dailyEmotionLogRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    @Autowired
    public EmotionServiceImpl(DailyEmotionLogRepository dailyEmotionLogRepository,
                              UserRepository userRepository,
                              ConversationRepository conversationRepository) {
        this.dailyEmotionLogRepository = dailyEmotionLogRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
    }

    @Override
    @Transactional
    public DailyEmotionLogResponse recordOrUpdateDailyEmotion(String userId, String conversationId, LocalDate date, String emotion, EEmotionSource source) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<DailyEmotionLog> existingLogOpt = dailyEmotionLogRepository.findByUserIdAndDate(userId, date);

        DailyEmotionLog emotionLog;
        if (existingLogOpt.isPresent()) {
            emotionLog = existingLogOpt.get();
            if (source == EEmotionSource.ICON_SELECTION || emotionLog.getSource() != EEmotionSource.ICON_SELECTION) {
                emotionLog.setEmotion(emotion);
                emotionLog.setSource(source);
                logger.info("Cập nhật DailyEmotionLog cho User ID: {} vào ngày: {}, cảm xúc mới: {}, nguồn: {}", userId, date, emotion, source);
            } else {
                logger.info("DailyEmotionLog cho User ID: {} vào ngày: {} đã tồn tại với nguồn ICON_SELECTION, không cập nhật với nguồn TEXT_ANALYSIS.", userId, date);
                return mapToDailyEmotionLogResponse(emotionLog);
            }
        } else {
            emotionLog = new DailyEmotionLog(user, date, emotion, source);
            logger.info("Tạo DailyEmotionLog mới cho User ID: {} vào ngày: {}, cảm xúc: {}, nguồn: {}", userId, date, emotion, source);
        }

        DailyEmotionLog savedLog = dailyEmotionLogRepository.save(emotionLog);

        if (conversationId != null) {
            conversationRepository.findById(conversationId).ifPresent(conversation -> {
                conversation.setLatestEmotion(savedLog.getEmotion());
                conversationRepository.save(conversation);
                logger.debug("Đã cập nhật latestEmotion cho Conversation ID: {} thành {}", conversationId, savedLog.getEmotion());
            });
        }
        return mapToDailyEmotionLogResponse(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyEmotionLogResponse> getEmotionStatistics(String userId, LocalDate startDate, LocalDate endDate) {
        // 1. Kiểm tra User có tồn tại không
        if (!userRepository.existsById(userId)) {
            logger.warn("Yêu cầu thống kê cảm xúc cho User ID không tồn tại: {}", userId);
            throw new ResourceNotFoundException("User", "id", userId);
        }

        // 2. Kiểm tra tính hợp lệ của khoảng ngày (ví dụ: startDate không được sau endDate)
        if (startDate.isAfter(endDate)) {
            logger.warn("Ngày bắt đầu ({}) không thể sau ngày kết thúc ({}) cho thống kê cảm xúc của User ID: {}", startDate, endDate, userId);
            // Bạn có thể ném BadRequestException ở đây hoặc trả về danh sách rỗng tùy theo yêu cầu
            // throw new BadRequestException("Ngày bắt đầu không thể sau ngày kết thúc.");
            return List.of(); // Trả về danh sách rỗng nếu ngày không hợp lệ
        }

        // 3. Tạo đối tượng Sort để sắp xếp kết quả theo ngày tăng dần
        Sort sort = Sort.by(Sort.Direction.ASC, "date");

        // 4. Gọi repository để lấy dữ liệu
        List<DailyEmotionLog> logs = dailyEmotionLogRepository.findByUserIdAndDateBetween(userId, startDate, endDate, sort);
        logger.info("Lấy thành công {} bản ghi thống kê cảm xúc cho User ID: {} từ {} đến {}", logs.size(), userId, startDate, endDate);

        // 5. Map danh sách các DailyEmotionLog model sang danh sách DailyEmotionLogResponse DTO
        return logs.stream()
                .map(this::mapToDailyEmotionLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFirstEmotionLogOfDay(String userId, LocalDate date) {
        return dailyEmotionLogRepository.findByUserIdAndDate(userId, date).isEmpty();
    }

    private DailyEmotionLogResponse mapToDailyEmotionLogResponse(DailyEmotionLog log) {
        if (log == null) return null;
        return new DailyEmotionLogResponse(
                log.getId(),
                log.getUser().getId(), // Lấy ID từ đối tượng User được tham chiếu
                log.getDate(),
                log.getEmotion(),
                log.getSource()
        );
    }
}