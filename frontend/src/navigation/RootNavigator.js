import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';   // ✨ IMPORT UserNavigator ✨
import AdminNavigator from './AdminNavigator'; // ✨ IMPORT AdminNavigator ✨
import COLORS from '../constants/colors';    // Import màu sắc

// Một màn hình Loading đơn giản
const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.TEXT_PRIMARY || '#FFFFFF'} />
    <Text style={[styles.text, { marginTop: 10 }]}>Đang tải...</Text>
  </View>
);

const RootNavigator = () => {
  const { state } = useAuth();
  const { isLoading, userToken, userInfo } = state;

  // useEffect(() => {
  //   // Dùng để debug trạng thái auth khi có thay đổi
  //   console.log('RootNavigator Auth State Updated:', { isLoading, userToken, roles: userInfo?.roles });
  // }, [isLoading, userToken, userInfo]);

  if (isLoading) {
    // Nếu đang trong quá trình kiểm tra token (ví dụ: khi mới mở app)
    return <LoadingScreen />;
  }

  if (!userToken) {
    // Nếu không có token (người dùng chưa đăng nhập)
    return <AuthNavigator />;
  }

  // Nếu có token (người dùng đã đăng nhập), kiểm tra vai trò
  if (userInfo && userInfo.roles && userInfo.roles.length > 0) {
    if (userInfo.roles.includes('ROLE_ADMIN')) {
      // Nếu người dùng có vai trò "ROLE_ADMIN"
      // console.log('Rendering AdminNavigator for user:', userInfo.username);
      return <AdminNavigator />;
    } else if (userInfo.roles.includes('ROLE_USER')) {
      // Nếu người dùng có vai trò "ROLE_USER" (và không phải ADMIN)
      // console.log('Rendering UserNavigator for user:', userInfo.username);
      return <UserNavigator />;
    } else {
      // Trường hợp không có vai trò nào được nhận diện rõ ràng,
      // hoặc vai trò không phải là USER hay ADMIN.
      // Có thể coi là lỗi hoặc mặc định về UserNavigator (hoặc một màn hình lỗi cụ thể).
      // Backend nên đảm bảo mỗi user đều có ít nhất ROLE_USER.
      console.warn(`User ${userInfo.username} has token but no recognized primary role (USER/ADMIN). Roles: ${userInfo.roles}. Defaulting to UserNavigator or consider a fallback/error screen.`);
      // Để an toàn, nếu không phải admin, mặc định là user thường hoặc xử lý logout nếu đây là trạng thái không mong muốn.
      // Vì chúng ta đã có UserNavigator, việc fallback về nó là hợp lý nếu vai trò không phải ADMIN.
      return <UserNavigator />;
    }
  } else {
    // Trường hợp này không nên xảy ra nếu userToken tồn tại và AuthContext hoạt động đúng
    // (nghĩa là userInfo và userInfo.roles phải có giá trị).
    // Có thể là do lỗi khi lưu/đọc userInfo từ AsyncStorage hoặc state chưa đồng bộ.
    console.warn('User has token, but userInfo or userInfo.roles is missing/empty. Displaying Loading/Fallback. UserInfo:', userInfo);
    // Hiển thị LoadingScreen hoặc một màn hình lỗi/yêu cầu đăng nhập lại.
    // Tạm thời vẫn hiển thị LoadingScreen để AuthContext có thể thử khôi phục lại.
    return <LoadingScreen />; 
    // Hoặc tốt hơn là logout người dùng nếu state này kéo dài:
    // const { logout } = useAuth(); // Lấy hàm logout
    // useEffect(() => { logout(); }, []); // Gọi logout
    // return <AuthNavigator />; // Sau khi logout sẽ quay về AuthNavigator
  }
};

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
});

export default RootNavigator;