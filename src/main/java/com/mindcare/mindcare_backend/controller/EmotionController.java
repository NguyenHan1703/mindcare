package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.*;
import com.mindcare.mindcare_backend.service.EmotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emotion")
@RequiredArgsConstructor
public class EmotionController {

    private final EmotionService emotionService;

    @PostMapping("/log")
    public ResponseEntity<String> logEmotion(@RequestBody @Valid EmotionLogRequest request) {
        emotionService.logEmotion(request);
        return ResponseEntity.ok("Cảm xúc đã được ghi lại");
    }

    @GetMapping("/logs/{userId}")
    public ResponseEntity<List<EmotionLogResponse>> getLogs(@PathVariable String userId) {
        return ResponseEntity.ok(emotionService.getEmotionLogs(userId));
    }
}
