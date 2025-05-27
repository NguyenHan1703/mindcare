import apiClient from './apiClient'

/**
 * Admin: Lấy danh sách tất cả người dùng.
 * Backend endpoint: GET /api/admin/users
 */
export const getAllUsersApi = () => {
  return apiClient.get('/admin/users')
}

/**
 * Admin: Lấy thông tin chi tiết của một người dùng theo ID.
 * Backend endpoint: GET /api/admin/users/{userId}
 */
export const getUserDetailsForAdminApi = (userId) => {
  if (!userId) {
    console.error('getUserDetailsForAdminApi: userId là bắt buộc')
    return Promise.reject(new Error('userId là bắt buộc'))
  }
  return apiClient.get(`/admin/users/${userId}`)
}

/**
 * Admin: Cập nhật thông tin người dùng.
 * Backend endpoint: PUT /api/admin/users/{userId}
 */
export const updateUserByAdminApi = (userId, updateData) => {
  if (!userId) {
    console.error('updateUserByAdminApi: userId là bắt buộc')
    return Promise.reject(new Error('userId là bắt buộc'))
  }
  if (!updateData) {
    console.error('updateUserByAdminApi: Dữ liệu cập nhật là bắt buộc')
    return Promise.reject(new Error('Dữ liệu cập nhật là bắt buộc'))
  }
  return apiClient.put(`/admin/users/${userId}`, updateData)
}

/**
 * Admin: Xóa một người dùng.
 * Backend endpoint: DELETE /api/admin/users/{userId}
 */
export const deleteUserApi = (userId) => {
  if (!userId) {
    console.error('deleteUserApi: userId là bắt buộc')
    return Promise.reject(new Error('userId là bắt buộc'))
  }
  return apiClient.delete(`/admin/users/${userId}`)
}

/**
 * Admin: Thêm một người dùng mới.
 * Backend endpoint: POST /api/admin/users
 */
export const addUserByAdminApi = (userData) => {
  if (!userData || !userData.username || !userData.password) {
    console.error('addUserByAdminApi: Username và password là bắt buộc')
    return Promise.reject(new Error('Username và password là bắt buộc để tạo người dùng mới'))
  }
  return apiClient.post('/admin/users', userData)
}

/**
 * Admin: Xem danh sách các cuộc hội thoại của một người dùng cụ thể.
 * Backend endpoint: GET /api/admin/users/{targetUserId}/conversations
 */
export const getUserConversationsForAdminApi = (targetUserId) => {
  if (!targetUserId) {
    console.error('getUserConversationsForAdminApi: targetUserId là bắt buộc')
    return Promise.reject(new Error('targetUserId là bắt buộc'))
  }
  return apiClient.get(`/admin/users/${targetUserId}/conversations`)
}

/**
 * Admin: Xem thống kê cảm xúc của một người dùng cụ thể trong một khoảng thời gian.
 * Backend endpoint: GET /api/admin/users/{targetUserId}/emotions/stats?startDate=...&endDate=...
 */
export const getUserEmotionStatsForAdminApi = (targetUserId, startDate, endDate) => {
  if (!targetUserId || !startDate || !endDate) {
    console.error('getUserEmotionStatsForAdminApi: targetUserId, startDate và endDate là bắt buộc')
    return Promise.reject(new Error('targetUserId, startDate và endDate là bắt buộc'))
  }
  return apiClient.get(`/admin/users/${targetUserId}/emotions/stats`, {
    params: {
      startDate,
      endDate,
    },
  })
}

/**
 * Admin: Lấy tất cả tin nhắn của một cuộc hội thoại cụ thể (không kiểm tra sở hữu user).
 * Giả định backend có endpoint: GET /api/admin/conversations/{conversationId}/messages
 */
export const getMessagesForConversationByAdminApi = (conversationId) => {
  if (!conversationId) {
    console.error('getMessagesForConversationByAdminApi: conversationId là bắt buộc')
    return Promise.reject(new Error('conversationId là bắt buộc'))
  }
  return apiClient.get(`/admin/conversations/${conversationId}/messages`)
}