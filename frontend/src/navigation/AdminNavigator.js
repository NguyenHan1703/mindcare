import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import các màn hình thực tế
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'
import AdminAddUserScreen from '../screens/admin/AdminAddUserScreen'
import AdminEditUserScreen from '../screens/admin/AdminEditUserScreen'
import AdminUserChatViewScreen from '../screens/admin/AdminUserChatViewScreen'
import AdminUserConversationListScreen from '../screens/admin/AdminUserConversationListScreen'
import AdminUserEmotionStatsScreen from '../screens/admin/AdminUserEmotionStatsScreen'

// Import các hằng số tên màn hình
import * as ROUTES from '../constants/routes'
import COLORS from '../constants/colors'

const Stack = createNativeStackNavigator()


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
        component={AdminDashboardScreen}
        options={{ title: 'Bảng điều khiển Admin' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_ADD_USER_SCREEN}
        component={AdminAddUserScreen}
        options={{ title: 'Thêm người dùng mới' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_EDIT_USER_SCREEN}
        component={AdminEditUserScreen}
        options={{ title: 'Sửa thông tin người dùng' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_EMOTION_STATS_SCREEN}
        component={AdminUserEmotionStatsScreen}
        options={{ title: 'Thống kê cảm xúc User' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_CONVERSATION_LIST_SCREEN}
        component={AdminUserConversationListScreen}
        options={{ title: 'DS Hội thoại User' }}
      />
      <Stack.Screen
        name={ROUTES.ADMIN_USER_CHAT_VIEW_SCREEN}
        component={AdminUserChatViewScreen}
        options={{ title: 'Xem hội thoại User' }}
      />
    </Stack.Navigator>
  )
}

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
})

export default AdminNavigator