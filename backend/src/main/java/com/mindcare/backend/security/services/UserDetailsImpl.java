package com.mindcare.backend.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mindcare.backend.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    @Serial
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String username;
    @JsonIgnore // Không gửi mật khẩu trong response JSON
    private final String password;
    private final String avatarUrl; // Thêm avatarUrl nếu bạn muốn dùng trong UserDetails

    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String id, String username, String password, String avatarUrl,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.avatarUrl = avatarUrl;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getAvatarUrl(), // Lấy avatarUrl từ User entity
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Bạn có thể thêm logic này nếu cần
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Bạn có thể thêm logic này nếu cần
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Bạn có thể thêm logic này nếu cần
    }

    @Override
    public boolean isEnabled() {
        return true; // Bạn có thể thêm logic này nếu cần (ví dụ: user có active không)
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}