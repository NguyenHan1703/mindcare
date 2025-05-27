import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import * as ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
import {
  getUserConversationsApi,
  createConversationApi,
  deleteConversationApi
} from '../../api/conversation.api.js';
import ConversationItem from '../../components/user/ConversationItem';

// Logger đơn giản
const logger = {
  info: (...args) => console.log('HomeScreen [INFO]', ...args),
  warn: (...args) => console.warn('HomeScreen [WARN]', ...args),
  error: (...args) => console.error('HomeScreen [ERROR]', ...args),
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth(); // Không cần logout trực tiếp ở đây
  const { userInfo } = authState;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConvo, setIsCreatingConvo] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator && conversations.length === 0) setIsLoading(true);
    else if (!showLoadingIndicator) setIsLoading(true); // Vẫn hiện loading cho pull-to-refresh

    setError(null);
    try {
      const response = await getUserConversationsApi();
      setConversations(response.data || []);
    } catch (err) {
      logger.error("Lỗi khi tải danh sách hội thoại:", err.response?.data?.message || err.message);
      setError('Không thể tải danh sách hội thoại. Vui lòng thử lại.');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversations.length]); // conversations.length để re-run fetch khi list rỗng và cần loading

  useFocusEffect(
    useCallback(() => {
      logger.info("HomeScreen focused, fetching conversations...");
      fetchConversations(true); // Hiển thị loading indicator toàn màn hình nếu list rỗng
      return () => logger.info("HomeScreen unfocused");
    }, [fetchConversations]) // Thêm fetchConversations vào dependencies
  );

  const handleCreateConversation = async () => {
    console.log('handleCreateConversation triggered, isCreatingConvo:', isCreatingConvo);
    if (isCreatingConvo) return; // Tránh gọi nhiều lần
    setIsCreatingConvo(true);
    // ...
    try {
    // ...
    } catch (err) {
    // ...
    } finally {
    console.log('handleCreateConversation finished, setting isCreatingConvo to false');
    setIsCreatingConvo(false); // Đảm bảo luôn được set lại
  }
    setIsCreatingConvo(true);
    setError(null);
    try {
      // titleOpt có thể được truyền vào đây nếu bạn có UI cho phép user nhập title trước khi tạo
      const response = await createConversationApi(null); // title là null để backend tự tạo
      const newConversation = response.data;
      if (newConversation && newConversation.id) {
        logger.info("Cuộc hội thoại mới được tạo:", newConversation.id);
        // Tải lại danh sách để hiển thị conversation mới nhất ở đầu (do sắp xếp theo updatedAt)
        await fetchConversations(false); // false để không hiện loading indicator toàn màn hình
        navigation.navigate(ROUTES.CHAT_SCREEN, {
          conversationId: newConversation.id,
          conversationTitle: newConversation.title,
        });
      } else {
        throw new Error("Phản hồi tạo hội thoại không hợp lệ.");
      }
    } catch (err) {
      logger.error("Lỗi khi tạo hội thoại mới:", err.response?.data?.message || err.message);
      Alert.alert('Lỗi', 'Không thể tạo cuộc hội thoại mới. Vui lòng thử lại.');
    } finally {
      setIsCreatingConvo(false);
    }
  };

  const handleDeleteConversation = (conversationId, conversationTitle) => {
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
              await deleteConversationApi(conversationId); 
              logger.info("Đã xóa hội thoại:", conversationId);
              fetchConversations(false); // Tải lại danh sách, không hiện loading indicator toàn màn hình
            } catch (err) {
              logger.error("Lỗi khi xóa hội thoại:", conversationId, err.response?.data?.message || err.message);
              Alert.alert('Lỗi', 'Không thể xóa cuộc hội thoại. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToChat = (conversationId, title) => {
    navigation.navigate(ROUTES.CHAT_SCREEN, {
      conversationId,
      conversationTitle: title,
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Nhóm MindCare và Nút Tạo Mới ở bên TRÁI */}
      <View style={styles.headerLeftGroup}>
        <TouchableOpacity onPress={() => {console.log('MindCare logo pressed'); fetchConversations(false)}} style={styles.mindCareButton}Ư>
          <Text style={styles.headerTitle}>MindCare</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreateConversation} style={styles.addButton} disabled={isCreatingConvo}>
          {isCreatingConvo ? (
            <ActivityIndicator color={COLORS.PRIMARY} size="small" />
          ) : (
            <Ionicons name="add-circle-outline" size={28} color={COLORS.PRIMARY} /> 
          )}
           { <Text style={styles.addButtonText}>Tạo mới</Text> }
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => {
          console.log("Profile button in header pressed"); // Test log
          navigation.navigate(ROUTES.PROFILE_SCREEN);
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
  );

  const renderConversationItem = ({ item }) => (
    <ConversationItem
      id={item.id}
      title={item.title}
      updatedAt={item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'N/A'}
      onPress={handleNavigateToChat}
      onDelete={handleDeleteConversation}
    />
  );

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    );
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
          <Text style={styles.emptySubMessage}>Nhấn "+" ở góc trên để bắt đầu trò chuyện.</Text>
        </View>
      )}
      {conversations.length > 0 && (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchConversations(false)} // Kéo để refresh
          refreshing={isLoading} // Hiển thị loading indicator khi refresh
        />
      )}
    </SafeAreaView>
  );
};

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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
    headerLeftGroup: { // Cho MindCare và nút Add
      flexDirection: 'row',
      alignItems: 'center',
  },
    mindCareButton: {
      paddingRight: 10, // Khoảng cách giữa MindCare và nút Add
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    marginLeft: 3,
  },
  profileButton: {
    padding: 5,
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
});

export default HomeScreen;