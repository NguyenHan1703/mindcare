import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // Import View và Text cho placeholder
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các hằng số tên màn hình
import * as ROUTES from '../constants/routes';
import COLORS from '../constants/colors'; // Để tùy chỉnh header nếu cần

const Stack = createNativeStackNavigator();

// --- Các Component Màn hình Giữ chỗ (Placeholders) ---
// Các component này sẽ được thay thế bằng các file màn hình thực tế ở các PD sau.

const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{route.name}</Text>
    <Text style={styles.placeholderSubText}>(Nội dung màn hình sẽ được xây dựng sau)</Text>
  </View>
);

// Bạn có thể tạo các placeholder cụ thể hơn nếu muốn, ví dụ:
// const AdminDashboardScreen = () => <PlaceholderScreen route={{ name: "Admin Dashboard" }} />;
// Hoặc đơn giản là dùng chung PlaceholderScreen cho tất cả như dưới đây.

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.ADMIN_DASHBOARD_SCREEN}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND_SECONDARY, // Hoặc một màu khác cho admin
        },
        headerTintColor: COLORS.TEXT_PRIMARY,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.ADMIN_DASHBOARD_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminDashboardScreen.js
        options={{ title: 'Bảng điều khiển Admin' }}
      />
      {/* User List Screen - có thể là một phần của Dashboard hoặc màn hình riêng */}
      {/* Nếu là màn hình riêng, bạn có thể thêm vào đây */}
      {/* <Stack.Screen
        name={ROUTES.ADMIN_USER_LIST_SCREEN} // Bạn cần định nghĩa hằng số này trong routes.js
        component={PlaceholderScreen} // Sẽ thay bằng AdminUserListScreen.js
        options={{ title: 'Danh sách người dùng' }}
      /> */}
      <Stack.Screen
        name={ROUTES.ADMIN_ADD_USER_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminAddUserScreen.js
        options={{ title: 'Thêm người dùng mới' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_EDIT_USER_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminEditUserScreen.js
        options={{ title: 'Sửa thông tin người dùng' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_EMOTION_STATS_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminUserEmotionStatsScreen.js
        options={{ title: 'Thống kê cảm xúc User' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_CONVERSATION_LIST_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminUserConversationListScreen.js
        options={{ title: 'DS Hội thoại User' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_CHAT_VIEW_SCREEN}
        component={PlaceholderScreen} // Sẽ thay bằng AdminUserChatViewScreen.js
        options={{ title: 'Xem hội thoại User' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholderSubText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
});

export default AdminNavigator;