import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // For role selection icons

import COLORS from '../../constants/colors';
import { addUserByAdminApi } from '../../api/admin.api.js';
import * as ROUTES from '../../constants/routes';

// Các vai trò có sẵn mà admin có thể gán
const AVAILABLE_ROLES = [
  { label: 'Người dùng (USER)', value: 'ROLE_USER' },
  { label: 'Quản trị viên (ADMIN)', value: 'ROLE_ADMIN' },
];

const AdminAddUserScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Tùy chọn
  const [selectedRoles, setSelectedRoles] = useState(new Set([AVAILABLE_ROLES[0].value])); // Mặc định chọn ROLE_USER

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Xóa lỗi khi màn hình focus (ví dụ khi quay lại từ màn hình khác)
    const unsubscribe = navigation.addListener('focus', () => {
      setError(null);
      setSuccessMessage('');
    });
    return unsubscribe;
  }, [navigation]);
  
  const handleInputChange = (setter, value) => {
    setError(null); // Xóa lỗi cũ khi người dùng bắt đầu nhập
    setSuccessMessage('');
    setter(value);
  };

  const toggleRole = (roleValue) => {
    setSelectedRoles((prevRoles) => {
      const newRoles = new Set(prevRoles);
      if (newRoles.has(roleValue)) {
        // Không cho phép bỏ chọn vai trò cuối cùng nếu đó là ROLE_USER
        // Hoặc đảm bảo luôn có ít nhất một vai trò
        if (roleValue === 'ROLE_USER' && newRoles.size === 1) {
            Alert.alert("Thông báo", "Người dùng phải có ít nhất vai trò USER.");
            return prevRoles;
        }
        newRoles.delete(roleValue);
      } else {
        newRoles.add(roleValue);
      }
      // Đảm bảo nếu không có role nào được chọn, thì tự động chọn ROLE_USER
      // Hoặc bạn có thể yêu cầu phải chọn ít nhất một role khi validate
      if (newRoles.size === 0) {
          newRoles.add('ROLE_USER'); 
          Alert.alert("Thông báo", "Đã tự động chọn vai trò USER vì người dùng phải có ít nhất một vai trò.");
      }
      return newRoles;
    });
  };

  const validateInputs = () => {
    if (!username.trim() || !password.trim()) {
      setError('Tên người dùng và mật khẩu không được để trống.');
      return false;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (selectedRoles.size === 0) {
      setError('Vui lòng chọn ít nhất một vai trò cho người dùng.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSaveUser = () => {
    if (!validateInputs()) {
      return;
    }

    Alert.alert(
      'Xác nhận tạo người dùng',
      `Bạn có chắc chắn muốn tạo người dùng "${username}" với các vai trò đã chọn không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo',
          onPress: async () => {
            setIsSubmitting(true);
            setSuccessMessage('');
            setError(null);

            const userData = {
              username: username.trim(),
              password: password,
              avatarUrl: avatarUrl.trim() || null, // Gửi null nếu rỗng
              roles: Array.from(selectedRoles), // Chuyển Set thành Array<String>
            };

            try {
              await addUserByAdminApi(userData);
              setSuccessMessage(`Người dùng "${username}" đã được tạo thành công!`);
              Alert.alert(
                'Thành công',
                `Người dùng "${username}" đã được tạo.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }] // Quay lại AdminDashboardScreen
              );
              // Xóa form
              setUsername('');
              setPassword('');
              setAvatarUrl('');
              setSelectedRoles(new Set([AVAILABLE_ROLES[0].value]));
            } catch (err) {
              const errorMessage = err.response?.data?.message || err.message || 'Tạo người dùng thất bại.';
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
  
  // Tiêu đề "Thêm người dùng mới" và nút "< Quay lại" được AdminNavigator quản lý

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* <Text style={styles.title}>Thêm người dùng mới</Text> */}

            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && !error && <Text style={styles.successText}>{successMessage}</Text>}

            <Text style={styles.label}>Tên tài khoản <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên tài khoản"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={username}
              onChangeText={(text) => handleInputChange(setUsername, text)}
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />

            <Text style={styles.label}>Mật khẩu <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={password}
              onChangeText={(text) => handleInputChange(setPassword, text)}
              secureTextEntry
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />

            <Text style={styles.label}>URL Avatar (Tùy chọn)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập URL hình ảnh avatar"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={avatarUrl}
              onChangeText={(text) => handleInputChange(setAvatarUrl, text)}
              autoCapitalize="none"
              selectionColor={COLORS.PRIMARY}
            />
            {/* Nếu muốn tích hợp ImagePicker, bạn sẽ thay thế TextInput này */}

            <Text style={styles.label}>Vai trò <Text style={styles.requiredStar}>*</Text></Text>
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
              onPress={handleSaveUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Lưu người dùng</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  // title: { // Tiêu đề đã được đặt bởi Navigator
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   color: COLORS.TEXT_PRIMARY,
  //   marginBottom: 20,
  //   textAlign: 'center',
  // },
  label: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    marginTop: 10,
  },
  requiredStar: {
    color: COLORS.ERROR,
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
    backgroundColor: COLORS.PRIMARY_MUTED || '#303F9F30', // Một màu nền nhẹ khi được chọn
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
});

export default AdminAddUserScreen;