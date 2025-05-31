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
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

import { useAuth } from '../../contexts/AuthContext'
import * as ROUTES from '../../constants/routes'
import COLORS from '../../constants/colors'
import { getAllUsersApi, deleteUserApi } from '../../api/admin.api.js'
import AdminUserListItem from '../../components/admin/AdminUserListItem' // ✨ IMPORT COMPONENT THẬT ✨

// Logger đơn giản
const logger = {
  info: (...args) => console.log('AdminDashboard [INFO]', ...args),
  warn: (...args) => console.warn('AdminDashboard [WARN]', ...args),
  error: (...args) => console.error('AdminDashboard [ERROR]', ...args),
}

const AdminDashboardScreen = () => {
  const navigation = useNavigation()
  const { state: authState, logout } = useAuth()
  const adminInfo = authState.userInfo

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isUserActionMenuVisible, setIsUserActionMenuVisible] = useState(false)
  const [selectedUserForMenu, setSelectedUserForMenu] = useState(null)

  const [isAdminProfileMenuVisible, setIsAdminProfileMenuVisible] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getAllUsersApi()
      setUsers(response.data || [])
    } catch (err) {
      logger.error('AdminDashboard: Lỗi khi tải danh sách người dùng:', err.response?.data?.message || err.message)
      setError('Không thể tải danh sách người dùng.')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      logger.info('AdminDashboard focused, fetching users...')
      fetchUsers()
      return () => logger.info('AdminDashboard unfocused')
    }, [])
  )

  const handleAddUser = () => {
    navigation.navigate(ROUTES.ADMIN_ADD_USER_SCREEN)
  }

  const handleOpenUserOptionsMenu = (user) => {
    setSelectedUserForMenu(user)
    setIsUserActionMenuVisible(true)
  }

  const closeUserOptionsMenu = () => {
    setIsUserActionMenuVisible(false)
    setSelectedUserForMenu(null)
  }

  const handleEditUser = () => {
    if (!selectedUserForMenu) return
    navigation.navigate(ROUTES.ADMIN_EDIT_USER_SCREEN, { userId: selectedUserForMenu.id, username: selectedUserForMenu.username })
    closeUserOptionsMenu()
  }

  const handleDeleteUser = () => {
    if (!selectedUserForMenu) return
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa người dùng "${selectedUserForMenu.username}"? Tất cả dữ liệu liên quan (hội thoại, cảm xúc) cũng sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel', onPress: closeUserOptionsMenu },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserApi(selectedUserForMenu.id)
              logger.info('AdminDashboard: Đã xóa người dùng:', selectedUserForMenu.id)
              fetchUsers() // Tải lại danh sách
            } catch (err) {
              logger.error('AdminDashboard: Lỗi khi xóa người dùng:', selectedUserForMenu.id, err.response?.data?.message || err.message)
              Alert.alert('Lỗi', `Không thể xóa người dùng này: ${err.response?.data?.message || err.message}`)
            } finally {
              closeUserOptionsMenu()
            }
          },
        },
      ]
    )
  }

  const handleViewUserConversations = () => {
    if (!selectedUserForMenu) return
    navigation.navigate(ROUTES.ADMIN_USER_CONVERSATION_LIST_SCREEN, {
      targetUserId: selectedUserForMenu.id,
      targetUsername: selectedUserForMenu.username,
    })
    closeUserOptionsMenu()
  }

  const handleViewUserEmotionStats = () => {
    if (!selectedUserForMenu) return
    navigation.navigate(ROUTES.ADMIN_USER_EMOTION_STATS_SCREEN, {
      targetUserId: selectedUserForMenu.id,
      targetUsername: selectedUserForMenu.username,
    })
    closeUserOptionsMenu()
  }

  const renderUserActionMenu = () => (
    <Modal
      transparent={true}
      visible={isUserActionMenuVisible}
      onRequestClose={closeUserOptionsMenu}
      animationType="fade"
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={closeUserOptionsMenu}>
        <View style={styles.menuModalContainer}>
          <Text style={styles.menuTitle}>Tùy chọn cho: {selectedUserForMenu?.username}</Text>
          <TouchableOpacity style={styles.menuModalItem} onPress={handleEditUser}>
            <Ionicons name="create-outline" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.menuModalText}>Sửa thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuModalItem} onPress={handleViewUserConversations}>
            <Ionicons name="chatbubbles-outline" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.menuModalText}>Xem Lịch sử Hội thoại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuModalItem} onPress={handleViewUserEmotionStats}>
            <Ionicons name="stats-chart-outline" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.menuModalText}>Xem Thống kê Cảm xúc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuModalItem, styles.deleteMenuItem]} onPress={handleDeleteUser}>
            <Ionicons name="trash-outline" size={22} color={COLORS.ERROR} />
            <Text style={[styles.menuModalText, { color: COLORS.ERROR }]}>Xóa người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuModalItem, styles.cancelMenuItem]} onPress={closeUserOptionsMenu}>
            <Text style={styles.menuModalText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
  
  const renderAdminProfileMenu = () => (
  <Modal
    transparent={true}
    visible={isAdminProfileMenuVisible}
    onRequestClose={() => setIsAdminProfileMenuVisible(false)}
    animationType="fade"
  >
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsAdminProfileMenuVisible(false)}>
      <View style={[styles.menuModalContainer, users.length === 1 && styles.singleOptionModal]}>
        <Text style={styles.menuTitle}>{adminInfo?.username}</Text>
        <TouchableOpacity style={[styles.menuModalItem, styles.deleteMenuItem]} onPress={() => {
          setIsAdminProfileMenuVisible(false)
          logout()
        }}>
          <MaterialCommunityIcons name="logout" size={22} color={COLORS.ERROR} />
          <Text style={[styles.menuModalText, { color: COLORS.ERROR }]}>Đăng xuất</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuModalItem, styles.cancelMenuItem]} onPress={() => setIsAdminProfileMenuVisible(false)}>
          <Text style={styles.menuModalText}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
  )

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>MindCare Admin</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={handleAddUser} style={styles.headerButton}>
          <Ionicons name="person-add-outline" size={26} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsAdminProfileMenuVisible(true)} style={styles.headerButton}>
          {adminInfo?.avatarUrl ? (
            <Image source={{ uri: adminInfo.avatarUrl }} style={styles.adminAvatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={30} color={COLORS.TEXT_PRIMARY} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderUserItem = ({ item }) => (
    <AdminUserListItem 
      user={item}
      onOpenOptions={handleOpenUserOptionsMenu}
    />
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {renderUserActionMenu()}
      {renderAdminProfileMenu()}

      {isLoading ? (
        <View style={styles.centeredMessageContainer}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
      ) : error ? (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchUsers} style={styles.retryButton}><Text style={styles.retryButtonText}>Thử lại</Text></TouchableOpacity>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centeredMessageContainer}>
          <MaterialIcons name="people-outline" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyMessage}>Chưa có người dùng nào trong hệ thống.</Text>
           <TouchableOpacity onPress={handleAddUser} style={styles.inlineAddButton}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.inlineAddButtonText}>Thêm người dùng mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem} 
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={fetchUsers}
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
  singleOptionModal: {
    height: 150, // Giảm chiều cao modal khi chỉ có một tùy chọn
    justifyContent: 'center', // Canh giữa nội dung trong modal
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 10,
  },
  adminAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
   retryButton: {
    marginTop:15,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end',
  },
  menuModalContainer: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingTop: 15, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding cho an toàn khu vực dưới cùng
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: 200, // Đảm bảo modal vẫn có chiều cao tối thiểu khi có nhiều tùy chọn
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  menuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // Tăng padding cho dễ nhấn
    paddingHorizontal: 20,
    // borderTopWidth: 1, // Bỏ viền trên ở đây, sẽ thêm điều kiện sau
    // borderTopColor: COLORS.BORDER_LIGHT || '#444',
  },
  // Thêm style cho đường kẻ phân cách, trừ item đầu tiên
  menuModalItemNotFirst: {
     borderTopWidth: StyleSheet.hairlineWidth, // Đường kẻ mảnh
     borderTopColor: COLORS.BORDER,
  },
  menuModalText: {
    fontSize: 17,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 15,
  },
  deleteMenuItem: {
    // Không cần style riêng nếu chỉ thay đổi màu text
  },
  cancelMenuItem: {
    marginTop: 10, 
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.BORDER,
  },
  // Nút thêm user khi danh sách rỗng
  inlineAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    // backgroundColor: COLORS.PRIMARY,
    // borderRadius: 5,
  },
  inlineAddButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  }
})

export default AdminDashboardScreen