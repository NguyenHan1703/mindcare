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
  SafeAreaView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import COLORS from '../../constants/colors'
import { changePasswordApi } from '../../api/user.api.js' // Import hàm API
import * as ROUTES from '../../constants/routes' // Import tên routes

const ChangePasswordScreen = () => {
  const navigation = useNavigation()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Xóa lỗi khi người dùng bắt đầu nhập liệu hoặc màn hình được focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setError(null)
      setSuccessMessage('')
    })
    return unsubscribe
  }, [navigation])

  const handleInputChange = (setter, value) => {
    setError(null)
    setSuccessMessage('')
    setter(value)
  }

  const validateInputs = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError('Vui lòng điền đầy đủ các trường mật khẩu.')
      return false
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return false
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu mới không khớp.')
      return false
    }
    setError(null) // Xóa lỗi nếu tất cả đều hợp lệ
    return true
  }

  const handleChangePassword = async () => {
    if (!validateInputs()) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('') // Xóa thông báo thành công cũ

    try {
      const passwordData = {
        oldPassword,
        newPassword,
        confirmNewPassword, // Backend DTO cũng có trường này
      }
      const response = await changePasswordApi(passwordData)

      // Backend thường trả về MessageResponse cho hành động này
      const message = response.data?.message || 'Đổi mật khẩu thành công!'
      setSuccessMessage(message)
      Alert.alert(
        'Thành công',
        message,
        [
          { text: 'OK', onPress: () => navigation.goBack() } // Quay lại màn hình Profile
        ]
      )
      // Xóa các trường sau khi thành công
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      Alert.alert('Thất bại', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // UserNavigator đã đặt title cho màn hình này là "Đổi mật khẩu"
  // Nút "< Quay lại" cũng do Stack Navigator tự động cung cấp.

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.container}>
            {/* Tiêu đề có thể được đặt bởi navigator, hoặc bạn có thể thêm một Text ở đây */}
            {/* <Text style={styles.title}>Đổi mật khẩu</Text> */}

            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && !error && <Text style={styles.successText}>{successMessage}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Mật khẩu cũ"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={oldPassword}
              onChangeText={(text) => handleInputChange(setOldPassword, text)}
              secureTextEntry
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
              onPress={handleChangePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Căn giữa form nếu nội dung ít
  },
  container: {
    flex: 1, // Cho phép scroll nếu nội dung nhiều hơn màn hình
    paddingHorizontal: 30,
    paddingVertical: 20, // Thêm padding cho đẹp hơn
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  // title: { // Bỏ comment nếu bạn muốn có tiêu đề riêng trong màn hình
  //   fontSize: 28,
  //   fontWeight: 'bold',
  //   color: COLORS.TEXT_PRIMARY,
  //   marginBottom: 30,
  //   textAlign: 'center',
  // },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20, // Tăng khoảng cách giữa các input
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
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: 15, // Tăng khoảng cách
    textAlign: 'center',
    fontSize: 15,
  },
  successText: {
    color: COLORS.SUCCESS,
    marginBottom: 15, // Tăng khoảng cách
    textAlign: 'center',
    fontSize: 15,
  }
})

export default ChangePasswordScreen