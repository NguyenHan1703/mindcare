import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Giả sử bạn sẽ tạo các hàm API này trong src/api/auth.api.js
import { loginUserApi, registerUserApi } from '../api/auth.api';
// Giả sử apiClient sẽ được cấu hình để tự động đính kèm token
// import apiClient from '../api/apiClient'; // Có thể không cần trực tiếp ở đây nếu api functions đã dùng

// --- Định nghĩa State ban đầu và Reducer ---
const initialState = {
  isLoading: true,    // Trạng thái loading ban đầu khi kiểm tra token
  userToken: null,    // JWT Token
  userInfo: null,     // Thông tin người dùng { id, username, roles, avatarUrl }
  error: null,        // Để lưu trữ lỗi nếu có
};

// Định nghĩa các action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS', // Có thể không thay đổi state nhiều, chủ yếu là thông báo
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGIN_FAIL: 'LOGIN_FAIL',
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const authReducer = (prevState, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...prevState,
        isLoading: action.payload,
        error: null, // Xóa lỗi khi bắt đầu loading mới
      };
    case ActionTypes.RESTORE_TOKEN:
      return {
        ...prevState,
        userToken: action.token,
        userInfo: action.userInfo,
        isLoading: false,
        error: null,
      };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...prevState,
        userToken: action.token,
        userInfo: action.userInfo,
        isLoading: false,
        error: null,
      };
    case ActionTypes.LOGIN_FAIL:
      return {
        ...prevState,
        userToken: null,
        userInfo: null,
        isLoading: false,
        error: action.error,
      };
    case ActionTypes.LOGOUT:
      return {
        ...prevState,
        userToken: null,
        userInfo: null,
        isLoading: false,
        error: null,
      };
    case ActionTypes.REGISTER_SUCCESS: // Đăng ký thành công có thể không thay đổi state ở đây
      return {                         // mà chỉ điều hướng hoặc hiển thị thông báo.
        ...prevState,                  // User sẽ đăng nhập riêng.
        isLoading: false,
        error: null,
      };
    case ActionTypes.REGISTER_FAIL:
      return {
        ...prevState,
        isLoading: false,
        error: action.error,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...prevState,
        error: action.error,
        isLoading: false, // Thường thì khi có lỗi, loading nên dừng
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...prevState,
        error: null,
      };
    default:
      return prevState;
  }
};

// --- Tạo Context ---
const AuthContext = createContext();

// --- Tạo Provider Component ---
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Hàm kiểm tra token đã lưu khi khởi động app
  const checkAuthState = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (token && storedUserInfo) {
        dispatch({ type: ActionTypes.RESTORE_TOKEN, token, userInfo: JSON.parse(storedUserInfo) });
      } else {
        dispatch({ type: ActionTypes.LOGOUT }); // Đảm bảo state sạch nếu không có token
      }
    } catch (e) {
      console.error('Lỗi khi khôi phục token:', e);
      dispatch({ type: ActionTypes.LOGOUT }); // Lỗi thì logout
    } finally {
      // Dù có token hay không, việc kiểm tra đã xong
      // dispatch({ type: ActionTypes.SET_LOADING, payload: false }); 
      // SET_LOADING trong RESTORE_TOKEN hoặc LOGOUT đã xử lý việc này
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  // Các hàm xử lý nghiệp vụ
  const authContextValue = {
    login: async (username, password) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        // Giả sử loginUserApi trả về { token, user: { id, username, roles, avatarUrl } }
        const response = await loginUserApi(username, password);
        const { token, id, username: respUsername, roles, avatarUrl } = response; // Backend trả về JwtResponse
                                                                          // với các trường token, id, username, avatarUrl, roles

        const userInfoToStore = { id, username: respUsername, roles, avatarUrl };

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoToStore));
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Cấu hình trong apiClient interceptor sẽ tốt hơn
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, token, userInfo: userInfoToStore });
        return Promise.resolve(response); // Trả về response để component xử lý tiếp nếu cần
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
        console.error('Lỗi đăng nhập AuthContext:', errorMessage, error.response?.data);
        dispatch({ type: ActionTypes.LOGIN_FAIL, error: errorMessage });
        return Promise.reject(new Error(errorMessage)); // Trả về lỗi để component xử lý
      }
    },
    logout: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        // delete apiClient.defaults.headers.common['Authorization']; // Cấu hình trong apiClient interceptor sẽ tốt hơn
        dispatch({ type: ActionTypes.LOGOUT });
      } catch (e) {
        console.error('Lỗi khi đăng xuất:', e);
        // Vẫn dispatch logout để clear state dù có lỗi xóa AsyncStorage
        dispatch({ type: ActionTypes.LOGOUT });
      } finally {
        // dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    register: async (username, password) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        // Giả sử registerUserApi trả về response thành công (ví dụ: message)
        const response = await registerUserApi(username, password);
        dispatch({ type: ActionTypes.REGISTER_SUCCESS });
        return Promise.resolve(response); // Trả về response để component xử lý tiếp
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
        console.error('Lỗi đăng ký AuthContext:', errorMessage, error.response?.data);
        dispatch({ type: ActionTypes.REGISTER_FAIL, error: errorMessage });
        return Promise.reject(new Error(errorMessage));
      }
    },
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },
    // Thêm hàm cập nhật userInfo nếu cần, ví dụ sau khi user cập nhật profile
    updateUserInfo: async (newUserInfo) => {
        try {
            const currentUserInfo = state.userInfo ? {...state.userInfo} : {};
            const updatedUserInfo = { ...currentUserInfo, ...newUserInfo };
            await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            dispatch({ type: ActionTypes.RESTORE_TOKEN, token: state.userToken, userInfo: updatedUserInfo });
        } catch (error) {
            console.error('Lỗi khi cập nhật userInfo trong AuthContext:', error);
        }
    },
    state, // Truyền toàn bộ state ra ngoài
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook để sử dụng Context ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};