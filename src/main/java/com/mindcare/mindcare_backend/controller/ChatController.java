package com.mindcare.mindcare_backend.controller;

import com.mindcare.mindcare_backend.dto.*;
import com.mindcare.mindcare_backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody @Valid ChatRequest request) {
        return ResponseEntity.ok(chatService.chat(request));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatSummaryResponse>> getAllChats(@PathVariable String userId) {
        return ResponseEntity.ok(chatService.getAllChats(userId));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable String chatId) {
        chatService.deleteChat(chatId);
        return ResponseEntity.ok("Đã xóa cuộc hội thoại");
    }
}
