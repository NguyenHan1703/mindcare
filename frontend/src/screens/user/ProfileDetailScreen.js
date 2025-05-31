import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker' // Import expo-image-picker
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '../../contexts/AuthContext'
import COLORS from '../../constants/colors'
import { updateUserProfileApi } from '../../api/user.api.js' // Import hàm API

const ProfileDetailScreen = () => {
  const navigation = useNavigation()
  const { state: authState, updateUserInfo, clearError } = useAuth() // updateUserInfo để cập nhật context
  const { userInfo } = authState

  const [editableUsername, setEditableUsername] = useState(userInfo?.username || '')
  const [selectedAvatarUri, setSelectedAvatarUri] = useState(userInfo?.avatarUrl || null) // URI của avatar (có thể là local hoặc remote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Cập nhật state cục bộ nếu userInfo trong context thay đổi (ví dụ sau khi login)
    setEditableUsername(userInfo?.username || '')
    setSelectedAvatarUri(userInfo?.avatarUrl || null)
  }, [userInfo])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError() // Xóa lỗi từ AuthContext
      setLocalError(null)
      setSuccessMessage('')
    })
    return unsubscribe
  }, [navigation, clearError])

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (libraryStatus.status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào thư viện ảnh để bạn có thể chọn avatar.')
        return false
      }
    }
    return true
  }

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Tỉ lệ vuông cho avatar
      quality: 0.7,   // Chất lượng ảnh (0-1)
    })

    if (!result.canceled) {
      setSelectedAvatarUri(result.assets[0].uri) // Lưu URI cục bộ của ảnh đã chọn
      setSuccessMessage('') // Xóa thông báo thành công cũ
      setLocalError(null)  // Xóa lỗi cũ
    }
  }

  const handleSaveChanges = async () => {
    if (!editableUsername.trim()) {
      setLocalError('Tên người dùng không được để trống.')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)
    setSuccessMessage('')

    // **PHẦN XỬ LÝ UPLOAD AVATAR (HIỆN TẠI LÀ PLACEHOLDER)**
    let finalAvatarUrl = userInfo?.avatarUrl // Mặc định là URL cũ

    if (selectedAvatarUri && selectedAvatarUri !== userInfo?.avatarUrl) {
      // Nếu selectedAvatarUri là một URI cục bộ (file://...)
      if (selectedAvatarUri.startsWith('file://')) {
        Alert.alert(
            'Thông báo',
            'Chức năng upload avatar đang được phát triển. Hiện tại, avatar mới chỉ hiển thị tạm thời trên thiết bị này sau khi lưu.'
        )
        finalAvatarUrl = selectedAvatarUri 
      } else {
        finalAvatarUrl = selectedAvatarUri
      }
    }


    const profileData = {
      username: editableUsername.trim() === userInfo?.username ? undefined : editableUsername.trim(), // Chỉ gửi nếu thay đổi
      avatarUrl: finalAvatarUrl === userInfo?.avatarUrl ? undefined : finalAvatarUrl, // Chỉ gửi nếu thay đổi
    }

    // Chỉ gọi API nếu có sự thay đổi thực sự
    if (profileData.username === undefined && profileData.avatarUrl === undefined) {
      setSuccessMessage('Không có thông tin nào được thay đổi.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await updateUserProfileApi(profileData) // Gọi API
      // Backend trả về UserProfileDto đã cập nhật
      updateUserInfo(response.data) // Cập nhật userInfo trong AuthContext
      setSuccessMessage('Cập nhật thông tin thành công!')
      Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật.')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại.'
      setLocalError(errorMessage)
      Alert.alert('Thất bại', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>

          {localError && <Text style={styles.errorText}>{localError}</Text>}
          {successMessage && !localError && <Text style={styles.successText}>{successMessage}</Text>}

          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {selectedAvatarUri ? (
              <Image source={{ uri: selectedAvatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-add-outline" size={50} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.avatarPlaceholderText}>Chọn Avatar</Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
                <Ionicons name="camera-outline" size={24} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Tên tài khoản:</Text>
          <TextInput
            style={styles.input}
            value={editableUsername}
            onChangeText={setEditableUsername}
            placeholder="Nhập tên tài khoản mới"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting ? styles.buttonDisabled : {}]}
            onPress={handleSaveChanges}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative', // Để định vị icon camera
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  avatarPlaceholderText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.ACCENT,
    padding: 8,
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 25,
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
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 15,
  },
  successText: {
    color: COLORS.SUCCESS,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 15,
  },
})

export default ProfileDetailScreen