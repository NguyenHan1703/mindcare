package com.mindcare.mindcare_backend.security.jwt;

import com.mindcare.mindcare_backend.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter { // Đảm bảo filter chỉ chạy 1 lần/request

    @Autowired
    private JwtUtils jwtUtils; // Tiện ích xử lý JWT

    @Autowired
    private UserDetailsServiceImpl userDetailsService; // Dịch vụ tải thông tin người dùng

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    // Xử lý logic lọc cho mỗi request.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request); // Lấy JWT token từ request header
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) { // Nếu token tồn tại và hợp lệ
                String username = jwtUtils.getUserNameFromJwtToken(jwt); // Lấy username từ token

                // Tải thông tin UserDetails từ username
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Tạo đối tượng Authentication
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()); // Danh sách quyền

                // Gắn thêm chi tiết của request vào đối tượng Authentication
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Đặt đối tượng Authentication vào SecurityContext.
                // Từ đây, Spring Security sẽ coi người dùng này đã được xác thực.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Không thể thiết lập xác thực người dùng: {}", e.getMessage());
            // AuthEntryPointJwt sẽ được kích hoạt nếu SecurityContext không có Authentication
        }
        filterChain.doFilter(request, response); // Chuyển request đến filter tiếp theo trong chuỗi
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization"); // Lấy giá trị của header "Authorization"

        // Kiểm tra xem header có tồn tại và có bắt đầu bằng "Bearer " không
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Trả về phần token (bỏ "Bearer ")
        }

        return null; // Không tìm thấy token hợp lệ
    }
}