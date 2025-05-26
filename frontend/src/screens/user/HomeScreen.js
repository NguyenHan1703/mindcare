// src/screens/user/HomeScreen.js
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Sử dụng icon từ Expo

import { useAuth } from '../../contexts/AuthContext';
import * as ROUTES from '../../constants/routes';
import COLORS from '../../constants/colors';
// Giả định các hàm API này sẽ được tạo trong src/api/conversation.api.js (PD #17.1)
import { getUserConversations, createConversation, deleteConversationApi } from '../../api/conversation.api.js';

// --- Placeholder cho ConversationItem ---
// Component này sẽ được tạo chi tiết hơn ở PD #17.2
// Tạm thời để HomeScreen có thể chạy
const ConversationItemPlaceholder = ({ item, onPress, onDelete }) => (
  <TouchableOpacity style={styles.conversationItem} onPress={() => onPress(item.id, item.title)}>
    <View style={styles.conversationTextContainer}>
      <Text style={styles.conversationTitle}>{item.title || 'Cuộc hội thoại không tên'}</Text>
      <Text style={styles.conversationTime}>
        Cập nhật: {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : 'N/A'}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(item.id, item.title)} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={24} color={COLORS.ERROR} />
    </TouchableOpacity>
  </TouchableOpacity>
);
// --- Hết Placeholder ---


const HomeScreen = () => {
  const navigation = useNavigation();
  const { state: authState, logout } = useAuth(); // Lấy userInfo từ authState
  const { userInfo } = authState;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConvo, setIsCreatingConvo] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserConversations(); // Gọi API
      setConversations(response.data || []); // response.data là mảng ConversationDto
    } catch (err) {
      logger.error("HomeScreen: Lỗi khi tải danh sách hội thoại:", err.response?.data || err.message);
      setError('Không thể tải danh sách hội thoại. Vui lòng thử lại.');
      setConversations([]); // Đặt lại danh sách nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Sử dụng useFocusEffect để tải lại dữ liệu mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      logger.info("HomeScreen focused, fetching conversations...");
      fetchConversations();
      // Hàm cleanup (tùy chọn)
      return () => logger.info("HomeScreen unfocused");
    }, [])
  );

  const handleCreateConversation = async () => {
    setIsCreatingConvo(true);
    setError(null);
    try {
      // Tiêu đề có thể để trống để service tự tạo, hoặc lấy từ một prompt
      const response = await createConversation(null); // Gọi API, title để null hoặc một giá trị mặc định
      const newConversation = response.data; // response.data là ConversationDto
      if (newConversation && newConversation.id) {
        logger.info("HomeScreen: Cuộc hội thoại mới được tạo:", newConversation.id);
        // Điều hướng đến ChatScreen với conversationId mới và title
        navigation.navigate(ROUTES.CHAT_SCREEN, {
          conversationId: newConversation.id,
          conversationTitle: newConversation.title,
        });
      } else {
        throw new Error("Phản hồi tạo hội thoại không hợp lệ.");
      }
    } catch (err) {
      logger.error("HomeScreen: Lỗi khi tạo hội thoại mới:", err.response?.data || err.message);
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
              await deleteConversationApi(conversationId); // Gọi API
              logger.info("HomeScreen: Đã xóa hội thoại:", conversationId);
              // Tải lại danh sách hội thoại sau khi xóa
              fetchConversations();
            } catch (err) {
              logger.error("HomeScreen: Lỗi khi xóa hội thoại:", conversationId, err.response?.data || err.message);
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
      <TouchableOpacity onPress={fetchConversations}> {/* Nhấn MindCare để reload */}
        {/* <Image source={require('../assets/images/logo.png')} style={styles.logo} /> Thay bằng logo của bạn */}
        <Text style={styles.headerTitle}>MindCare</Text>
      </TouchableOpacity>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={handleCreateConversation} style={styles.addButton} disabled={isCreatingConvo}>
          {isCreatingConvo ? <ActivityIndicator color={COLORS.PRIMARY} size="small" /> : <Ionicons name="add-circle-outline" size={30} color={COLORS.PRIMARY} />}
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE_SCREEN)} style={styles.profileButton}>
          {userInfo?.avatarUrl ? (
            <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={32} color={COLORS.TEXT_PRIMARY} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && conversations.length === 0) { // Chỉ hiển thị loading toàn màn hình khi chưa có data
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
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchConversations} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading && conversations.length === 0 && !error && (
        <View style={styles.centeredMessageContainer}>
          <MaterialIcons name="chat-bubble-outline" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyMessage}>Hiện chưa có cuộc hội thoại nào.</Text>
          <Text style={styles.emptySubMessage}>Nhấn "+" để bắt đầu trò chuyện.</Text>
        </View>
      )}
      {conversations.length > 0 && (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <ConversationItemPlaceholder // Sẽ thay bằng ConversationItem.js thật ở PD #17.2
              item={item}
              onPress={handleNavigateToChat}
              onDelete={handleDeleteConversation}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={fetchConversations} // Kéo để refresh
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
    backgroundColor: COLORS.BACKGROUND_SECONDARY, // Hoặc màu header riêng
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  logo: { // Nếu bạn dùng logo ảnh
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginRight: 15,
  },
  addButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    marginLeft: 5,
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
  // Styles cho ConversationItemPlaceholder (tạm thời)
  conversationItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  conversationTextContainer: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  conversationTime: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  }
});

// Thêm Logger (nếu chưa có ở đầu file hoặc dùng chung)
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.log('[DEBUG]', ...args),
};


export default HomeScreen;