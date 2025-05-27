import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import các hằng số tên màn hình
import * as ROUTES from '../constants/routes'

// Import các component màn hình của luồng User
import HomeScreen from '../screens/user/HomeScreen'
import ChatScreen from '../screens/user/ChatScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import ChangePasswordScreen from '../screens/user/ChangePasswordScreen'
import ProfileDetailScreen from '../screens/user/ProfileDetailScreen'
import StatisticScreen from '../screens/user/StatisticScreen'
import COLORS from '../constants/colors' // Để tùy chỉnh header nếu cần

const Stack = createNativeStackNavigator()

const UserNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME_SCREEN} // Màn hình mặc định là HomeScreen
      screenOptions={{
        // Tùy chọn chung cho header của tất cả các màn hình trong Stack này
        // Bạn có thể tùy chỉnh thêm ở đây cho phù hợp với dark theme
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND_SECONDARY, // Màu nền cho header
        },
        headerTintColor: COLORS.TEXT_PRIMARY, // Màu cho nút back và tiêu đề
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Ẩn text của nút back trên iOS, chỉ để lại icon
      }}
    >
      <Stack.Screen
        name={ROUTES.HOME_SCREEN}
        component={HomeScreen}
        options={{
          headerShown: false, // HomeScreen sẽ tự render header riêng
        }}
      />
      <Stack.Screen
        name={ROUTES.CHAT_SCREEN}
        component={ChatScreen}
        options={({ route }) => ({
          // Tiêu đề của ChatScreen sẽ được lấy từ params truyền vào khi navigate
          // Ví dụ: route.params.title hoặc một tiêu đề mặc định
          title: route.params?.conversationTitle || 'Hội thoại',
        })}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{
          title: 'Hồ sơ cá nhân', // Tiêu đề cho màn hình Profile
        }}
      />
      <Stack.Screen
        name={ROUTES.CHANGE_PASSWORD_SCREEN}
        component={ChangePasswordScreen}
        options={{
          title: 'Đổi mật khẩu',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_DETAIL_SCREEN}
        component={ProfileDetailScreen}
        options={{
          title: 'Quản lý thông tin',
        }}
      />
      <Stack.Screen
        name={ROUTES.STATISTIC_SCREEN}
        component={StatisticScreen}
        options={{
          title: 'Thống kê cảm xúc',
        }}
      />
    </Stack.Navigator>
  )
}

export default UserNavigator