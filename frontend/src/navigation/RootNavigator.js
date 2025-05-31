import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import AuthNavigator from './AuthNavigator'
import UserNavigator from './UserNavigator'   
import AdminNavigator from './AdminNavigator' 
import COLORS from '../constants/colors'    

// Một màn hình Loading đơn giản
const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.TEXT_PRIMARY || '#FFFFFF'} />
    <Text style={[styles.text, { marginTop: 10 }]}>Đang tải...</Text>
  </View>
)

const RootNavigator = () => {
  const { state } = useAuth()
  const { isLoading, userToken, userInfo } = state

  if (isLoading) {
    // Nếu đang trong quá trình kiểm tra token (ví dụ: khi mới mở app)
    return <LoadingScreen />
  }

  if (!userToken) {
    // Nếu không có token (người dùng chưa đăng nhập)
    return <AuthNavigator />
  }

  // Nếu có token (người dùng đã đăng nhập), kiểm tra vai trò
  if (userInfo && userInfo.roles && userInfo.roles.length > 0) {
    if (userInfo.roles.includes('ROLE_ADMIN')) {
      return <AdminNavigator />
    } else if (userInfo.roles.includes('ROLE_USER')) {
      return <UserNavigator />
    } else {
      console.warn(`User ${userInfo.username} has token but no recognized primary role (USER/ADMIN). Roles: ${userInfo.roles}. Defaulting to UserNavigator or consider a fallback/error screen.`)
      return <UserNavigator />
    }
  } else {
    console.warn('User has token, but userInfo or userInfo.roles is missing/empty. Displaying Loading/Fallback. UserInfo:', userInfo)
    return <LoadingScreen /> 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY || '#1A1D2E',
  },
  text: {
    color: COLORS.TEXT_PRIMARY || '#F0F0F5',
    fontSize: 18,
  },
})

export default RootNavigator