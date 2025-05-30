import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store' // Hoặc AsyncStorage nếu bạn không dùng SecureStore

// Lên lịch thông báo vào lúc 5 giờ chiều
export const scheduleNotificationAt5PM = async () => {
  const now = new Date()
  const targetTime = new Date()
  targetTime.setHours(17, 0, 0, 0) // Đặt thời gian thông báo vào 5 giờ chiều

  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1) // Nếu đã qua 5 giờ chiều thì lên lịch cho ngày hôm sau
  }

  const timeUntil5PM = targetTime.getTime() - now.getTime()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nhắc nhở',
      body: 'Mình nhớ bạn, hãy tâm sự với mình',
    },
    trigger: {
      seconds: timeUntil5PM / 1000, // Thời gian trễ (seconds)
      repeats: true, // Lặp lại mỗi ngày
    },
  })
}

// Lưu thời gian người dùng vào ứng dụng
export const saveLastOpenedTime = async () => {
  const now = new Date()
  await SecureStore.setItemAsync('lastOpenedTime', now.toISOString())
}

// Kiểm tra xem người dùng đã vào ứng dụng chưa trong ngày hôm nay
export const checkIfUserHasOpenedToday = async () => {
  const lastOpened = await SecureStore.getItemAsync('lastOpenedTime')
  const lastOpenedDate = new Date(lastOpened)
  const today = new Date()
  if (
    lastOpenedDate.getDate() !== today.getDate() ||
    lastOpenedDate.getMonth() !== today.getMonth() ||
    lastOpenedDate.getFullYear() !== today.getFullYear()
  ) {
    return false // Người dùng chưa vào hôm nay
  }
  return true // Người dùng đã vào hôm nay
}
