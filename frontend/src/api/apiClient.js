import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../constants/apiConfig' // Import baseURL đã cấu hình

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Có thể thêm các headers mặc định khác ở đây nếu cần
  },
  timeout: 60000, // Timeout sau 60 giây
})

// Request Interceptor: Tự động đính kèm JWT token vào header Authorization
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Log request để debug (tùy chọn, có thể xóa ở production)
    console.log(
      `Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.params || '',
      config.data || ''
    )
    return config
  },
  (error) => {
    console.error('Request Interceptor Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor: (Tùy chọn) Xử lý lỗi chung từ API
apiClient.interceptors.response.use(
  (response) => {
    // Log response để debug (tùy chọn)
    console.log(
      `Response: ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}`,
      response.status,
      response.data
    )
    // Bất kỳ status code nào nằm trong khoảng 2xx đều khiến hàm này được trigger
    // Không làm gì cả, chỉ trả về response
    return response
  },
  async (error) => {
    // Bất kỳ status code nào nằm ngoài khoảng 2xx đều khiến hàm này được trigger
    const originalRequest = error.config
    console.error(
      `Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`,
      error.response?.status,
      error.response?.data || error.message
    )

    if (error.response?.status === 401) {
      // Lỗi 401 (Unauthorized) - Token không hợp lệ hoặc hết hạn
      console.log('Received 401 Unauthorized. Token might be invalid or expired.')
      await AsyncStorage.removeItem('userToken')
      await AsyncStorage.removeItem('userInfo')
    }
    // Trả về lỗi để các hàm gọi API ở tầng service có thể bắt và xử lý tiếp
    return Promise.reject(error)
  }
)

export default apiClient