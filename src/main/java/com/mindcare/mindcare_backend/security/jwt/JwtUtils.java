package com.mindcare.mindcare_backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails; // Sử dụng UserDetails của Spring
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component // Đánh dấu là một Spring Bean để có thể inject vào các lớp khác
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // Lấy giá trị jwtSecret từ file application.properties
    // Ví dụ: mindcare.app.jwtSecret=yourVeryLongAndSecureSecretKeyForMindCareApp
    // Secret key này phải đủ dài và phức tạp. Nên được tạo ngẫu nhiên.
    @Value("${mindcare.app.jwtSecret}")
    private String jwtSecret;

    // Lấy giá trị jwtExpirationMs từ file application.properties
    // Ví dụ: mindcare.app.jwtExpirationMs=86400000 (24 giờ)
    @Value("${mindcare.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", ((com.mindcare.mindcare_backend.security.services.UserDetailsImpl) userPrincipal).getId());
        claims.put("roles", userPrincipal.getAuthorities());

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername())) // Subject của token là username
                // .setClaims(claims) // Thêm custom claims nếu có
                .setIssuedAt(new Date()) // Thời điểm token được tạo
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Thời điểm token hết hạn
                .signWith(key(), SignatureAlgorithm.HS512) // Ký token với secret key và thuật toán HS512
                .compact();
    }
    // Tạo signing key từ jwtSecret
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Lấy username từ JWT token.
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Xác thực tính hợp lệ của JWT token.
    // Kiểm tra xem token có bị sai định dạng, hết hạn, không được hỗ trợ, hoặc chữ ký không hợp lệ.
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // Trích xuất claims từ token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody();
    }
    // Lấy ngày hết hạn
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

}
