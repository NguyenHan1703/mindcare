import apiClient from './apiClient';

/**
 * Gọi API để tạo một cuộc hội thoại mới.
 * @param {string | null | undefined} title (Tùy chọn) Tiêu đề cho cuộc hội thoại.
 * Nếu là null hoặc undefined, backend có thể sẽ tạo tiêu đề mặc định.
 * @returns {Promise} Promise trả về từ Axios (apiClient).
 * Khi thành công, response.data sẽ chứa ConversationDto của cuộc hội thoại mới.
 */
export const createConversationApi = (title) => {
  // Backend endpoint: POST /api/conversations
  // Backend DTO (CreateConversationRequestDto) có thể nhận một object { title: "..." }
  // hoặc một body rỗng nếu title là tùy chọn và được xử lý ở backend.
  // Gửi object với title, dù title có thể là null/undefined.
  return apiClient.post('/conversations', { title });
};

/**
 * Gọi API để lấy danh sách tất cả các cuộc hội thoại của người dùng hiện tại.
 * @returns {Promise} Promise trả về từ Axios (apiClient).
 * Khi thành công, response.data sẽ là một mảng các ConversationDto.
 */
export const getUserConversationsApi = () => {
  // Backend endpoint: GET /api/conversations
  return apiClient.get('/conversations');
};

/**
 * Gọi API để lấy tất cả tin nhắn của một cuộc hội thoại cụ thể.
 * @param {string} conversationId ID của cuộc hội thoại
 * @returns {Promise} Promise trả về từ Axios (apiClient).
 * Khi thành công, response.data sẽ là một mảng các MessageDto.
 */
export const getConversationMessagesApi = (conversationId) => {
  // Backend endpoint: GET /api/conversations/{conversationId}/messages
  if (!conversationId) {
    return Promise.reject(new Error("conversationId là bắt buộc"));
  }
  return apiClient.get(`/conversations/${conversationId}/messages`);
};

/**
 * Gọi API để gửi một tin nhắn mới vào cuộc hội thoại.
 * @param {string} conversationId ID của cuộc hội thoại
 * @param {string} content Nội dung của tin nhắn
 * @returns {Promise} Promise trả về từ Axios (apiClient).
 * Khi thành công, response.data sẽ là MessageDto của tin nhắn người dùng vừa gửi.
 */
export const saveUserMessageApi = (conversationId, content) => {
  // Backend endpoint: POST /api/conversations/{conversationId}/messages
  // Backend DTO (MessageRequest) mong đợi { content: "..." }
  if (!conversationId) {
    return Promise.reject(new Error("conversationId là bắt buộc"));
  }
  return apiClient.post(`/conversations/${conversationId}/messages`, { content });
};


/**
 * Gọi API để xóa một cuộc hội thoại.
 * @param {string} conversationId ID của cuộc hội thoại cần xóa.
 * @returns {Promise} Promise trả về từ Axios (apiClient).
 * Backend thường trả về status 204 No Content hoặc 200 OK với MessageResponse.
 */
export const deleteConversationApi = (conversationId) => {
  // Backend endpoint: DELETE /api/conversations/{conversationId}
  if (!conversationId) {
    return Promise.reject(new Error("conversationId là bắt buộc"));
  }
  return apiClient.delete(`/conversations/${conversationId}`);
};

// Các hàm API khác liên quan đến conversation có thể được thêm vào đây sau.