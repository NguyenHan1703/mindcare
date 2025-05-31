import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

const getTodayDateString = () => new Date().toISOString().split('T')[0] // YYYY-MM-DD

export const updateLoginStreak = async (userId) => {
  if (!userId) {
    console.error('Không có userId, không thể cập nhật thành tích đăng nhập!')
    return 1 // Nếu không có userId, mặc định là 1 ngày
  }

  try {
    const today = getTodayDateString()
    const userKey = `loginStreak_${userId}`
    const storedData = await AsyncStorage.getItem(userKey)

    let streakData = { lastLogin: today, streak: 1 }

    if (storedData) {
      const { lastLogin, streak } = JSON.parse(storedData)

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]

      if (lastLogin === yesterdayString) {
        streakData.streak = streak + 1 // Tăng chuỗi liên tiếp
      } else if (lastLogin !== today) {
        streakData.streak = 1 // Reset chuỗi nếu bị gián đoạn
      }
    }

    await AsyncStorage.setItem(userKey, JSON.stringify(streakData))

    return streakData.streak // Trả về số ngày liên tiếp của user
  } catch (error) {
    console.error(`Lỗi khi cập nhật thành tích đăng nhập cho user ${userId}:`, error)
    return 1 // Nếu có lỗi, giả định là 1 ngày
  }
}

export const checkAndShowLoginMessage = async (userId) => {
  if (!userId) {
    console.error('Không có userId, không thể kiểm tra thông báo đăng nhập!')
    return
  }

  const today = getTodayDateString()
  const userKey = `loginMessageShown_${userId}`
  const alreadyShown = await AsyncStorage.getItem(userKey)

  console.log(`Kiểm tra thông báo cho user ${userId}: Đã hiển thị hôm nay?`, alreadyShown)

  if (alreadyShown === today) {
    console.log(`Thông báo đã hiển thị hôm nay cho user ${userId}, không cần hiển thị lại.`)
    return
  }

  const streak = await updateLoginStreak(userId)

  if (streak > 1) {
    Alert.alert('🔥 Thành tích đăng nhập', `Bạn đã giữ lửa được ${streak} ngày liên tiếp!`)
  } else {
    Alert.alert('✨ Bạn đã bắt đầu chuỗi đăng nhập của mình!', 'Hãy cố gắng duy trì mỗi ngày nhé!')
  }

  await AsyncStorage.setItem(userKey, today) // Đánh dấu là đã hiển thị thông báo hôm nay riêng cho userId
}
