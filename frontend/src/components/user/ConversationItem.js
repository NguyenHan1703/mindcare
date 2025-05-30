import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'

const ConversationItem = ({ id, title, updatedAt, onPress, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)

  const handleItemPress = () => {
    if (onPress) {
      onPress(id, title)
    }
  }

  const handleDeletePress = () => {
    if (onDelete) {
      onDelete(id, title)
    }
  }

  const handleEditPress = () => {
    setIsEditing(true)
  }

  const handleTitleChange = (text) => {
    setNewTitle(text)
  }

  const handleTitleBlur = () => {
    if (newTitle.trim() !== '' && newTitle !== title) {
      onUpdate(id, newTitle) // Gọi hàm để cập nhật tiêu đề
    }
    setIsEditing(false)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleItemPress} activeOpacity={0.7}>
      <View style={styles.textContainer}>
        {isEditing ? (
          <TextInput
            style={[styles.title, styles.editingTitle]}
            value={newTitle}
            onChangeText={handleTitleChange}
            onBlur={handleTitleBlur}
            autoFocus={true}
          />
        ) : (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title || 'Cuộc hội thoại không tên'}
          </Text>
        )}
        <Text style={styles.updatedAt} numberOfLines={1} ellipsizeMode="tail">
          Cập nhật: {updatedAt || 'Không rõ'}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        {/* Icon Đổi tên */}
        <TouchableOpacity onPress={handleEditPress} style={styles.iconButton}>
          <Ionicons name="create-outline" size={22} color={COLORS.PRIMARY} />
        </TouchableOpacity>

        {/* Icon Xóa */}
        <TouchableOpacity onPress={handleDeletePress} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={22} color={COLORS.ERROR} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 6,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  updatedAt: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  editingTitle: {
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
})

export default ConversationItem
