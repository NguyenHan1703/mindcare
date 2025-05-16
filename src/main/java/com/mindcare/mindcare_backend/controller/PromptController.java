package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.*;
import com.mindcare.mindcare_backend.service.PromptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prompts")
@RequiredArgsConstructor
public class PromptController {

    private final PromptService promptService;

    @PostMapping
    public ResponseEntity<String> createPrompt(@RequestBody @Valid PromptRequest request) {
        promptService.savePrompt(request);
        return ResponseEntity.ok("Đã lưu prompt");
    }

    @GetMapping
    public ResponseEntity<List<PromptResponse>> getAllPrompts() {
        return ResponseEntity.ok(promptService.getAllPrompts());
    }
}
