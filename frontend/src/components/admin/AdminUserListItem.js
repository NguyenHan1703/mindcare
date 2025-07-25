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
    backgroundColor: COLORS.INPUT_BACKGROUND,
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
  optionsButton: {
    paddingLeft: 10, // Tăng vùng chạm cho nút options
    paddingVertical: 8,
  },
})

export default AdminUserListItem