import apiClient from './apiClient'

/**
 * Gọi API để lấy thông tin hồ sơ của người dùng hiện tại.
 * Backend endpoint: GET /api/users/me
 */
export const getUserProfileApi = () => {
  return apiClient.get('/users/me')
}

// Gọi API để cập nhật thông tin hồ sơ của người dùng hiện tại.

export const updateUserProfileApi = (profileData) => {
  // profileData nên là một object có các key trùng với các trường trong
  // UserUpdateProfileRequestDto của backend (ví dụ: username, avatarUrl)
  return apiClient.put('/users/me', profileData)
}

export const changePasswordApi = (passwordData) => {

  return apiClient.post('/users/me/change-password', passwordData)
}
