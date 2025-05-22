package com.mindcare.mindcare_backend.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mindcare.mindcare_backend.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L; // Cần thiết cho Serializable interface

    private String id;
    private String username;
    private String email;
    @JsonIgnore // Mật khẩu không nên được serialize và gửi đi trong response JSON
    private String password;
    private String displayName;
    private String avatarUrl;

    // Collection các quyền (roles) của người dùng
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String id, String username, String email, String password,
                           String displayName, String avatarUrl,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.authorities = authorities;
    }

    // Phương thức factory để tạo một đối tượng UserDetailsImpl từ một đối tượng User model.

    public static UserDetailsImpl build(User user) {
        // Chuyển đổi Set<Role> từ User model thành List<GrantedAuthority>
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name())) // Lấy tên Enum của Role
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                authorities);
    }

    // Triển khai các phương thức của interface UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities; // Trả về danh sách quyền của người dùng
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() { return displayName; }

    public String getAvatarUrl() { return avatarUrl; }


    @Override
    public String getPassword() {
        return password; // Trả về mật khẩu (đã hash)
    }

    @Override
    public String getUsername() {
        return username; // Trả về username
    }

    // Các phương thức sau định nghĩa trạng thái của tài khoản.
    // Cập nhập nếu muốn xây dựng thêm active or inactive tài khoản
    @Override
    public boolean isAccountNonExpired() {
        return true; // Tài khoản không bao giờ hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Tài khoản không bao giờ bị khóa
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Thông tin đăng nhập (mật khẩu)
    }

    @Override
    public boolean isEnabled() {
        return true; // Tài khoản luôn được kích hoạt
    }

    // Ghi đè equals và hashCode để so sánh các đối tượng UserDetailsImpl dựa trên id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
