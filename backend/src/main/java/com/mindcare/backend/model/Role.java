package com.mindcare.backend.model;

import com.mindcare.backend.enums.ERole;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Objects;

@Document(collection = "roles")
public class Role {

    @Id
    private String id;

    @Field("name")
    private ERole name;

    // No-argument constructor (constructor không tham số)
    public Role() {
    }

    // Constructor với tham số
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

    // equals() and hashCode() - thường dựa trên 'id' nếu không null
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        // Nếu id là null, chỉ bằng nhau nếu cả hai đều là cùng một object hoặc cả hai id đều null
        // và các trường khác bằng nhau. Để đơn giản, nếu id được set, chúng ta chỉ so sánh id.
        if (id != null && role.id != null) {
            return Objects.equals(id, role.id);
        }
        return Objects.equals(name, role.name); // Fallback nếu id chưa được set
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name); // Sử dụng id nếu có, nếu không thì name
    }

    // toString()
    @Override
    public String toString() {
        return "Role{" +
                "id='" + id + '\'' +
                ", name=" + name +
                '}';
    }
}