import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../../constants/colors';
import { getUserDetailsForAdminApi, updateUserByAdminApi } from '../../api/admin.api.js';
import * as ROUTES from '../../constants/routes';

// Các vai trò có sẵn mà admin có thể gán (giống AdminAddUserScreen)
const AVAILABLE_ROLES = [
  { label: 'Người dùng (USER)', value: 'ROLE_USER' },
  { label: 'Quản trị viên (ADMIN)', value: 'ROLE_ADMIN' },
];

// Logger đơn giản
const logger = {
  info: (...args) => console.log('AdminEditUserScreen [INFO]', ...args),
  warn: (...args) => console.warn('AdminEditUserScreen [WARN]', ...args),
  error: (...args) => console.error('AdminEditUserScreen [ERROR]', ...args),
};

const AdminEditUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username: initialUsername } = route.params; // Nhận userId và username ban đầu từ params

  const [originalUsername, setOriginalUsername] = useState(initialUsername || '');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [newPassword, setNewPassword] = useState(''); // Mật khẩu mới (nếu admin muốn reset)

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Đặt tiêu đề động cho header
  useEffect(() => {
    navigation.setOptions({
      title: `Sửa: ${originalUsername || 'User'}`,
    });
  }, [navigation, originalUsername]);
  
  const fetchUserDetails = useCallback(async () => {
    logger.info(`Workspaceing details for user ID: ${userId}`);
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await getUserDetailsForAdminApi(userId);
      const userData = response.data; // AdminUserViewDto
      if (userData) {
        setOriginalUsername(userData.username); // Lưu username gốc
        setUsername(userData.username);
        setAvatarUrl(userData.avatarUrl || '');
        setSelectedRoles(new Set(userData.roles || []));
      } else {
        throw new Error("Không nhận được dữ liệu người dùng.");
      }
    } catch (err) {
      logger.error("Lỗi khi tải thông tin người dùng:", err.response?.data?.message || err.message);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
      navigation.goBack();
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      setError(null); // Xóa lỗi cũ khi màn hình focus
      setSuccessMessage('');
    }, [fetchUserDetails])
  );

  const handleInputChange = (setter, value) => {
    setError(null);
    setSuccessMessage('');
    setter(value);
  };

  const toggleRole = (roleValue) => {
    setSelectedRoles((prevRoles) => {
      const newRoles = new Set(prevRoles);
      if (newRoles.has(roleValue)) {
        if (roleValue === 'ROLE_USER' && newRoles.size === 1) {
            Alert.alert("Thông báo", "Người dùng phải có ít nhất vai trò USER.");
            return prevRoles;
        }
        newRoles.delete(roleValue);
      } else {
        newRoles.add(roleValue);
      }
      if (newRoles.size === 0) {
          newRoles.add('ROLE_USER');
          Alert.alert("Thông báo", "Đã tự động chọn vai trò USER vì người dùng phải có ít nhất một vai trò.");
      }
      return newRoles;
    });
  };

  const validateInputs = () => {
    if (!username.trim()) {
      setError('Tên người dùng không được để trống.');
      return false;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Mật khẩu mới (nếu thay đổi) phải có ít nhất 6 ký tự.');
      return false;
    }
    if (selectedRoles.size === 0) {
      setError('Vui lòng chọn ít nhất một vai trò cho người dùng.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSaveChanges = () => {
    if (!validateInputs()) {
      return;
    }

    Alert.alert(
      'Xác nhận cập nhật',
      `Bạn có chắc chắn muốn lưu các thay đổi cho người dùng "${originalUsername}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Lưu',
          onPress: async () => {
            setIsSubmitting(true);
            setSuccessMessage('');
            setError(null);

            const updateData = {};
            if (username.trim() !== originalUsername) {
              updateData.username = username.trim();
            }
            // Chỉ gửi avatarUrl nếu nó thực sự thay đổi hoặc người dùng muốn xóa (gửi chuỗi rỗng)
            // Giả sử User DTO ở backend hiểu avatarUrl là null/rỗng để xóa
            if (avatarUrl !== (userInfoFromApi?.avatarUrl || '') ) { // So sánh với giá trị ban đầu từ API
                 updateData.avatarUrl = avatarUrl.trim() === '' ? null : avatarUrl.trim();
            }
            if (newPassword.trim()) {
              updateData.password = newPassword; // Backend sẽ mã hóa
            }
            updateData.roles = Array.from(selectedRoles); // Luôn gửi roles hiện tại

            // Nếu không có gì thay đổi (ngoại trừ roles luôn được gửi)
            if (Object.keys(updateData).length === 1 && updateData.roles) {
                 const initialRoles = new Set(userInfoFromApi?.roles || []);
                 if (initialRoles.size === selectedRoles.size && [...initialRoles].every(role => selectedRoles.has(role))) {
                    logger.info("Không có thay đổi nào được thực hiện (chỉ roles giống ban đầu).");
                    setSuccessMessage("Không có thông tin nào được thay đổi.");
                    setIsSubmitting(false);
                    return;
                 }
            }


            try {
              const response = await updateUserByAdminApi(userId, updateData);
              setSuccessMessage(`Thông tin người dùng "${response.data.username}" đã được cập nhật thành công!`);
              Alert.alert(
                'Thành công',
                `Thông tin người dùng "${response.data.username}" đã được cập nhật.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
              // Cập nhật lại originalUsername phòng trường hợp user muốn sửa tiếp
              setOriginalUsername(response.data.username);
              // Xóa mật khẩu mới sau khi submit
              setNewPassword('');

            } catch (err) {
              const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thất bại.';
              setError(errorMessage);
              Alert.alert('Thất bại', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };
  
  // State để lưu userInfo ban đầu từ API, dùng để so sánh xem có thay đổi không
  const [userInfoFromApi, setUserInfoFromApi] = useState(null);
  useEffect(() => {
      if(userId){
          setIsLoadingData(true);
          getUserDetailsForAdminApi(userId)
              .then(response => {
                  const userData = response.data;
                  setUserInfoFromApi(userData); // Lưu trữ thông tin gốc
                  setOriginalUsername(userData.username);
                  setUsername(userData.username);
                  setAvatarUrl(userData.avatarUrl || '');
                  setSelectedRoles(new Set(userData.roles || []));
                  setIsLoadingData(false);
              })
              .catch(err => {
                  logger.error("Lỗi khi tải thông tin chi tiết người dùng:", err.response?.data || err.message);
                  setError('Không thể tải thông tin người dùng.');
                  setIsLoadingData(false);
                  Alert.alert('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng quay lại.');
              });
      }
  }, [userId]);


  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải dữ liệu người dùng...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error && !userInfoFromApi) { // Nếu lỗi ngay từ đầu không load được user
     return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
           <TouchableOpacity onPress={() => fetchUserDetails()} style={styles.retryButton}>
                <Text style={styles.buttonText}>Thử lại</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Tiêu đề động được đặt trong useEffect -> navigation.setOptions */}

            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && !error && <Text style={styles.successText}>{successMessage}</Text>}

            <Text style={styles.label}>Tên tài khoản</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên tài khoản"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={username}
              onChangeText={(text) => handleInputChange(setUsername, text)}
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />

            <Text style={styles.label}>Mật khẩu mới (Để trống nếu không đổi)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới để reset"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={newPassword}
              onChangeText={(text) => handleInputChange(setNewPassword, text)}
              secureTextEntry
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />

            <Text style={styles.label}>URL Avatar</Text>
            <TextInput
              style={styles.input}
              placeholder="URL hình ảnh avatar"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={avatarUrl}
              onChangeText={(text) => handleInputChange(setAvatarUrl, text)}
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />

            <Text style={styles.label}>Vai trò</Text>
            <View style={styles.rolesContainer}>
              {AVAILABLE_ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    selectedRoles.has(role.value) && styles.roleButtonSelected,
                  ]}
                  onPress={() => toggleRole(role.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={selectedRoles.has(role.value) ? "checkbox" : "square-outline"}
                    size={24}
                    color={selectedRoles.has(role.value) ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleTextButton,
                      selectedRoles.has(role.value) && styles.roleTextButtonSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Copy style từ AdminAddUserScreen và điều chỉnh nếu cần
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    marginTop: 10,
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
  rolesContainer: {
    marginBottom: 20,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal:10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 10,
  },
  roleButtonSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_MUTED || '#303F9F30',
  },
  roleIcon: {
    marginRight: 10,
  },
  roleTextButton: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  roleTextButtonSelected: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
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
   retryButton: { // Style cho nút thử lại nếu load lỗi ban đầu
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
});


export default AdminEditUserScreen;