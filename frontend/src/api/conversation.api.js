import apiClient from './apiClient.js'

/**
 * Gọi API để tạo một cuộc hội thoại mới.
 * Khi thành công, response.data sẽ chứa ConversationDto của cuộc hội thoại mới.
 */
export const createConversationApi = (title) => {
  // Backend endpoint: POST /api/conversations
  // Backend DTO (CreateConversationRequestDto) có thể nhận một object { title: "..." }
  // hoặc một body rỗng nếu title là tùy chọn và được xử lý ở backend.
  // Gửi object với title, dù title có thể là null/undefined.
  return apiClient.post('/conversations', { title })
}

/**
 * Gọi API để lấy danh sách tất cả các cuộc hội thoại của người dùng hiện tại.
 * Khi thành công, response.data sẽ là một mảng các ConversationDto.
 */
export const getUserConversationsApi = () => {
  // Backend endpoint: GET /api/conversations
  return apiClient.get('/conversations')
}

/**
 * Gọi API để lấy tất cả tin nhắn của một cuộc hội thoại cụ thể.
 * Khi thành công, response.data sẽ là một mảng các MessageDto.
 */
export const getConversationMessagesApi = (conversationId) => {
  // Backend endpoint: GET /api/conversations/{conversationId}/messages
  if (!conversationId) {
    return Promise.reject(new Error('conversationId là bắt buộc'))
  }
  return apiClient.get(`/conversations/${conversationId}/messages`)
}

/**
 * Gọi API để gửi một tin nhắn mới vào cuộc hội thoại.
 * Khi thành công, response.data sẽ là MessageDto của tin nhắn người dùng vừa gửi.
 */
export const saveUserMessageApi = (conversationId, content) => {
  if (!conversationId) {
    return Promise.reject(new Error('conversationId là bắt buộc'))
  }
  return apiClient.post(`/conversations/${conversationId}/messages`, { content })
}


/**
 * Gọi API để xóa một cuộc hội thoại.
 * Backend thường trả về status 204 No Content hoặc 200 OK với MessageResponse.
 */
export const deleteConversationApi = (conversationId) => {
  // Backend endpoint: DELETE /api/conversations/{conversationId}
  if (!conversationId) {
    return Promise.reject(new Error('conversationId là bắt buộc'))
  }
  return apiClient.delete(`/conversations/${conversationId}`)
}

/**
 * Gọi API để cập nhật tiêu đề của một cuộc hội thoại.
 * Khi thành công, response.data sẽ chứa ConversationDto của cuộc hội thoại đã được cập nhật.
 */
export const updateConversationTitleApi = (conversationId, newTitle) => {
  if (!conversationId || !newTitle) {
    return Promise.reject(new Error('conversationId và newTitle là bắt buộc'))
  }
  return apiClient.put(`/conversations/${conversationId}/title`, { title: newTitle })
}