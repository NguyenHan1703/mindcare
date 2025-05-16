package com.mindcare.mindcare_backend.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Getter
@Component
public class PromptLoader {

    private String therapyPrompt;

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("prompt/therapy_prompt.txt");
            this.therapyPrompt = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            log.info("Prompt mẫu được load thành công.");
        } catch (IOException e) {
            log.error("Không thể đọc file therapy_prompt.txt", e);
            this.therapyPrompt = "";
        }
    }
}
