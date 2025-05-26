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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import * as ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, state: authState, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError();
      // Reset form fields if needed when screen is focused
      // setUsername('');
      // setPassword('');
      // setConfirmPassword('');
    });
    return unsubscribe;
  }, [navigation, clearError]);

  const handleInputChange = (setter, value) => {
    clearError();
    setter(value);
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }
    // Các validation khác cho độ dài username/password có thể thêm ở đây
    // hoặc dựa vào lỗi trả về từ backend (thông qua DTO validation)

    setIsSubmitting(true);
    clearError();

    try {
      await register(username, password);
      Alert.alert(
        'Đăng ký thành công!',
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN_SCREEN) }]
      );
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Lỗi đã được set trong authState.error bởi AuthContext,
      // hoặc là error.message từ Promise reject
      Alert.alert('Đăng ký thất bại', authState.error || error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>

          {authState.error && (
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

          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={confirmPassword}
            onChangeText={(text) => handleInputChange(setConfirmPassword, text)}
            secureTextEntry
            autoCapitalize="none"
            selectionColor={COLORS.PRIMARY}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting || authState.isLoading ? styles.buttonDisabled : {}]}
            onPress={handleRegister}
            disabled={isSubmitting || authState.isLoading}
          >
            {isSubmitting || authState.isLoading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              clearError();
              navigation.navigate(ROUTES.LOGIN_SCREEN);
            }}
          >
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
});

export default RegisterScreen;