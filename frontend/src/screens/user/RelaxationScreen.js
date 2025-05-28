import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  AppState,
  ActivityIndicator,
} from 'react-native'
import { Audio } from 'expo-av'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'

import COLORS from '../../constants/colors'
import THEME from '../../constants/theme'
import TRACKS from '../../constants/tracks' 
import TrackListItem from '../../components/user/TrackListItem' 

// Logger đơn giản
const logger = {
  info: (...args) => console.log('RelaxationScreen [INFO]', ...args),
  warn: (...args) => console.warn('RelaxationScreen [WARN]', ...args),
  error: (...args) => console.error('RelaxationScreen [ERROR]', ...args),
}

// Danh sách các hình nền (bạn cần thay thế bằng đường dẫn require thực tế)
const BACKGROUND_IMAGES = [
  require('../../../assets/images/relaxation/nature01.jpg'),
  require('../../../assets/images/relaxation/cat01.jpg'),
  require('../../../assets/images/relaxation/boat01.jpg'),
  // Thêm các hình ảnh khác nếu muốn
]

const RelaxationScreen = () => {
  const navigation = useNavigation()
  const isFocused = useIsFocused()

  const [tracks, setTracks] = useState(TRACKS) 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTrackId, setCurrentTrackId] = useState(null) // ID của bài đang được chọn/phát
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackStatus, setPlaybackStatus] = useState(null)
  const soundObjectRef = useRef(null)
  const [isLoadingSound, setIsLoadingSound] = useState(false)
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(BACKGROUND_IMAGES[0])

  // Hàm tải và phát âm thanh
  const loadAndPlaySound = useCallback(async (trackIndexToLoad, autoPlay = true) => {
    logger.info(`Attempting to load track at index: ${trackIndexToLoad}, autoPlay: ${autoPlay}`)
    setIsLoadingSound(true)
    
    // Unload âm thanh cũ nếu có
    if (soundObjectRef.current) {
      try {
        await soundObjectRef.current.unloadAsync()
        logger.info('Previous sound unloaded.')
      } catch (error) {
        logger.error('Error unloading previous sound:', error)
      }
      soundObjectRef.current = null
    }

    if (trackIndexToLoad < 0 || trackIndexToLoad >= tracks.length) {
      logger.warn('Invalid trackIndexToLoad:', trackIndexToLoad)
      setIsLoadingSound(false)
      return
    }

    const track = tracks[trackIndexToLoad]
    if (!track || !track.url) {
        logger.error('Track or track URL is invalid at index:', trackIndexToLoad, track)
        setIsLoadingSound(false)
        // Có thể hiển thị thông báo lỗi cho người dùng
        return
    }

    try {
      const { sound, status } = await Audio.Sound.createAsync(
        track.url,
        { 
          shouldPlay: autoPlay,
          // isLooping: false, // Playlist sẽ tự lặp lại, không cần lặp từng bài
        },
        onPlaybackStatusUpdate // Hàm callback khi trạng thái phát thay đổi
      )
      soundObjectRef.current = sound
      setCurrentTrackIndex(trackIndexToLoad)
      setCurrentTrackId(track.id)
      setIsPlaying(autoPlay)
      setPlaybackStatus(status) // Cập nhật status ban đầu
      logger.info(`Sound loaded for track: ${track.title}, shouldPlay: ${autoPlay}`)
      
      // Thay đổi hình nền khi bài hát thay đổi
      setCurrentBackgroundImage(BACKGROUND_IMAGES[trackIndexToLoad % BACKGROUND_IMAGES.length])

    } catch (error) {
      logger.error(`Error loading sound for track: ${track.title}`, error)
      // Xử lý lỗi tải âm thanh (ví dụ: hiển thị thông báo)
    } finally {
      setIsLoadingSound(false)
    }
  }, [tracks]) // tracks là dependency nếu danh sách có thể thay đổi


  // Callback cập nhật trạng thái phát nhạc
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      // Nếu âm thanh không load được hoặc có lỗi
      if (status.error) {
        logger.error(`Playback Error: ${status.error}`)
        setIsPlaying(false) // Dừng trạng thái phát
        // Có thể thử tải bài tiếp theo hoặc dừng hẳn
      }
    } else {
      setPlaybackStatus(status) // Cập nhật trạng thái playback
      setIsPlaying(status.isPlaying)

      if (status.didJustFinish && !status.isLooping) { // Nếu bài hát vừa kết thúc và không phải đang lặp bài đó
        logger.info(`Track finished: ${tracks[currentTrackIndex]?.title}. Playing next.`)
        handleNextTrack(true) // Tự động phát bài tiếp theo
      }
    }
  }

  // Xử lý Play/Pause cho một track cụ thể (được gọi từ TrackListItem)
  const handlePlayPauseTrack = useCallback(async (trackIdToToggle) => {
    const trackToToggleIndex = tracks.findIndex(t => t.id === trackIdToToggle)
    if (trackToToggleIndex === -1) return

    if (currentTrackId === trackIdToToggle) { // Nếu là bài đang được chọn/phát
      if (soundObjectRef.current) {
        if (isPlaying) {
          await soundObjectRef.current.pauseAsync()
          logger.info(`Paused track: ${tracks[trackToToggleIndex].title}`)
        } else {
          await soundObjectRef.current.playAsync()
          logger.info(`Resumed track: ${tracks[trackToToggleIndex].title}`)
        }
        // isPlaying sẽ tự cập nhật qua onPlaybackStatusUpdate
      } else { // Trường hợp soundObject bị null nhưng currentTrackId vẫn là bài này
        loadAndPlaySound(trackToToggleIndex, true)
      }
    } else { // Nếu chọn một bài hát mới
      loadAndPlaySound(trackToToggleIndex, true)
    }
  }, [currentTrackId, isPlaying, tracks, loadAndPlaySound])
  

  // Xử lý chuyển bài tiếp theo (cho logic lặp lại danh sách)
  const handleNextTrack = (shouldPlay = true) => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length // Quay lại đầu nếu hết danh sách
    loadAndPlaySound(nextIndex, shouldPlay)
  }


  // useEffect để tải bài hát đầu tiên khi component mount
  useEffect(() => {
    if (tracks.length > 0) {
      loadAndPlaySound(0, false) // Tải bài đầu tiên nhưng không tự động phát
    }
    // Thiết lập chế độ âm thanh cho ứng dụng
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false, // Tạm thời không cho phát nền
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })

    return () => { // Cleanup khi component unmount
      if (soundObjectRef.current) {
        logger.info('RelaxationScreen unmounting, unloading sound.')
        soundObjectRef.current.unloadAsync()
      }
    }
  }, [tracks]) // Chỉ chạy khi tracks thay đổi (thường là 1 lần)


  // Xử lý khi màn hình focus/unfocus (tạm dừng/phát lại nhạc)
  useFocusEffect(
    useCallback(() => {
      // Không tự động phát nhạc khi màn hình focus
      return () => {
        if (soundObjectRef.current && isPlaying) {
          logger.info('RelaxationScreen unfocused, pausing sound.')
          soundObjectRef.current.pauseAsync()
        }
      }
    }, [isPlaying])
  )
  
  // Xử lý khi app vào background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (soundObjectRef.current && isPlaying) {
        if (nextAppState.match(/inactive|background/)) {
          logger.info('App is in background/inactive, pausing sound.')
          soundObjectRef.current.pauseAsync()
        } else if (nextAppState === 'active') {
          logger.info('App is active again, resuming sound.')
          soundObjectRef.current.playAsync()
        }
      }
    })
    return () => {
      subscription?.remove()
    }
  }, [isPlaying]) // Chỉ phụ thuộc isPlaying và soundObjectRef.current đã tồn tại


  const renderTrackItem = ({ item, index }) => (
    <TrackListItem
      track={item}
      isPlayingThisTrack={item.id === currentTrackId && isPlaying}
      onPlayPause={handlePlayPauseTrack}
      currentPositionMillis={item.id === currentTrackId ? playbackStatus?.positionMillis : 0}
      durationMillis={item.id === currentTrackId ? playbackStatus?.durationMillis : 0}
    />
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={currentBackgroundImage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <View style={styles.overlay}> 
          {/* Header đã được đặt title bởi UserNavigator */}
          
          {isLoadingSound && !soundObjectRef.current && ( // Chỉ hiển thị loading khi chưa có sound object nào (lần đầu)
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.WHITE} />
              <Text style={styles.loadingText}>Đang tải âm thanh...</Text>
            </View>
          )}

          <FlatList
            data={tracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: { // Lớp phủ mờ để làm nổi bật UI
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Điều chỉnh độ mờ ở đây
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Padding cho status bar nếu header bị ẩn hoặc transparent
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.SPACING.SMALL,
    color: COLORS.WHITE,
    fontSize: THEME.FONT_SIZES.BODY_1,
  },
  listContainer: {
    paddingTop: THEME.SPACING.MEDIUM, // Khoảng cách từ đầu màn hình đến danh sách
    paddingBottom: THEME.SPACING.LARGE,
  },
  screenTitle: { // Nếu bạn muốn tiêu đề riêng trong màn hình
    fontSize: THEME.FONT_SIZES.H2,
    color: COLORS.WHITE,
    fontWeight: THEME.FONT_WEIGHTS.BOLD,
    textAlign: 'center',
    marginVertical: THEME.SPACING.MEDIUM,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
})

export default RelaxationScreen