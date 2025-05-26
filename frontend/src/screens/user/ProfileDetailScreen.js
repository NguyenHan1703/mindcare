import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Import expo-image-picker
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import COLORS from '../../constants/colors';
import { updateUserProfileApi } from '../../api/user.api.js'; // Import hàm API

const ProfileDetailScreen = () => {
  const navigation = useNavigation();
  const { state: authState, updateUserInfo, clearError } = useAuth(); // updateUserInfo để cập nhật context
  const { userInfo } = authState;

  const [editableUsername, setEditableUsername] = useState(userInfo?.username || '');
  const [selectedAvatarUri, setSelectedAvatarUri] = useState(userInfo?.avatarUrl || null); // URI của avatar (có thể là local hoặc remote)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cập nhật state cục bộ nếu userInfo trong context thay đổi (ví dụ sau khi login)
    setEditableUsername(userInfo?.username || '');
    setSelectedAvatarUri(userInfo?.avatarUrl || null);
  }, [userInfo]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError(); // Xóa lỗi từ AuthContext
      setLocalError(null);
      setSuccessMessage('');
    });
    return unsubscribe;
  }, [navigation, clearError]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus.status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào thư viện ảnh để bạn có thể chọn avatar.');
        return false;
      }
      // Có thể yêu cầu thêm quyền camera nếu bạn có chức năng chụp ảnh
      // const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      // if (cameraStatus.status !== 'granted') {
      //   Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào camera.');
      //   return false;
      // }
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Tỉ lệ vuông cho avatar
      quality: 0.7,   // Chất lượng ảnh (0-1)
    });

    if (!result.canceled) {
      setSelectedAvatarUri(result.assets[0].uri); // Lưu URI cục bộ của ảnh đã chọn
      setSuccessMessage(''); // Xóa thông báo thành công cũ
      setLocalError(null);  // Xóa lỗi cũ
    }
  };

  const handleSaveChanges = async () => {
    if (!editableUsername.trim()) {
      setLocalError('Tên người dùng không được để trống.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage('');

    // **PHẦN XỬ LÝ UPLOAD AVATAR (HIỆN TẠI LÀ PLACEHOLDER)**
    let finalAvatarUrl = userInfo?.avatarUrl; // Mặc định là URL cũ

    if (selectedAvatarUri && selectedAvatarUri !== userInfo?.avatarUrl) {
      // Nếu selectedAvatarUri là một URI cục bộ (file://...)
      if (selectedAvatarUri.startsWith('file://')) {
        // TODO: Triển khai logic upload ảnh lên server/dịch vụ lưu trữ
        // Sau khi upload, bạn sẽ nhận được một public URL.
        // Ví dụ: finalAvatarUrl = await uploadImageToServer(selectedAvatarUri);
        // Tạm thời, chúng ta có thể gửi URI cục bộ (backend sẽ lưu nó, nhưng nó không dùng được)
        // Hoặc bạn có thể cảnh báo người dùng rằng upload chưa được hỗ trợ đầy đủ.
        // Để minh họa, chúng ta sẽ gửi URI đã chọn nếu nó khác URI cũ.
        // Trong dự án thực tế, bạn KHÔNG NÊN gửi file URI trực tiếp trừ khi backend có cơ chế đặc biệt.
        Alert.alert(
            "Thông báo",
            "Chức năng upload avatar đang được phát triển. Hiện tại, avatar mới chỉ hiển thị tạm thời trên thiết bị này sau khi lưu."
        );
        finalAvatarUrl = selectedAvatarUri; // Gửi URI cục bộ cho mục đích demo (backend sẽ lưu chuỗi này)
                                            // Hoặc bạn có thể quyết định không gửi nếu là file URI:
                                            // finalAvatarUrl = userInfo?.avatarUrl; // Giữ URL cũ
                                            // setLocalError("Chức năng upload avatar chưa hoàn thiện.");
      } else {
        // Nếu selectedAvatarUri đã là một URL (ví dụ người dùng tự dán URL)
        finalAvatarUrl = selectedAvatarUri;
      }
    }


    const profileData = {
      username: editableUsername.trim() === userInfo?.username ? undefined : editableUsername.trim(), // Chỉ gửi nếu thay đổi
      avatarUrl: finalAvatarUrl === userInfo?.avatarUrl ? undefined : finalAvatarUrl, // Chỉ gửi nếu thay đổi
    };

    // Chỉ gọi API nếu có sự thay đổi thực sự
    if (profileData.username === undefined && profileData.avatarUrl === undefined) {
      setSuccessMessage("Không có thông tin nào được thay đổi.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await updateUserProfileApi(profileData); // Gọi API
      // Backend trả về UserProfileDto đã cập nhật
      updateUserInfo(response.data); // Cập nhật userInfo trong AuthContext
      setSuccessMessage('Cập nhật thông tin thành công!');
      Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật.');
      // navigation.goBack(); // Tùy chọn: tự động quay lại sau khi thành công
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      setLocalError(errorMessage);
      Alert.alert('Thất bại', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          {/* Header có nút "< Quay lại" sẽ do Stack Navigator cung cấp */}
          {/* Tiêu đề "Quản lý thông tin" cũng do Stack Navigator đặt */}
          {/* <Text style={styles.title}>Quản lý thông tin</Text> */}

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
          
          {/* (Tùy chọn) Nếu bạn muốn người dùng nhập URL avatar trực tiếp */}
          {/* <Text style={styles.label}>URL Avatar (tùy chọn):</Text>
          <TextInput
            style={styles.input}
            value={selectedAvatarUri || ''} // Hiển thị URI đã chọn hoặc URL hiện tại
            onChangeText={setSelectedAvatarUri}
            placeholder="Nhập URL avatar"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          /> */}


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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scrollViewContainer: {
    flexGrow: 1,
    // justifyContent: 'center', // Bỏ nếu muốn form ở trên cùng
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  // title: { // Tiêu đề đã được đặt bởi Navigator
  //   fontSize: 28,
  //   fontWeight: 'bold',
  //   color: COLORS.TEXT_PRIMARY,
  //   marginBottom: 30,
  //   textAlign: 'center',
  // },
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
});

export default ProfileDetailScreen;