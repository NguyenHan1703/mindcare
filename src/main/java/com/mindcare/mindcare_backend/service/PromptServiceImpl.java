package com.mindcare.mindcare_backend.service;

import com.mindcare.mindcare_backend.service.PromptService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PromptServiceImpl implements PromptService {

    @Override
    public Resource loadTherapyPrompt() {
        try {
            return new ClassPathResource("prompts/therapy_prompt.txt");
        } catch (Exception e) {
            throw new RuntimeException("Không thể tải prompt trị liệu", e);
        }
    }
}
