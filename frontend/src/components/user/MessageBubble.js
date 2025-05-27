import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import COLORS from '../../constants/colors' // Import màu sắc

const MessageBubble = ({ message, isCurrentUser }) => {
  if (!message || !message.content) {
    return null // Không render gì nếu không có tin nhắn hoặc nội dung
  }

  const formatTimestamp = (isoTimestamp) => {
    if (!isoTimestamp) return ''
    try {
      // Hiển thị giờ:phút
      return new Date(isoTimestamp).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return ''
    }
  }

  return (
    <View
      style={[
        styles.bubbleContainer,
        isCurrentUser ? styles.currentUserBubbleContainer : styles.aiBubbleContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.aiBubble,
        ]}
      >
        <Text style={isCurrentUser ? styles.currentUserText : styles.aiText}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.aiTimestamp]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '80%', // Bong bóng chat không nên quá rộng
  },
  currentUserBubbleContainer: {
    alignSelf: 'flex-end', // Tin nhắn của user căn phải
    marginLeft: 'auto', // Đẩy sang phải
  },
  aiBubbleContainer: {
    alignSelf: 'flex-start', // Tin nhắn của AI căn trái
    marginRight: 'auto', // Đẩy sang trái
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // Bo tròn nhiều hơn cho bong bóng chat
    elevation: 1, // Độ nổi nhỏ cho Android
    shadowColor: COLORS.BLACK, // Đổ bóng nhẹ cho iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  currentUserBubble: {
    backgroundColor: COLORS.PRIMARY, // Màu cho tin nhắn của user
    borderBottomRightRadius: 5, // Tạo hình dạng đặc trưng
  },
  aiBubble: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY, // Màu cho tin nhắn của AI
    borderBottomLeftRadius: 5, // Tạo hình dạng đặc trưng
    // (Tùy chọn) Thêm viền nếu muốn phân biệt rõ hơn với nền
    // borderWidth: 1,
    // borderColor: COLORS.BORDER,
  },
  currentUserText: {
    fontSize: 16,
    color: COLORS.WHITE, // Chữ trắng trên nền màu PRIMARY
  },
  aiText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY, // Chữ màu chính trên nền màu BACKGROUND_SECONDARY
  },
  timestamp: {
    fontSize: 11,
    marginTop: 5,
    alignSelf: 'flex-end', // Đẩy timestamp về cuối bong bóng
  },
  currentUserTimestamp: {
    color: COLORS.WHITE_MUTED || '#E0E0E0', // Một màu trắng nhạt hơn cho timestamp của user
  },
  aiTimestamp: {
    color: COLORS.TEXT_SECONDARY, // Màu chữ phụ cho timestamp của AI
  },
})

export default MessageBubble