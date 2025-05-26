import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // Cho nút thử lại
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import COLORS from '../../constants/colors';
import * as ROUTES from '../../constants/routes';
import { getUserConversationsForAdminApi } from '../../api/admin.api.js';
import ConversationItem from '../../components/user/ConversationItem'; // Tái sử dụng component này

// Logger đơn giản
const logger = {
  info: (...args) => console.log('AdminUserConversationListScreen [INFO]', ...args),
  warn: (...args) => console.warn('AdminUserConversationListScreen [WARN]', ...args),
  error: (...args) => console.error('AdminUserConversationListScreen [ERROR]', ...args),
};

const AdminUserConversationListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetUserId, targetUsername } = route.params;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đặt tiêu đề động cho header
  useEffect(() => {
    navigation.setOptions({
      title: `Hội thoại của ${targetUsername || 'Người dùng'}`,
    });
  }, [navigation, targetUsername]);

  const fetchUserConversations = useCallback(async (showLoadingIndicator = true) => {
    if (!targetUserId) {
      setError("Không có thông tin người dùng để tải hội thoại.");
      setIsLoading(false);
      return;
    }
    if (showLoadingIndicator) setIsLoading(true);
    setError(null);
    try {
      logger.info(`Workspaceing conversations for targetUserID: ${targetUserId}`);
      const response = await getUserConversationsForAdminApi(targetUserId);
      setConversations(response.data || []);
    } catch (err) {
      logger.error("Lỗi khi tải danh sách hội thoại của người dùng (admin view):", err.response?.data?.message || err.message);
      setError('Không thể tải danh sách hội thoại. Vui lòng thử lại.');
      setConversations([]);
    } finally {
      if (showLoadingIndicator) setIsLoading(false);
    }
  }, [targetUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserConversations();
    }, [fetchUserConversations])
  );

  const handleNavigateToChatView = (conversationId, title) => {
    navigation.navigate(ROUTES.ADMIN_USER_CHAT_VIEW_SCREEN, {
      conversationId,
      conversationTitle: title,
      targetUserId, // Truyền lại để ChatView biết user nào
      targetUsername, // Truyền lại để ChatView có thể hiển thị tên user nếu cần
    });
  };

  const renderConversationItem = ({ item }) => (
    <ConversationItem
      id={item.id}
      title={item.title}
      updatedAt={item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : 'N/A'}
      onPress={handleNavigateToChatView}
      // Không truyền prop 'onDelete' để admin không thể xóa từ màn hình này
      // ConversationItem.js nên được thiết kế để ẩn nút xóa nếu onDelete không được cung cấp
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải danh sách hội thoại...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <MaterialIcons name="error-outline" size={60} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchUserConversations(true)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (conversations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <MaterialIcons name="chat-bubble-outline" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyMessage}>Người dùng này chưa có cuộc hội thoại nào.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={() => fetchUserConversations(false)} // Kéo để refresh không hiện loading toàn màn hình
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  listContainer: {
    paddingVertical: 10,
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
});

export default AdminUserConversationListScreen;