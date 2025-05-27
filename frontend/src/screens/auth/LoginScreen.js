import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // Để hiển thị thông báo lỗi đơn giản
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../../contexts/AuthContext' // Import useAuth
import * as ROUTES from '../../constants/routes' // Import tên các routes
import COLORS from '../../constants/colors' // Import màu sắc

const LoginScreen = () => {
  const navigation = useNavigation()
  const { login, state: authState, clearError } = useAuth() // Lấy hàm login và state từ AuthContext

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false) // State loading cục bộ cho nút bấm

  // Xóa lỗi khi màn hình được focus lại hoặc khi người dùng bắt đầu nhập liệu
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError() // Xóa lỗi từ AuthContext khi màn hình được focus
    })
    return unsubscribe
  }, [navigation, clearError])

  const handleInputChange = (setter, value) => {
    clearError() // Xóa lỗi khi người dùng bắt đầu nhập
    setter(value)
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.')
      return
    }

    setIsSubmitting(true)
    clearError() // Xóa lỗi cũ trước khi thử đăng nhập mới

    try {
      await login(username, password)
      // Nếu đăng nhập thành công, RootNavigator sẽ tự động chuyển màn hình
      // do userToken trong AuthContext thay đổi.
      // Không cần gọi navigation.navigate() ở đây cho trường hợp thành công.
    } catch (error) {
      // Lỗi đã được set trong authState.error bởi AuthContext
      // Alert.alert('Đăng nhập thất bại', authState.error || error.message); // authState.error có thể chưa kịp cập nhật ngay
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi xảy ra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Đăng nhập</Text>

          {authState.error && ( // Hiển thị lỗi từ AuthContext nếu có
            <Text style={styles.errorText}>{authState.error}</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Tên tài khoản"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={username}
            onChangeText={(text) => handleInputChange(setUsername, text)}
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={password}
            onChangeText={(text) => handleInputChange(setPassword, text)}
            secureTextEntry
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting || authState.isLoading ? styles.buttonDisabled : {}]}
            onPress={handleLogin}
            disabled={isSubmitting || authState.isLoading}
          >
            {isSubmitting || authState.isLoading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              clearError()
              navigation.navigate(ROUTES.REGISTER_SCREEN)
            }}
          >
            <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              clearError()
              navigation.navigate(ROUTES.FORGOT_PASSWORD_SCREEN)
            }}
          >
            <Text style={styles.linkText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: COLORS.ACCENT,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: 10,
    textAlign: 'center',
  },
})

export default LoginScreen