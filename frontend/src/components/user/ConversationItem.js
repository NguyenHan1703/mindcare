import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng icon từ Expo
import COLORS from '../../constants/colors'; // Import màu sắc

const ConversationItem = ({ id, title, updatedAt, onPress, onDelete }) => {
  const handleItemPress = () => {
    if (onPress) {
      onPress(id, title); // Gọi hàm onPress với id và title
    }
  };

  const handleDeletePress = () => {
    if (onDelete) {
      onDelete(id, title); // Gọi hàm onDelete với id và title
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleItemPress} activeOpacity={0.7}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title || 'Cuộc hội thoại không tên'}
        </Text>
        <Text style={styles.updatedAt} numberOfLines={1} ellipsizeMode="tail">
          Cập nhật: {updatedAt || 'Không rõ'}
        </Text>
      </View>
      <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton} activeOpacity={0.6}>
        <Ionicons name="trash-outline" size={24} color={COLORS.ERROR} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY, // Màu nền cho item
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 6,      // Khoảng cách giữa các item
    marginHorizontal: 15,   // Khoảng cách với lề màn hình
    borderRadius: 10,       // Bo góc
    borderWidth: 1,
    borderColor: COLORS.BORDER, // Viền nhẹ
    // Thêm hiệu ứng đổ bóng nhẹ nếu muốn (tùy thuộc vào Platform)
    // shadowColor: COLORS.BLACK,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 3, // Cho Android
  },
  textContainer: {
    flex: 1, // Cho phép text co giãn và chiếm phần lớn không gian
    marginRight: 10, // Khoảng cách với nút xóa
  },
  title: {
    fontSize: 17,
    fontWeight: '600', // Semi-bold
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  updatedAt: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  deleteButton: {
    padding: 8, // Tăng vùng chạm cho nút xóa
    marginLeft: 10,
  },
});

export default ConversationItem;