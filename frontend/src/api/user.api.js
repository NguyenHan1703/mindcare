import apiClient from './apiClient';

/**
 * Gọi API để lấy thông tin hồ sơ của người dùng hiện tại.
 * Backend endpoint: GET /api/users/me
 */
export const getUserProfileApi = () => {
  return apiClient.get('/users/me');
};

/**
 * Gọi API để cập nhật thông tin hồ sơ của người dùng hiện tại.
 * Backend endpoint: PUT /api/users/me
 * Ví dụ: { username: "newUsername", avatarUrl: "http://new.avatar.url/img.png" }
 * Các trường này phải khớp với UserUpdateProfileRequestDto ở backend.x
 */
export const updateUserProfileApi = (profileData) => {
  // profileData nên là một object có các key trùng với các trường trong
  // UserUpdateProfileRequestDto của backend (ví dụ: username, avatarUrl)
  return apiClient.put('/users/me', profileData);
};

export const changePasswordApi = (passwordData) => {
  // passwordData là một object, ví dụ:
  // {
  //   oldPassword: "currentPassword123",
  //   newPassword: "newStrongPassword456",
  //   confirmNewPassword: "newStrongPassword456" // Backend ChangePasswordRequest DTO cũng có trường này
  // }
  return apiClient.post('/users/me/change-password', passwordData);
};
