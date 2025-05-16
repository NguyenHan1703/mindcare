package com.mindcare.mindcare_backend.service;

import java.util.List;

public interface ChatService {
    ChatResponse createChat(ChatRequest chatRequest);
    List<ChatResponse> getAllChatsForCurrentUser();
    ChatResponse getChatById(String chatId);
    void deleteChatById(String chatId);
}
