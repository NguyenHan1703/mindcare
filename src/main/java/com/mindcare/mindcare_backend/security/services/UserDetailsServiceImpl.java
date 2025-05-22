package com.mindcare.mindcare_backend.security.services;

import com.mindcare.mindcare_backend.model.User;
import com.mindcare.mindcare_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Nó chịu trách nhiệm tải thông tin người dùng từ cơ sở dữ liệu (thông qua UserRepository)
// để Spring Security có thể thực hiện xác thực.

@Service // Đánh dấu đây là một Spring Bean thuộc tầng Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserRepository userRepository; // Inject UserRepository để truy cập CSDL

    // Tải thông tin chi tiết của người dùng dựa trên username (hoặc email).
    // Phương thức này được Spring Security gọi trong quá trình xác thực.

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Cố gắng tìm người dùng bằng username hoặc email.
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username or email: " + usernameOrEmail));

        // Xây dựng và trả về đối tượng UserDetailsImpl từ User model
        return UserDetailsImpl.build(user);
    }
}