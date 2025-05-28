import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Alert,
} from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useAuth } from '../../contexts/AuthContext'
import * as ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'
import { getConversationMessagesApi, saveUserMessageApi } from '../../api/conversation.api.js'
import { logDailyEmotionApi } from '../../api/emotion.api.js' // Đảm bảo tên hàm đúng
import EmotionPicker from '../../components/user/EmotionPicker' // Import component thật
import MessageBubble from '../../components/user/MessageBubble' // Import component thật

// Logger đơn giản
const logger = {
  info: (...args) => console.log('ChatScreen [INFO]', ...args),
  warn: (...args) => console.warn('ChatScreen [WARN]', ...args),
  error: (...args) => console.error('ChatScreen [ERROR]', ...args),
  debug: (...args) => console.log('ChatScreen [DEBUG]', ...args),
}

const ChatScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  // const { state: authState } = useAuth(); // Không cần userInfo trực tiếp ở đây nếu sender chỉ là "USER"
  
  const { conversationId, conversationTitle } = route.params

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(true) // Ban đầu là true
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  
  const [showEmotionPicker, setShowEmotionPicker] = useState(false)
  const [dailyEmotionLoggedToday, setDailyEmotionLoggedToday] = useState(false)
  const [aiAskingForEmotion, setAiAskingForEmotion] = useState(false)

  const flatListRef = useRef(null)

  const getTodayDateString = () => new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Kiểm tra xem cảm xúc đã được log cho ngày hôm nay chưa từ AsyncStorage
  const checkDailyEmotionLogStatus = async () => {
    try {
      const loggedDate = await AsyncStorage.getItem(`mindcare_emotion_logged_${getTodayDateString()}`)
      if (loggedDate) {
        setDailyEmotionLoggedToday(true)
        setShowEmotionPicker(false) // Nếu đã log rồi thì không hiện picker nữa
        logger.info('Daily emotion already logged for today.')
      } else {
        setDailyEmotionLoggedToday(false)
        logger.info('Daily emotion not yet logged for today.')
      }
    } catch (e) {
      logger.error('Error reading daily emotion log status from AsyncStorage:', e)
      setDailyEmotionLoggedToday(false) // Mặc định là chưa log nếu có lỗi
    }
  }

  // Logic nhận diện AI hỏi cảm xúc (có thể cải thiện thêm)
  const detectAIAskingForEmotion = (allMessages) => {
    if (dailyEmotionLoggedToday || !allMessages || allMessages.length === 0) {
      setAiAskingForEmotion(false)
      return false
    }
    const lastMessage = allMessages[allMessages.length - 1]
    if (lastMessage && lastMessage.sender === 'AI') {
      const aiText = lastMessage.content.toLowerCase()
      const keywords = ['bạn cảm thấy thế nào', 'cảm xúc của bạn', 'chia sẻ cảm xúc', 'thấy sao', 'tâm trạng hôm nay']
      const isAsking = keywords.some(keyword => aiText.includes(keyword))
      if (isAsking) {
        logger.info('AI seems to be asking for emotion.')
        setAiAskingForEmotion(true)
        return true
      }
    }
    setAiAskingForEmotion(false)
    return false
  }

  const fetchMessages = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator && messages.length === 0) setIsLoadingMessages(true) // Chỉ loading to nếu chưa có tin nhắn nào
    setError(null)
    try {
      const response = await getConversationMessagesApi(conversationId)
      const fetchedMessages = response.data || []
      setMessages(fetchedMessages)
      // Sau khi tải tin nhắn, kiểm tra xem AI có hỏi cảm xúc không VÀ cảm xúc hôm nay chưa được log
      if (!dailyEmotionLoggedToday) {
        const shouldShowPicker = detectAIAskingForEmotion(fetchedMessages)
        setShowEmotionPicker(shouldShowPicker)
      } else {
        setShowEmotionPicker(false) // Đảm bảo picker ẩn nếu đã log
      }
    } catch (err) {
      logger.error('Lỗi khi tải tin nhắn:', err.response?.data?.message || err.message)
      setError('Không thể tải tin nhắn. Vui lòng thử lại.')
    } finally {
      if (showLoadingIndicator) setIsLoadingMessages(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        logger.info(`ChatScreen focused for ConvID: ${conversationId}.`)
        checkDailyEmotionLogStatus() // Kiểm tra trạng thái log cảm xúc mỗi khi vào màn hình
        fetchMessages()
      }
      return () => {
        logger.info(`ChatScreen unfocused for ConvID: ${conversationId}.`)
        // Có thể reset một số state ở đây nếu cần
      }
    }, [conversationId]) // Thêm fetchMessages vào dependencies nếu nó ổn định
  )
  
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const messageContent = inputText.trim()
    setInputText('')
    setIsSendingMessage(true)
    setError(null)
    setShowEmotionPicker(false) // Khi người dùng chủ động chat, ẩn picker

    const tempUserMessageId = `temp-user-${Date.now()}`
    const optimisticUserMessage = {
      id: tempUserMessageId,
      conversationId,
      sender: 'USER',
      content: messageContent,
      timestamp: new Date().toISOString(),
    }
    setMessages(prevMessages => [...prevMessages, optimisticUserMessage])

    try {
      await saveUserMessageApi(conversationId, messageContent)
      logger.info(`User message sent for ConvID: ${conversationId}. Fetching updated messages.`)
      await fetchMessages(false) // Tải lại để có tin nhắn user thật và phản hồi AI
    } catch (err) {
      logger.error('Lỗi khi gửi tin nhắn:', err.response?.data?.message || err.message)
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.')
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempUserMessageId)) // Xóa tin nhắn tạm nếu lỗi
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn của bạn.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleEmotionSelected = async (emotionValue) => {
    logger.info(`User selected emotion: ${emotionValue}`)
    setShowEmotionPicker(false) // Ẩn picker ngay
    
    try {
      await logDailyEmotionApi(emotionValue) // Gọi API lưu cảm xúc
      await AsyncStorage.setItem(`mindcare_emotion_logged_${getTodayDateString()}`, 'true') // Đánh dấu đã log hôm nay
      setDailyEmotionLoggedToday(true) // Cập nhật state
      
      Alert.alert('Thông báo', `Đã ghi nhận cảm xúc: ${emotionValue}`)
      
      // (Tùy chọn) Thêm tin nhắn xác nhận vào cuộc hội thoại
      const confirmMessage = {
        id: `temp-emotion-confirm-${Date.now()}`,
        conversationId,
        sender: 'USER', // Hoặc một sender đặc biệt như 'SYSTEM_MESSAGE' nếu bạn muốn style khác
        content: `(Tôi đã ghi nhận cảm xúc hôm nay là: ${emotionValue})`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prevMessages => [...prevMessages, confirmMessage])
      // Bạn có thể không cần gọi fetchMessages() lại ngay lập tức ở đây,
      // vì tin nhắn này chỉ mang tính thông báo cho user trên UI.
      // AI sẽ không thấy tin nhắn này trừ khi bạn gửi nó lên server.

    } catch (err) {
      logger.error('Lỗi khi ghi nhận cảm xúc:', err.response?.data?.message || err.message)
      Alert.alert('Lỗi', 'Không thể ghi nhận cảm xúc của bạn. Vui lòng thử lại.')
      // Không set dailyEmotionLoggedToday = false ở đây, để tránh việc picker hiện lại ngay nếu AI vẫn hỏi.
      // Người dùng có thể thử lại bằng cách tương tác với picker lần nữa nếu nó vẫn hiện (do AI hỏi).
    }
  }

  const renderItem = ({ item }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.sender === 'USER'}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      title: conversationTitle || 'Hội thoại',
    })
  }, [navigation, conversationTitle])

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Điều chỉnh offset cho header nếu cần
      >
        {isLoadingMessages && messages.length === 0 ? (
          <View style={styles.centeredContainer}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
        ) : error && messages.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchMessages(true)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
           <View style={styles.centeredContainer}>
            <MaterialIcons name="forum" size={60} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyChatMessage}>Bắt đầu cuộc trò chuyện!</Text>
            <Text style={styles.emptyChatMessageSubtitle}>Gửi một tin nhắn để nhận phản hồi từ An Tâm.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || `msg-${index}-${Date.now()}`}
            contentContainerStyle={styles.messagesListContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} // Cuộn xuống khi có tin nhắn mới
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} // Cuộn xuống khi layout thay đổi
          />
        )}

        {/* Hiển thị EmotionPicker nếu AI hỏi VÀ cảm xúc hôm nay chưa được log */}
        <EmotionPicker
            isVisible={showEmotionPicker && aiAskingForEmotion && !dailyEmotionLoggedToday}
            onEmotionSelect={handleEmotionSelected}
            promptMessage="Mình muốn biết bạn cảm thấy thế nào hôm nay:"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            multiline
            selectionColor={COLORS.PRIMARY}
            onFocus={() => setShowEmotionPicker(false)} // Ẩn picker khi focus vào input
          />
          <TouchableOpacity
            style={[styles.sendButton, (isSendingMessage || !inputText.trim()) ? styles.sendButtonDisabled : {}]}
            onPress={handleSendMessage}
            disabled={isSendingMessage || !inputText.trim()}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Ionicons name="send" size={22} color={COLORS.WHITE} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 16,
    marginBottom:10,
    textAlign: 'center',
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
  emptyChatMessage: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyChatMessageSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
    textAlign: 'center',
  },
  messagesListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND_SECONDARY, 
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0, 
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44, 
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
})

export default ChatScreen