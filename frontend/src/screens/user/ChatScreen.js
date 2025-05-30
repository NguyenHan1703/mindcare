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
    Alert,
} from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import COLORS from '../../constants/colors'
import { getConversationMessagesApi, saveUserMessageApi } from '../../api/conversation.api.js'
import { logDailyEmotionApi } from '../../api/emotion.api.js'
import EmotionPicker from '../../components/user/EmotionPicker'
import MessageBubble from '../../components/user/MessageBubble'

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

    const { conversationId, conversationTitle } = route.params

    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isLoadingMessages, setIsLoadingMessages] = useState(true)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [error, setError] = useState(null)

    const [showEmotionPicker, setShowEmotionPicker] = useState(false)
    const [dailyEmotionLoggedToday, setDailyEmotionLoggedToday] = useState(false)
    // State aiAskingForEmotion không còn trực tiếp điều khiển hiển thị picker
    // nhưng vẫn có thể giữ lại để ghi nhận thông tin nếu cần
    const [aiAskingForEmotion, setAiAskingForEmotion] = useState(false)

    const flatListRef = useRef(null)

    const getTodayDateString = useCallback(() => new Date().toISOString().split('T')[0], [])

    // Hàm kiểm tra trạng thái cảm xúc đã được log cho ngày hôm nay
    const checkDailyEmotionLogStatus = useCallback(async () => {
        try {
            const loggedDateKey = `mindcare_emotion_logged_${getTodayDateString()}`
            const loggedStatus = await AsyncStorage.getItem(loggedDateKey)
            const isLogged = loggedStatus === 'true'
            setDailyEmotionLoggedToday(isLogged) // Cập nhật state
            logger.info(`Daily emotion log status for ${getTodayDateString()}: ${isLogged ? 'Logged' : 'Not logged'}`)
            return isLogged
        } catch (e) {
            logger.error('Error reading daily emotion log status from AsyncStorage:', e)
            setDailyEmotionLoggedToday(false)
            return false
        }
    }, [getTodayDateString])

    // Logic nhận diện AI hỏi cảm xúc (không còn điều khiển hiển thị picker trực tiếp)
    const detectAIAskingForEmotion = useCallback((allMessages) => {
        if (!allMessages || allMessages.length === 0) {
            return false
        }
        const lastMessage = allMessages[allMessages.length - 1]
        if (lastMessage && lastMessage.sender === 'AI') {
            const aiText = lastMessage.content.toLowerCase().replace(/[.,!?;:]/g, ' ')
            const keywords = [
                'bạn cảm thấy thế nào', 'cảm xúc của bạn', 'chia sẻ cảm xúc',
                'thấy sao', 'tâm trạng hôm nay', 'cảm giác của bạn',
                'bạn đang cảm thấy', 'điều gì bạn muốn chia sẻ về cảm xúc của mình không'
            ]
            const isAsking = keywords.some(keyword => aiText.includes(keyword))
            if (isAsking) {
                logger.info('AI seems to be asking for emotion.')
                return true
            }
        }
        return false
    }, [])

    // Hàm tổng hợp logic tải tin nhắn và quản lý trạng thái picker
    const fetchMessagesAndHandleEmotionPicker = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator && messages.length === 0) setIsLoadingMessages(true)
        setError(null)
        try {
            const response = await getConversationMessagesApi(conversationId)
            const fetchedMessages = response.data || []
            setMessages(fetchedMessages)

            // Bước 1: Kiểm tra trạng thái log cảm xúc (Ưu tiên hàng đầu)
            const logged = await checkDailyEmotionLogStatus()

            // Bước 2: Chỉ hiển thị EmotionPicker nếu chưa log cảm xúc trong ngày
            if (!logged) {
                setShowEmotionPicker(true) // Hiển thị picker ngay lập tức
                logger.info('EmotionPicker visibility: Visible (Emotion not logged today)')
                // Bạn vẫn có thể dùng detectAIAskingForEmotion để ghi nhận, nhưng không điều khiển hiển thị
                setAiAskingForEmotion(detectAIAskingForEmotion(fetchedMessages))
            } else {
                setShowEmotionPicker(false) // Ẩn picker nếu đã log
                logger.info('EmotionPicker visibility: Hidden (Emotion already logged today)')
                setAiAskingForEmotion(false)
            }

        } catch (err) {
            logger.error('Lỗi khi tải tin nhắn:', err.response?.data?.message || err.message)
            setError('Không thể tải tin nhắn. Vui lòng thử lại.')
        } finally {
            if (showLoadingIndicator) setIsLoadingMessages(false)
        }
    }, [conversationId, messages.length, checkDailyEmotionLogStatus, detectAIAskingForEmotion]) // Thêm dependencies

    // useFocusEffect để tải tin nhắn và quản lý trạng thái picker khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            if (conversationId) {
                logger.info(`ChatScreen focused for ConvID: ${conversationId}. Initiating data load.`)
                fetchMessagesAndHandleEmotionPicker()
            }
            return () => {
                logger.info(`ChatScreen unfocused for ConvID: ${conversationId}.`)
            }
        }, [conversationId, fetchMessagesAndHandleEmotionPicker])
    )

    // Cuộn xuống cuối FlatList khi messages thay đổi
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
        
        // Khi người dùng gửi tin nhắn, ẩn picker ngay lập tức
        setShowEmotionPicker(false)
        setAiAskingForEmotion(false) // Reset state AI asking

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
            // Sau khi gửi thành công, tải lại tin nhắn để có phản hồi AI
            // và để logic hiển thị picker được chạy lại dựa trên trạng thái cảm xúc đã log
            // (Lúc này dailyEmotionLoggedToday có thể vẫn là false nếu người dùng chưa chọn)
            await fetchMessagesAndHandleEmotionPicker(false)
        } catch (err) {
            logger.error('Lỗi khi gửi tin nhắn:', err.response?.data?.message || err.message)
            setError('Không thể gửi tin nhắn. Vui lòng thử lại.')
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempUserMessageId)) // Xóa tin nhắn tạm nếu lỗi
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn của bạn. Vui lòng thử lại.')
        } finally {
            setIsSendingMessage(false)
        }
    }

    const handleEmotionSelected = async (emotionValue) => {
        logger.info(`User selected emotion: ${emotionValue}`)
        setShowEmotionPicker(false) // Ẩn picker ngay khi chọn
        setAiAskingForEmotion(false) // Reset AI asking state

        try {
            await logDailyEmotionApi(emotionValue) 

            // Đánh dấu đã log cảm xúc cho ngày hôm nay trong AsyncStorage
            const todayDate = getTodayDateString()
            await AsyncStorage.setItem(`mindcare_emotion_logged_${todayDate}`, 'true')
            setDailyEmotionLoggedToday(true) // Cập nhật state đã log

            Alert.alert('Thông báo', `Đã ghi nhận cảm xúc: ${emotionValue}`)

            // Thêm tin nhắn xác nhận vào cuộc hội thoại (chỉ hiển thị trên UI)
            const confirmMessage = {
                id: `emotion-log-feedback-${Date.now()}`,
                conversationId,
                sender: 'USER',
                content: `(Tôi đã ghi nhận cảm xúc hôm nay là: ${emotionValue}.)`,
                timestamp: new Date().toISOString(),
            }
            setMessages(prevMessages => [...prevMessages, confirmMessage])

        } catch (err) {
            logger.error('Lỗi khi ghi nhận cảm xúc:', err.response?.data?.message || err.message)
            Alert.alert('Lỗi', 'Không thể ghi nhận cảm xúc của bạn. Vui lòng thử lại.')
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                {isLoadingMessages && messages.length === 0 ? (
                    <View style={styles.centeredContainer}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
                ) : error && messages.length === 0 ? (
                    <View style={styles.centeredContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => fetchMessagesAndHandleEmotionPicker(true)} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : messages.length === 0 ? (
                    <View style={styles.centeredContainer}>
                        <MaterialIcons name="forum" size={60} color={COLORS.TEXT_SECONDARY} />
                        <Text style={styles.emptyChatMessage}>Bắt đầu cuộc trò chuyện!</Text>
                        <Text style={styles.emptyChatMessageSubtitle}>Gửi một tin nhắn để nhận phản hồi.</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : `msg-fallback-${index}`} 
                        contentContainerStyle={styles.messagesListContainer}
                    />
                )}

                {/* Hiển thị EmotionPicker nếu showEmotionPicker là true (do chưa log cảm xúc) */}
                <EmotionPicker
                    isVisible={showEmotionPicker && !dailyEmotionLoggedToday} // Giữ lại !dailyEmotionLoggedToday để đảm bảo logic kép
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
                        onFocus={() => {
                            // Khi focus vào input, ẩn picker ngay lập tức
                            setShowEmotionPicker(false)
                            setAiAskingForEmotion(false)
                        }}
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
        marginBottom: 10,
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