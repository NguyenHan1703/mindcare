// src/constants/routes.js

// Màn hình Xác thực (Auth Screens)
export const LOGIN_SCREEN = 'LoginScreen'
export const REGISTER_SCREEN = 'RegisterScreen'
export const FORGOT_PASSWORD_SCREEN = 'ForgotPasswordScreen'

// Màn hình của Người dùng thường (User Screens)
export const HOME_SCREEN = 'HomeScreen' // Danh sách hội thoại
export const CHAT_SCREEN = 'ChatScreen' // Chat chi tiết
export const PROFILE_SCREEN = 'ProfileScreen' // Hồ sơ người dùng
export const CHANGE_PASSWORD_SCREEN = 'ChangePasswordScreen' // Đổi mật khẩu (từ Profile)
export const PROFILE_DETAIL_SCREEN = 'ProfileDetailScreen' // Quản lý thông tin chi tiết (từ Profile)
export const STATISTIC_SCREEN = 'StatisticScreen' // Thống kê cảm xúc (từ Profile)
export const RELAXATION_SCREEN = 'RelaxationScreen'

// Màn hình của Quản trị viên (Admin Screens)
export const ADMIN_DASHBOARD_SCREEN = 'AdminDashboardScreen' // Bảng điều khiển Admin
export const ADMIN_ADD_USER_SCREEN = 'AdminAddUserScreen' // Admin thêm người dùng mới
export const ADMIN_EDIT_USER_SCREEN = 'AdminEditUserScreen' // Admin sửa thông tin người dùng
export const ADMIN_USER_EMOTION_STATS_SCREEN = 'AdminUserEmotionStatsScreen' // Admin xem thống kê cảm xúc của user
export const ADMIN_USER_CONVERSATION_LIST_SCREEN = 'AdminUserConversationListScreen' // Admin xem danh sách hội thoại của user
export const ADMIN_USER_CHAT_VIEW_SCREEN = 'AdminUserChatViewScreen' // Admin xem chi tiết chat của user

// (Tùy chọn) Tên cho các Stack Navigator (nếu bạn muốn dùng hằng số cho cả navigator)
export const AUTH_NAVIGATOR = 'AuthNavigator'
export const USER_NAVIGATOR = 'UserNavigator'
export const ADMIN_NAVIGATOR = 'AdminNavigator'
export const PROFILE_STACK_NAVIGATOR = 'ProfileStackNavigator' // Ví dụ nếu Profile có stack riêng
