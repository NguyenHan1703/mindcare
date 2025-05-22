package com.mindcare.mindcare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles") // Đánh dấu lớp này là một Document MongoDB, lưu trong collection "roles"
public class Role {

    @Id // Đánh dấu trường này là khóa chính (_id) của document
    private String id;

    @Indexed(unique = true) // Đánh index cho trường 'name' và đảm bảo giá trị là duy nhất
    // Điều này quan trọng để tránh trùng lặp vai trò (ví dụ: không có 2 record cùng là ROLE_USER)
    private ERole name;     // Tên của vai trò, sử dụng Enum ERole để đảm bảo tính nhất quán

    public Role() {
        // Constructor rỗng cần thiết cho MongoDB/Jackson
    }

    public Role(ERole name) {
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ERole getName() {
        return name;
    }

    public void setName(ERole name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Role{" +
                "id='" + id + '\'' +
                ", name=" + name +
                '}';
    }
}
