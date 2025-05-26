import apiClient from './apiClient';

/**
 * Gọi API để đăng nhập người dùng.
 * Khi thành công, response.data sẽ chứa JwtResponse từ backend.
 */
export const loginUserApi = (username, password) => {
  return apiClient.post('/auth/login', { // Endpoint của backend
    username,
    password,
  });
};

/**
 * Gọi API để đăng ký người dùng mới.
 * Khi thành công, response.data sẽ chứa MessageResponse từ backend.
 */
export const registerUserApi = (username, password) => {
  return apiClient.post('/auth/register', { // Endpoint của backend
    username,
    password,
  });
};

/**
 * Gọi API để xử lý yêu cầu quên mật khẩu/đặt lại mật khẩu.
 * Khi thành công, response.data có thể chứa MessageResponse từ backend.
 */
export const forgotPasswordApi = (username, newPassword) => {
  return apiClient.post('/auth/forgot-password', {
    username: username,
    newPassword: newPassword, // Kiểm tra trường này phải khớp với DTO ở backend?
  });
};

