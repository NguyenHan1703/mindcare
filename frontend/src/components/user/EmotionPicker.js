// src/components/user/EmotionPicker.js
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView }
from 'react-native'
// Nếu không dùng Ionicons nữa, bạn có thể xóa dòng import này
// import { Ionicons } from '@expo/vector-icons'; 
import COLORS from '../../constants/colors'
import { EMOTIONS_LIST } from '../../constants/emotionDefinitions' // Import từ file định nghĩa chung

const EmotionPicker = ({ isVisible, onEmotionSelect, promptMessage }) => {
  if (!isVisible) {
    return null // Không render gì nếu không visible
  }

  const handleSelect = (emotionValue) => {
    if (onEmotionSelect) {
      onEmotionSelect(emotionValue)
      // Component này không tự ẩn. Việc ẩn/hiện sẽ do ChatScreen quản lý thông qua prop isVisible.
    }
  }

  return (
    <View style={styles.container}>
      {promptMessage && <Text style={styles.promptText}>{promptMessage}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollViewContent}
      >
        {EMOTIONS_LIST.map((emotion) => (
          <TouchableOpacity
            key={emotion.value}
            style={styles.emotionButton}
            onPress={() => handleSelect(emotion.value)}
            activeOpacity={0.7}
            accessibilityLabel={`Chọn cảm xúc ${emotion.name}`} // Cải thiện accessibility
          >
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
    // Màu sắc được áp dụng inline từ emotion.color
  },
  emotionName: {
    fontSize: 12,
    // Màu sắc được áp dụng inline từ emotion.color
    marginTop: 5,
    textAlign: 'center',
  },
})

export default EmotionPicker
