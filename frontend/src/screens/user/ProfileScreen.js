import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'; // Sử dụng nhiều bộ icon

import { useAuth } from '../../contexts/AuthContext';
import * as ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { state: authState, logout } = useAuth();
  const { userInfo } = authState;

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          onPress: () => {
            logout(); // Gọi hàm logout từ AuthContext
            // RootNavigator sẽ tự động chuyển về màn hình Login
          },
          style: "destructive"
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Quản lý thông tin',
      icon: <Ionicons name="person-circle-outline" size={26} color={COLORS.ACCENT} style={styles.menuIcon} />,
      action: () => navigation.navigate(ROUTES.PROFILE_DETAIL_SCREEN),
      route: ROUTES.PROFILE_DETAIL_SCREEN,
    },
    {
      title: 'Đổi mật khẩu',
      icon: <Ionicons name="lock-closed-outline" size={24} color={COLORS.ACCENT} style={styles.menuIcon} />,
      action: () => navigation.navigate(ROUTES.CHANGE_PASSWORD_SCREEN),
      route: ROUTES.CHANGE_PASSWORD_SCREEN,
    },
    {
      title: 'Xem thống kê cảm xúc',
      icon: <Feather name="bar-chart-2" size={24} color={COLORS.ACCENT} style={styles.menuIcon} />,
      action: () => navigation.navigate(ROUTES.STATISTIC_SCREEN),
      route: ROUTES.STATISTIC_SCREEN,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.profileHeader}>
          {userInfo?.avatarUrl ? (
            <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={60} color={COLORS.TEXT_SECONDARY} />
            </View>
          )}
          <Text style={styles.username}>{userInfo?.username || 'Người dùng'}</Text>
          {/* <Text style={styles.email}>{userInfo?.email || 'Chưa có email'}</Text> */}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              {item.icon}
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward-outline" size={22} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.ERROR} style={styles.menuIcon} />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
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
    paddingVertical: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  email: { // Bỏ comment nếu bạn có email
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  menuContainer: {
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 17,
    color: COLORS.TEXT_PRIMARY,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20, // Khoảng cách với menu items
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  logoutButtonText: {
    flex: 1,
    fontSize: 17,
    color: COLORS.ERROR, // Màu đỏ cho hành động nguy hiểm
    fontWeight: '500',
  },
});

export default ProfileScreen;