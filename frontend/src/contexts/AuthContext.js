import React, { createContext, useContext, useEffect, useReducer } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loginUserApi, registerUserApi } from '../api/auth.api.js' // Đã sửa tên file cho đúng

// Thêm logger để check lỗi 
const logger = {
  info: (...args) => console.log('AuthContext [INFO]', ...args),
  error: (...args) => console.error('AuthContext [ERROR]', ...args),
  debug: (...args) => console.debug('AuthContext [DEBUG]', ...args),
}

// --- Định nghĩa State ban đầu và Reducer ---
const initialState = {
  isLoading: true,
  userToken: null,
  userInfo: null, // { id, username, roles, avatarUrl }
  error: null,
}

const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGIN_FAIL: 'LOGIN_FAIL',
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER_INFO_CONTEXT: 'UPDATE_USER_INFO_CONTEXT', // Action mới để cập nhật userInfo
}

const authReducer = (prevState, action) => {
  logger.debug('authReducer dispatch:', action.type, action.payload || action.token || action.error)
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...prevState,
        isLoading: action.payload,
        error: null,
      }
    case ActionTypes.RESTORE_TOKEN:
      return {
        ...prevState,
        userToken: action.token,
        userInfo: action.userInfo,
        isLoading: false,
        error: null,
      }
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...prevState,
        userToken: action.token,
        userInfo: action.userInfo,
        isLoading: false,
        error: null,
      }
    case ActionTypes.LOGIN_FAIL:
      return {
        ...prevState,
        userToken: null,
        userInfo: null,
        isLoading: false,
        error: action.error,
      }
    case ActionTypes.LOGOUT:
      return {
        ...prevState,
        userToken: null,
        userInfo: null,
        isLoading: false, // Đảm bảo isLoading là false khi logout
        error: null,
      }
    case ActionTypes.REGISTER_SUCCESS:
      return {
        ...prevState,
        isLoading: false,
        error: null,
      }
    case ActionTypes.REGISTER_FAIL:
      return {
        ...prevState,
        isLoading: false,
        error: action.error,
      }
    case ActionTypes.SET_ERROR: 
      return {
        ...prevState,
        error: action.error,
        isLoading: false,
      }
    case ActionTypes.CLEAR_ERROR:
      return {
        ...prevState,
        error: null,
      }
    case ActionTypes.UPDATE_USER_INFO_CONTEXT: // Xử lý action cập nhật userInfo
      return {
        ...prevState,
        userInfo: action.userInfo,
      }
    default:
      return prevState
  }
}

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const checkAuthState = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const token = await AsyncStorage.getItem('userToken')
      const storedUserInfo = await AsyncStorage.getItem('userInfo')
      if (token && storedUserInfo) {
        logger.info('Token and userInfo restored from AsyncStorage.')
        dispatch({ type: ActionTypes.RESTORE_TOKEN, token, userInfo: JSON.parse(storedUserInfo) })
      } else {
        logger.info('No token or userInfo found in AsyncStorage, dispatching LOGOUT.')
        dispatch({ type: ActionTypes.LOGOUT })
      }
    } catch (e) {
      logger.error('Lỗi khi khôi phục token từ AsyncStorage:', e)
      dispatch({ type: ActionTypes.LOGOUT })
    }
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const authContextValue = {
    login: async (username, password) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true })
      dispatch({ type: ActionTypes.CLEAR_ERROR }) // Xóa lỗi cũ
      try {
        const response = await loginUserApi(username, password) // response là của Axios
        logger.debug('Login API response.data:', response.data)

        
        const responseData = response.data // Dữ liệu thực sự từ backend nằm trong response.data

        if (responseData && responseData.token) {
          const { token, id, username: respUsername, roles, avatarUrl } = responseData

          const userInfoToStore = {
            id: id || null,
            username: respUsername || null,
            roles: roles || [],
            avatarUrl: avatarUrl || null,
          }

          await AsyncStorage.setItem('userToken', token) // Chỉ lưu khi token có giá trị
          await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoToStore))
          
          dispatch({ type: ActionTypes.LOGIN_SUCCESS, token, userInfo: userInfoToStore })
          logger.info(`User ${respUsername} logged in successfully.`)
          return Promise.resolve(responseData) // Trả về responseData
        } else {
          // Trường hợp API thành công (status 2xx) nhưng không trả về token
          const errorMessage = 'Phản hồi từ server không hợp lệ (thiếu token).'
          logger.error('AuthContext Login: Invalid response from server (missing token).', responseData)
          dispatch({ type: ActionTypes.LOGIN_FAIL, error: errorMessage })
          return Promise.reject(new Error(errorMessage))
        }
      } catch (error) {
        // Lỗi từ Axios (ví dụ: 401, 500, network error)
        const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại'
        logger.error('Lỗi đăng nhập AuthContext:', errorMessage, error.response?.data || error)
        dispatch({ type: ActionTypes.LOGIN_FAIL, error: errorMessage })
        return Promise.reject(new Error(errorMessage))
      }
    },
    logout: async () => {
      logger.info('User logging out.') 
      try {
        await AsyncStorage.removeItem('userToken')
        await AsyncStorage.removeItem('userInfo')
        dispatch({ type: ActionTypes.LOGOUT })
      } catch (e) {
        logger.error('Lỗi khi đăng xuất (AsyncStorage):', e)
        dispatch({ type: ActionTypes.LOGOUT }) // Vẫn dispatch để clear state
      }
    },
    register: async (username, password) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true })
      dispatch({ type: ActionTypes.CLEAR_ERROR })
      try {
        const response = await registerUserApi(username, password)
        dispatch({ type: ActionTypes.REGISTER_SUCCESS })
        logger.info(`User ${username} registration API call successful.`)
        return Promise.resolve(response.data) // Trả về response.data
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại'
        logger.error('Lỗi đăng ký AuthContext:', errorMessage, error.response?.data)
        dispatch({ type: ActionTypes.REGISTER_FAIL, error: errorMessage })
        return Promise.reject(new Error(errorMessage))
      }
    },
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR })
    },
    updateUserInfo: async (newPartialUserInfo) => {
      // Hàm này cập nhật userInfo trong context và AsyncStorage sau khi user thay đổi profile
      try {
        const currentToken = state.userToken
        if (!currentToken) {
          logger.warn('updateUserInfo called but no userToken found. Aborting.')
          return
        }
        // Lấy userInfo hiện tại từ state, nếu không có thì lấy từ AsyncStorage (ít xảy ra nếu đã login)
        let currentUserInfo = state.userInfo
        if (!currentUserInfo) {
            const storedUserInfo = await AsyncStorage.getItem('userInfo')
            if (storedUserInfo) {
                currentUserInfo = JSON.parse(storedUserInfo)
            } else {
                logger.error('Cannot update userInfo: current userInfo not found in state or AsyncStorage.')
                // Có thể gọi logout ở đây nếu state không nhất quán
                return
            }
        }
        
        const updatedUserInfo = { ...currentUserInfo, ...newPartialUserInfo }
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
        // Dispatch action mới hoặc dùng lại RESTORE_TOKEN nếu nó không set isLoading = true
        dispatch({ type: ActionTypes.UPDATE_USER_INFO_CONTEXT, userInfo: updatedUserInfo })
        logger.info('UserInfo updated in AuthContext and AsyncStorage.')
      } catch (error) {
        logger.error('Lỗi khi cập nhật userInfo trong AuthContext:', error)
      }
    },
    state,
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
}