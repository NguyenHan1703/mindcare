package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.dto.EmotionLogRequest;
import com.mindcare.mindcare_backend.dto.EmotionLogResponse;
import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.EmotionLog;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.EmotionLogRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import com.mindcare.mindcare_backend.service.EmotionService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmotionServiceImpl implements EmotionService {

    @Autowired
    private EmotionLogRepository emotionLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void logEmotion(EmotionLogRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EmotionLog log = new EmotionLog();
        log.setUser(user);
        log.setEmotion(request.getEmotion());
        log.setTimestamp(LocalDate.now());

        emotionLogRepository.save(log);
    }

    @Override
    public List<EmotionLogResponse> getEmotionHistoryForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return emotionLogRepository.findByUserId(user.getId())
                .stream()
                .map(log -> modelMapper.map(log, EmotionLogResponse.class))
                .collect(Collectors.toList());
    }
}
