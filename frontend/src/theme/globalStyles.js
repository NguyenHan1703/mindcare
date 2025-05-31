import { StyleSheet, Platform } from 'react-native'
import COLORS from '../constants/colors'
import THEME from '../constants/theme'

export const globalStyles = StyleSheet.create({
  // Containers
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContainer: { // Dùng cho contentContainerStyle của ScrollView
    flexGrow: 1,
  },
  screenContainer: { // Container chính cho nội dung màn hình
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    paddingHorizontal: THEME.SPACING.MEDIUM,
    paddingVertical: THEME.SPACING.MEDIUM,
  },
  centeredContainer: { // Căn giữa nội dung (cho loading, empty state)
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  card: { // Style chung cho các "thẻ"
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: THEME.BORDER_RADIUS.MEDIUM,
    padding: THEME.SPACING.MEDIUM,
    marginVertical: THEME.SPACING.X_SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    // Thêm shadow nếu muốn (cần tùy chỉnh cho iOS và Android)
  },

  // Typography 
  textPrimary: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: THEME.FONT_SIZES.BODY_1,
    fontWeight: THEME.FONT_WEIGHTS.REGULAR,
  },
  textSecondary: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: THEME.FONT_SIZES.BODY_2,
    fontWeight: THEME.FONT_WEIGHTS.REGULAR,
  },
  h1: {
    fontSize: THEME.FONT_SIZES.H1,
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: THEME.SPACING.MEDIUM,
  },
  h2: {
    fontSize: THEME.FONT_SIZES.H2,
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: THEME.SPACING.SMALL,
  },
  titleText: { // Tiêu đề của các section nhỏ hơn
    fontSize: THEME.FONT_SIZES.TITLE,
    fontWeight: THEME.FONT_WEIGHTS.SEMI_BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: THEME.SPACING.X_SMALL,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: THEME.FONT_SIZES.BODY_2,
    textAlign: 'center',
    marginVertical: THEME.SPACING.X_SMALL,
  },
  successText: {
    color: COLORS.SUCCESS,
    fontSize: THEME.FONT_SIZES.BODY_2,
    textAlign: 'center',
    marginVertical: THEME.SPACING.X_SMALL,
  },
  linkText: {
    color: COLORS.ACCENT,
    fontSize: THEME.FONT_SIZES.BODY_1,
    fontWeight: THEME.FONT_WEIGHTS.MEDIUM,
  },

  // Form Elements 
  input: {
    width: '100%',
    height: 50, // Hoặc dùng THEME.SPACING.XX_LARGE
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: THEME.BORDER_RADIUS.MEDIUM,
    paddingHorizontal: THEME.SPACING.MEDIUM,
    fontSize: THEME.FONT_SIZES.BODY_1,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: THEME.SPACING.MEDIUM,
  },
  label: {
    fontSize: THEME.FONT_SIZES.BODY_1,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: THEME.SPACING.X_SMALL,
    fontWeight: THEME.FONT_WEIGHTS.MEDIUM,
  },

  // Buttons 
  buttonPrimary: {
    width: '100%',
    height: 50, // Hoặc dùng THEME.SPACING.XX_LARGE
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.BORDER_RADIUS.MEDIUM,
    paddingVertical: THEME.SPACING.SMALL,
  },
  buttonPrimaryText: {
    color: COLORS.WHITE, 
    fontSize: THEME.FONT_SIZES.BODY_1,
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
  },
  buttonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },

  // Utilities
  marginBottomSmall: {
    marginBottom: THEME.SPACING.SMALL,
  },
  marginBottomMedium: {
    marginBottom: THEME.SPACING.MEDIUM,
  },
  // Các utility styles khác
  
  // Header specific styles 
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.SPACING.MEDIUM,
    paddingVertical: THEME.SPACING.SMALL,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    height: Platform.OS === 'ios' ? 90 : 70, // Ví dụ, điều chỉnh cho phù hợp
    paddingTop: Platform.OS === 'ios' ? THEME.SPACING.LARGE : THEME.SPACING.SMALL, // Cho tai thỏ
  },
  headerTitle: {
    fontSize: THEME.FONT_SIZES.TITLE,
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
})
