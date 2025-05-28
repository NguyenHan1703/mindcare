import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import THEME from '../../constants/theme'

const formatTime = (millis) => {
  if (millis === null || millis === undefined || isNaN(millis) || millis <= 0) {
    return '00:00'
  }
  const totalSeconds = Math.floor(millis / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const TrackListItem = ({
  track,
  isPlayingThisTrack,
  onPlayPause,
  currentPositionMillis, // Thời gian hiện tại của bài nhạc (ms)
  durationMillis,      // Tổng thời gian của bài nhạc (ms)
}) => {
  if (!track || !track.id) {
    return null // Không render gì nếu không có track
  }

  const handlePlayPausePress = () => {
    if (onPlayPause) {
      onPlayPause(track.id)
    }
  }

  const displayDuration = durationMillis > 0 ? formatTime(durationMillis) : (track.durationHint || '--:--')
  const currentProgressTime = durationMillis > 0 ? formatTime(currentPositionMillis || 0) : '00:00'
  
  let progressPercent = 0
  if (isPlayingThisTrack && durationMillis > 0 && currentPositionMillis >= 0) {
    progressPercent = (currentPositionMillis / durationMillis) * 100
  }

  return (
    <View style={[styles.container, isPlayingThisTrack && styles.playingContainer]}>
      <View style={styles.trackInfoContainer}>
        <Ionicons name="musical-notes-outline" size={THEME.ICON_SIZES.MEDIUM} color={isPlayingThisTrack ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY} style={styles.trackIcon} />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isPlayingThisTrack && styles.playingTitle]} numberOfLines={1} ellipsizeMode="tail">
            {track.title || 'Không có tiêu đề'}
          </Text>
          {/* Hiển thị thời gian nếu đang phát hoặc có durationHint */}
          {(isPlayingThisTrack && durationMillis > 0) || track.durationHint ? (
             <Text style={styles.durationText}>
                {isPlayingThisTrack && durationMillis > 0 ? `${currentProgressTime} / ${displayDuration}` : displayDuration}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity onPress={handlePlayPausePress} style={styles.playPauseButton} activeOpacity={0.7}>
        <Ionicons
          name={isPlayingThisTrack ? 'pause-circle-outline' : 'play-circle-outline'}
          size={THEME.ICON_SIZES.LARGE + 8} // Icon to hơn chút
          color={isPlayingThisTrack ? COLORS.ACCENT : COLORS.PRIMARY}
        />
      </TouchableOpacity>

      {/* Thanh tiến trình đơn giản */}
      {isPlayingThisTrack && durationMillis > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(100, progressPercent))}%` }]} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    paddingVertical: THEME.SPACING.SMALL,
    paddingHorizontal: THEME.SPACING.MEDIUM,
    marginVertical: THEME.SPACING.X_SMALL / 2,
    marginHorizontal: THEME.SPACING.MEDIUM,
    borderRadius: THEME.BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  playingContainer: {
    borderColor: COLORS.PRIMARY, // Viền nổi bật khi đang phát
    // backgroundColor: COLORS.PRIMARY_MUTED || '#2c2c44e0', // Nền hơi khác khi đang phát
  },
  trackInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.SPACING.X_SMALL, // Khoảng cách với progress bar
  },
  trackIcon: {
    marginRight: THEME.SPACING.SMALL,
  },
  titleContainer: {
    flex: 1, // Cho phép title co giãn
  },
  title: {
    fontSize: THEME.FONT_SIZES.BODY_1,
    fontWeight: THEME.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  playingTitle: {
    color: COLORS.PRIMARY, // Màu title khi đang phát
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
  },
  durationText: {
    fontSize: THEME.FONT_SIZES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  playPauseButton: {
    position: 'absolute', // Đặt nút play/pause chồng lên bên phải
    right: THEME.SPACING.MEDIUM,
    top: '50%', // Căn giữa theo chiều dọc của phần info (trước progress bar)
    transform: [{ translateY: -((THEME.ICON_SIZES.LARGE + 8) / 2) - (THEME.SPACING.X_SMALL / 2)}], // Dịch chuyển lên 1 nửa chiều cao nút và 1 nửa margin
    padding: THEME.SPACING.X_SMALL, // Tăng vùng chạm
  },
  progressBarContainer: {
    height: 6, // Chiều cao thanh progress
    backgroundColor: COLORS.INPUT_BACKGROUND, // Màu nền của thanh progress
    borderRadius: THEME.BORDER_RADIUS.SMALL,
    marginTop: THEME.SPACING.X_SMALL, // Khoảng cách với phần info
    overflow: 'hidden', // Để bo tròn cho progressBar bên trong
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.ACCENT, // Màu của phần đã chạy
    borderRadius: THEME.BORDER_RADIUS.SMALL,
  },
})

export default TrackListItem