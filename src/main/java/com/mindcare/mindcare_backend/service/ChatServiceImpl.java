package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.exception.ResourceNotFoundException;
import com.mindcare.mindcare_backend.model.Chat;
import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.ChatRepository;
import com.mindcare.mindcare_backend.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ChatResponse createChat(ChatRequest chatRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Chat chat = new Chat();
        chat.setTitle(chatRequest.getTitle());
        chat.setMessages(chatRequest.getMessages());
        chat.setEmotion(chatRequest.getEmotion());
        chat.setTimestamp(LocalDateTime.now());
        chat.setUser(user);

        return modelMapper.map(chatRepository.save(chat), ChatResponse.class);
    }

    @Override
    public List<ChatResponse> getAllChatsForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return chatRepository.findByUserId(user.getId())
                .stream()
                .map(chat -> modelMapper.map(chat, ChatResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public ChatResponse getChatById(String chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        return modelMapper.map(chat, ChatResponse.class);
    }

    @Override
    public void deleteChatById(String chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found");
        }
        chatRepository.deleteById(chatId);
    }
}
