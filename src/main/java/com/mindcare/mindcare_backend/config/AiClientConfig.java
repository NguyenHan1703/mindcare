package com.mindcare.mindcare_backend.config;

// import com.google.cloud.vertexai.VertexAI; // Ví dụ
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import java.io.IOException;

@Configuration
public class AiClientConfig {

    // @Value("${mindcare.app.gemini.projectId}")
    // private String projectId;

    // @Value("${mindcare.app.gemini.location}")
    // private String location;

    // @Bean
    // public VertexAI vertexAi() throws IOException {
    //     // Logic khởi tạo VertexAI client
    //     // return new VertexAI(projectId, location);
    //     return null; // Placeholder
    // }

    // Hoặc nếu bạn chỉ dùng RestTemplate/WebClient để gọi API Gemini:
    // @Bean
    // public RestTemplate geminiRestTemplate() {
    //     RestTemplate restTemplate = new RestTemplate();
    //     // Thêm các interceptor để gắn API key vào header nếu cần
    //     return restTemplate;
    // }
}