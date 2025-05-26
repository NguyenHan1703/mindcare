package com.mindcare.backend.dto.response;

import lombok.AllArgsConstructor; // Quan trọng để tạo constructor với tất cả các trường
import lombok.Data;            // Quan trọng để tạo getters, setters, etc.
import lombok.NoArgsConstructor;  // Quan trọng để tạo constructor không tham số

@Data            // Tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor   // Tạo constructor không tham số: public MessageResponse() {}
@AllArgsConstructor  // Tạo constructor với tất cả các trường: public MessageResponse(String message) {}
public class MessageResponse {
    private String message;
}