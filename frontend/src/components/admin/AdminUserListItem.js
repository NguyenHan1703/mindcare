import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'

const AdminUserListItem = ({ user, onOpenOptions }) => {
  if (!user) {
    return null // Không render gì nếu không có user data
  }

  const handleOptionsPress = () => {
    if (onOpenOptions) {
      onOpenOptions(user)
    }
  }

  // Format roles để hiển thị (loại bỏ tiền tố "ROLE_")
  const formattedRoles = user.roles ? Array.from(user.roles).map(role => role.replace(/^ROLE_/, '')).join(', ') : 'N/A'

  return (
    <View style={styles.container}>
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person-outline" size={24} color={COLORS.TEXT_SECONDARY} />
        </View>
      )}
      <View style={styles.userInfoContainer}>
        <Text style={styles.usernameText} numberOfLines={1} ellipsizeMode="tail">
          {user.username || 'Không có tên'}
        </Text>
        <Text style={styles.roleText} numberOfLines={1} ellipsizeMode="tail">
          Vai trò: {formattedRoles}
        </Text>
        {/* Bạn có thể thêm các thông tin khác như email, ngày tạo nếu cần */}
        {/* <Text style={styles.emailText}>{user.email || 'Không có email'}</Text> */}
      </View>
      <TouchableOpacity onPress={handleOptionsPress} style={styles.optionsButton} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={24} color={COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    // elevation: 2, // Cho Android
    // shadowColor: COLORS.BLACK, // Cho iOS
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24, // Bo tròn avatar
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.INPUT_BACKGROUND, // Hoặc một màu nền khác
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfoContainer: {
    flex: 1, // Cho phép text co giãn
  },
  usernameText: {
    fontSize: 17,
    fontWeight: '600', // Semi-bold
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 3,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  // emailText: { // Nếu bạn hiển thị email
  //   fontSize: 13,
  //   color: COLORS.TEXT_TERTIARY || COLORS.GRAY_MEDIUM, // Bạn có thể cần định nghĩa TEXT_TERTIARY
  //   marginTop: 2,
  // },
  optionsButton: {
    paddingLeft: 10, // Tăng vùng chạm cho nút options
    paddingVertical: 8,
  },
})

export default AdminUserListItem