import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // Cho nút thử lại
  SafeAreaView,
} from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'

import COLORS from '../../constants/colors'
import { getMessagesForConversationByAdminApi } from '../../api/admin.api.js' 
import MessageBubble from '../../components/user/MessageBubble'

// Logger đơn giản
const logger = {
  info: (...args) => console.log('AdminUserChatViewScreen [INFO]', ...args),
  warn: (...args) => console.warn('AdminUserChatViewScreen [WARN]', ...args),
  error: (...args) => console.error('AdminUserChatViewScreen [ERROR]', ...args),
}

const AdminUserChatViewScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  // targetUserId có thể dùng để log hoặc các mục đích khác nếu cần
  const { conversationId, conversationTitle, targetUsername, targetUserId } = route.params

  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const flatListRef = useRef(null)

  // Đặt tiêu đề động cho header
  useEffect(() => {
    const title = conversationTitle || 'Chi tiết hội thoại'
    const subtitle = targetUsername ? `của ${targetUsername}` : ''
    navigation.setOptions({
      title: `${title} ${subtitle}`.trim(),
    })
  }, [navigation, conversationTitle, targetUsername])

  const fetchMessages = useCallback(async (showLoadingIndicator = true) => {
    if (!conversationId) {
      setError('Không có thông tin hội thoại.')
      setIsLoading(false)
      return
    }
    if (showLoadingIndicator && messages.length === 0) setIsLoading(true)
    setError(null)
    try {
      logger.info(`Admin fetching messages for ConvID: ${conversationId}`)
      // Gọi API admin để lấy tin nhắn
      const response = await getMessagesForConversationByAdminApi(conversationId)
      setMessages(response.data || [])
    } catch (err) {
      logger.error('Lỗi khi admin tải tin nhắn:', err.response?.data?.message || err.message)
      setError('Không thể tải tin nhắn. Vui lòng thử lại hoặc kiểm tra API backend.')
      setMessages([])
    } finally {
      if (showLoadingIndicator) setIsLoading(false)
    }
  }, [conversationId])

  useFocusEffect(
    useCallback(() => {
      fetchMessages()
    }, [fetchMessages])
  )
  
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false }) // Cuộn xuống không animation cho nhanh
    }
  }, [messages])

  const renderItem = ({ item }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.sender === 'USER'} 
    />
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <MaterialIcons name="error-outline" size={60} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchMessages(true)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (messages.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <MaterialIcons name="chat-bubble-outline" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyMessage}>Không có tin nhắn nào trong cuộc hội thoại này.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || `msg-admin-${index}-${Date.now()}`}
        contentContainerStyle={styles.messagesListContainer}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  messagesListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
})

export default AdminUserChatViewScreen