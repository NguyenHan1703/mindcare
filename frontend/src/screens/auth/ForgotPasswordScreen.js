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
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'
import { forgotPasswordApi } from '../../api/auth.api' // Import hàm API

const ForgotPasswordScreen = () => {
  const navigation = useNavigation()

  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null) // State lỗi cục bộ cho màn hình này
  const [successMessage, setSuccessMessage] = useState('')

  // Xóa lỗi khi người dùng bắt đầu nhập liệu
  const handleInputChange = (setter, value) => {
    setError(null)
    setSuccessMessage('')
    setter(value)
  }

  const handleResetPassword = async () => {
    if (!username.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
      return
    }
    if (newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
        return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage('')

    try {
      // Gọi API backend /api/auth/forgot-password
      const response = await forgotPasswordApi(username, newPassword)
      
      // Giả sử backend trả về message trong response.data nếu thành công
      setSuccessMessage(response.data.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
      Alert.alert(
        'Thành công',
        response.data.message || 'Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN_SCREEN) }]
      )
      setUsername('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      Alert.alert('Thất bại', errorMessage)
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
          <Text style={styles.title}>Quên mật khẩu</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

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
            placeholder="Mật khẩu mới"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={newPassword}
            onChangeText={(text) => handleInputChange(setNewPassword, text)}
            secureTextEntry
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={confirmNewPassword}
            onChangeText={(text) => handleInputChange(setConfirmNewPassword, text)}
            secureTextEntry
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting ? styles.buttonDisabled : {}]}
            onPress={handleResetPassword}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate(ROUTES.LOGIN_SCREEN)}
          >
            <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
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
  successText: {
    color: COLORS.SUCCESS,
    marginBottom: 10,
    textAlign: 'center',
  }
})

export default ForgotPasswordScreen