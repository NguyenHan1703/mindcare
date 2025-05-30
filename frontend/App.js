import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AuthProvider } from './src/contexts/AuthContext'
import RootNavigator from './src/navigation/RootNavigator'
import { checkIfUserHasOpenedToday, scheduleNotificationAt5PM, saveLastOpenedTime } from './src/utils/NotificationService'
import * as Notifications from 'expo-notifications'

export default function App() {

  useEffect(() => {

    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== 'granted') {
        alert('Bạn cần cấp quyền thông báo để nhận lời nhắc.')
      }
    }

    const checkUserAndScheduleNotification = async () => {
      // Yêu cầu quyền thông báo
      requestPermission()

      // Kiểm tra xem người dùng đã vào ứng dụng chưa
      const hasOpenedToday = await checkIfUserHasOpenedToday()
      if (!hasOpenedToday) {
        // Nếu người dùng chưa vào trong ngày, lên lịch thông báo
        scheduleNotificationAt5PM()
      }
      // Lưu thời gian người dùng vào ứng dụng
      saveLastOpenedTime()
    }

    checkUserAndScheduleNotification()
  }, [])

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  )
}