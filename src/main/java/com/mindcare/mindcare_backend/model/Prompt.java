package com.mindcare.mindcare_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prompts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String emotion; // ví dụ: "sad", "happy", etc.

    @Column(columnDefinition = "TEXT")
    private String content; // prompt chuẩn trị liệu để gửi đến AI
}
