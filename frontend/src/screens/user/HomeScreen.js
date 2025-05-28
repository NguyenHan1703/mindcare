import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'

import { useAuth } from '../../contexts/AuthContext'
import * as ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'
import {
  getUserConversationsApi,
  createConversationApi,
  deleteConversationApi
} from '../../api/conversation.api.js'
import ConversationItem from '../../components/user/ConversationItem'

// Logger đơn giản
const logger = {
  info: (...args) => console.log('HomeScreen [INFO]', ...args),
  warn: (...args) => console.warn('HomeScreen [WARN]', ...args),
  error: (...args) => console.error('HomeScreen [ERROR]', ...args),
}

const HomeScreen = () => {
  const navigation = useNavigation()
  const { state: authState } = useAuth()
  const { userInfo } = authState

  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingConvo, setIsCreatingConvo] = useState(false)
  const [error, setError] = useState(null)

  const fetchConversations = useCallback(async (showLoadingIndicator = true) => {
    logger.info('fetchConversations called, showLoadingIndicator:', showLoadingIndicator)
    if (showLoadingIndicator) {
        setIsLoading(true)
    }
    setError(null)
    try {
      const response = await getUserConversationsApi()
      setConversations(response.data || [])
    } catch (err) {
      logger.error('Lỗi khi tải danh sách hội thoại:', err.response?.data?.message || err.message, err)
      setError('Không thể tải danh sách hội thoại. Vui lòng thử lại.')
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      logger.info('HomeScreen focused, fetching conversations...')
      fetchConversations(true)
      return () => logger.info('HomeScreen unfocused')
    }, [fetchConversations])
  )

  const handleCreateConversation = async () => {
    logger.info('handleCreateConversation triggered')
    if (isCreatingConvo) {
      logger.warn('handleCreateConversation: Already creating a conversation.')
      return
    }
    setIsCreatingConvo(true)
    setError(null)
    try {
      const response = await createConversationApi(null)
      const newConversation = response.data
      if (newConversation && newConversation.id) {
        logger.info('Cuộc hội thoại mới được tạo:', newConversation.id)
        await fetchConversations(false)
        navigation.navigate(ROUTES.CHAT_SCREEN, {
          conversationId: newConversation.id,
          conversationTitle: newConversation.title,
        })
      } else {
        logger.error('Phản hồi tạo hội thoại không hợp lệ:', newConversation)
        Alert.alert('Lỗi', 'Phản hồi tạo hội thoại không hợp lệ từ server.')
      }
    } catch (err) {
      logger.error('Lỗi khi tạo hội thoại mới:', err.response?.data?.message || err.message, err)
      Alert.alert('Lỗi', 'Không thể tạo cuộc hội thoại mới. Vui lòng thử lại.')
    } finally {
      setIsCreatingConvo(false)
    }
  }

  const handleDeleteConversation = (conversationId, conversationTitle) => {
    logger.info(`Attempting to delete conversation: ${conversationId}`)
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa cuộc hội thoại "${conversationTitle || 'này'}" không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversationApi(conversationId)
              logger.info('Đã xóa hội thoại:', conversationId)
              fetchConversations(false)
            } catch (err) {
              logger.error('Lỗi khi xóa hội thoại:', conversationId, err.response?.data?.message || err.message)
              Alert.alert('Lỗi', 'Không thể xóa cuộc hội thoại. Vui lòng thử lại.')
            }
          },
        },
      ]
    )
  }

  const handleNavigateToChat = (conversationId, title) => {
    logger.info(`Navigating to ChatScreen with conversationId: ${conversationId}, title: ${title}`)
    navigation.navigate(ROUTES.CHAT_SCREEN, {
      conversationId,
      conversationTitle: title,
    })
  }

  
  const handleNavigateToRelaxation = () => {
    logger.info('Navigating to RelaxationScreen')

    if (ROUTES.RELAXATION_SCREEN) {
        navigation.navigate(ROUTES.RELAXATION_SCREEN)
    } else {
        logger.error('ROUTES.RELAXATION_SCREEN is not defined!')
        Alert.alert('Lỗi', 'Chức năng Thư giãn đang được phát triển.')
    }
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeftGroup}>
        <TouchableOpacity
          onPress={() => { logger.info('MindCare logo pressed - fetching conversations'), fetchConversations(false)}}
          style={styles.mindCareButton}
        >
          <Text style={styles.headerTitle}>MindCare</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { logger.info('Create new conversation button pressed in header'), handleCreateConversation() }}
          style={styles.actionButton}
          disabled={isCreatingConvo}
        >
          {isCreatingConvo ? (
            <ActivityIndicator color={COLORS.PRIMARY} size="small" />
          ) : (
            <Ionicons name="add-circle-outline" size={28} color={COLORS.PRIMARY} />
          )}
          {!isCreatingConvo && <Text style={styles.actionButtonText}>Tạo mới</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNavigateToRelaxation} style={styles.actionButton}>
          <MaterialCommunityIcons name="headphones" size={26} color={COLORS.PRIMARY} /> 
          <Text style={styles.actionButtonText}>Thư giãn</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          logger.info('Profile button in header pressed. Navigating to:', ROUTES.PROFILE_SCREEN)
          navigation.navigate(ROUTES.PROFILE_SCREEN)
        }}
        style={styles.profileButton}
      >
        {userInfo?.avatarUrl ? (
          <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={32} color={COLORS.TEXT_PRIMARY} />
        )}
      </TouchableOpacity>
    </View>
  )

  const renderConversationItem = ({ item }) => (
    <ConversationItem
      id={item.id}
      title={item.title}
      updatedAt={item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'N/A'}
      onPress={handleNavigateToChat}
      onDelete={handleDeleteConversation}
    />
  )

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {error && (
        <View style={styles.centeredMessageContainer}>
          <MaterialIcons name="error-outline" size={60} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchConversations(true)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading && conversations.length === 0 && !error && (
        <View style={styles.centeredMessageContainer}>
          <MaterialIcons name="chat-bubble-outline" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyMessage}>Hiện chưa có cuộc hội thoại nào.</Text>
          <Text style={styles.emptySubMessage}>Nhấn "+" hoặc "Thư giãn" ở góc trên để bắt đầu.</Text>
        </View>
      )}
      {conversations.length > 0 && (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id?.toString() || `conv-${item}-${Date.now()}`} // Thêm Date.now() để tăng tính duy nhất
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchConversations(false)}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mindCareButton: {
    paddingRight: 12, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  actionButton: { 
    paddingHorizontal: 6, 
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8, // Khoảng cách giữa các nút action
  },
  actionButtonText: { // Text cho các nút action (Tạo mới, Thư giãn)
    color: COLORS.PRIMARY,
    fontSize: 15, // Có thể điều chỉnh kích thước
    marginLeft: 4, // Khoảng cách giữa icon và text
    fontWeight: '500',
  },
  profileButton: {
    padding: 5,
    marginLeft: 8, // Đảm bảo có khoảng cách với nút action cuối cùng bên trái
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  listContainer: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMessage: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    marginTop:10,
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

export default HomeScreen