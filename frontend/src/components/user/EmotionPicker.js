import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import COLORS from '../../constants/colors'
import { EMOTIONS_LIST } from '../../constants/emotionDefinitions'

const EmotionPicker = ({ isVisible, onEmotionSelect, promptMessage }) => {
  const [dailyEmotionLoggedToday, setDailyEmotionLoggedToday] = useState(false)

  useEffect(() => {
    const checkEmotionStatus = async () => {
      const storedEmotion = await AsyncStorage.getItem('userEmotion')
      if (storedEmotion) {
        const { date } = JSON.parse(storedEmotion)
        const today = new Date().toISOString().split('T')[0]
        setDailyEmotionLoggedToday(date === today)
      }
    }

    checkEmotionStatus()
  }, [])

  if (!isVisible || dailyEmotionLoggedToday) {
    return null // Không hiển thị nếu cảm xúc đã được gửi hôm nay
  }

  const handleSelect = async (emotionValue) => {
    if (onEmotionSelect) {
      await AsyncStorage.setItem('userEmotion', JSON.stringify({ date: new Date().toISOString().split('T')[0], emotion: emotionValue }))
      setDailyEmotionLoggedToday(true) // Đánh dấu đã chọn cảm xúc hôm nay
      onEmotionSelect(emotionValue)
    }
  }

  return (
    <View style={styles.container}>
      {promptMessage && <Text style={styles.promptText}>{promptMessage}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {EMOTIONS_LIST.map((emotion) => (
          <TouchableOpacity key={emotion.value} style={styles.emotionButton} onPress={() => handleSelect(emotion.value)} activeOpacity={0.7}>
            <Text style={[styles.emojiText, { color: emotion.color || COLORS.TEXT_PRIMARY }]}>
              {emotion.emoji}
            </Text>
            <Text style={[styles.emotionName, { color: emotion.color || COLORS.TEXT_SECONDARY }]}>
              {emotion.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollViewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  emotionButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 5,
    minWidth: 70,
  },
  emojiText: {
    fontSize: 36,
  },
  emotionName: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
})

export default EmotionPicker
