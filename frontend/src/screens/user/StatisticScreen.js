import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity, // Thêm TouchableOpacity cho nút thử lại
} from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { BarChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons' // Vẫn cần cho icon trong chú thích

import COLORS from '../../constants/colors'
import { 
    EMOTIONS_LIST, // Dùng cho chú thích
    getEmotionVisual // Dùng để lấy thông tin visual của cảm xúc
} from '../../constants/emotionDefinitions'
import { getEmotionStats } from '../../api/emotion.api.js'
// import { useAuth } from '../../contexts/AuthContext'; // Không cần userId nếu API /me

// Cấu hình tiếng Việt cho lịch (nếu chưa làm ở đâu đó global)
if (!LocaleConfig.locales['vi']) {
    LocaleConfig.locales['vi'] = {
        monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
        monthNamesShort: ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'],
        dayNames: ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'],
        dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
        today: 'Hôm nay'
    }
    LocaleConfig.defaultLocale = 'vi'
}


const screenWidth = Dimensions.get('window').width

const StatisticScreen = () => {
  // const { state: authState } = useAuth();
  // const userId = authState.userInfo?.id;

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())
  const [markedDates, setMarkedDates] = useState({})
  const [emotionSummary, setEmotionSummary] = useState({}) // Khởi tạo là object rỗng
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatsForMonth = useCallback(async (dateToFetch) => {
    setIsLoading(true)
    setError(null)
    // setMarkedDates({}); // Không reset ở đây để tránh nhấp nháy khi chuyển tháng nhanh
    // setEmotionSummary({});

    const year = dateToFetch.getFullYear()
    const month = dateToFetch.getMonth() + 1

    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)

    const formatDateForApi = (d) => d.toISOString().split('T')[0]

    logger.info(`Workspaceing stats for month: ${formatDateForApi(firstDayOfMonth)} to ${formatDateForApi(lastDayOfMonth)}`)

    try {
      // API getEmotionStats của bạn đã được thiết kế để lấy cho người dùng hiện tại (qua token)
      const response = await getEmotionStats(formatDateForApi(firstDayOfMonth), formatDateForApi(lastDayOfMonth))
      const statsData = response.data // { dailyLogs: [], emotionSummary: {} }

      const newMarkedDates = {}
      if (statsData && statsData.dailyLogs) {
        logger.debug('Daily logs received:', statsData.dailyLogs.length)
        statsData.dailyLogs.forEach(log => {
          const visual = getEmotionVisual(log.emotion) // Sử dụng hàm helper
          newMarkedDates[log.logDate] = { // logDate từ backend đã là "YYYY-MM-DD"
            dots: [{ key: log.emotion, color: visual.color, selectedDotColor: visual.color }],
            // Hoặc dùng customStyles nếu muốn hiển thị emoji/icon trực tiếp trên lịch (phức tạp hơn)
            // customStyles: {
            //   container: { backgroundColor: visual.colorMuted || visual.color, borderRadius: 16 },
            //   text: { color: visual.textColor || COLORS.WHITE, fontWeight: 'bold', fontSize: 10 },
            // }
          }
        })
      }
      setMarkedDates(newMarkedDates)
      setEmotionSummary(statsData?.emotionSummary || {})

    } catch (err) {
      logger.error('StatisticScreen: Lỗi khi tải thống kê cảm xúc:', err.response?.data?.message || err.message)
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.')
      setMarkedDates({})
      setEmotionSummary({})
    } finally {
      setIsLoading(false)
    }
  }, []) // Dependencies rỗng nếu userId lấy từ token ở backend

  useEffect(() => {
    fetchStatsForMonth(currentMonthDate)
  }, [currentMonthDate, fetchStatsForMonth])

  const onMonthChange = (month) => { // month: {dateString, day, month, year, timestamp}
    logger.info('StatisticScreen: Month changed to:', month.dateString)
    setCurrentMonthDate(new Date(month.timestamp))
  }
  
  const chartData = useMemo(() => {
    if (!emotionSummary || Object.keys(emotionSummary).length === 0) {
      return null
    }
    const labels = []
    const dataValues = []
    const barColorsFunc = []

    // Sắp xếp cảm xúc theo EMOTIONS_LIST để có thứ tự nhất quán trong biểu đồ (nếu muốn)
    EMOTIONS_LIST.forEach(emotionDef => {
        if (emotionSummary[emotionDef.value] !== undefined) {
            labels.push(emotionDef.name) // Tên tiếng Việt
            dataValues.push(emotionSummary[emotionDef.value])
            // react-native-chart-kit yêu cầu mảng các hàm trả về màu với opacity
            barColorsFunc.push((opacity = 1) => emotionDef.color)
        }
    })
    
    // Nếu không có cảm xúc nào trong summary mà có trong EMOTIONS_LIST (ít xảy ra nếu dữ liệu tốt)
    // hoặc nếu bạn muốn hiển thị cả những cảm xúc không có trong tháng (với count = 0),
    // bạn có thể điều chỉnh logic ở trên.
    // Hiện tại, chỉ hiển thị các cảm xúc có trong summary.

    if (labels.length === 0) return null // Không có gì để vẽ

    return {
      labels: labels,
      datasets: [
        {
          data: dataValues,
          colors: barColorsFunc, // Mảng các hàm màu
        }
      ]
    }
  }, [emotionSummary])


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          {/* Tiêu đề "Thống kê cảm xúc" đã được đặt bởi UserNavigator */}
          
          <Calendar
            current={currentMonthDate.toISOString().split('T')[0]}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            markingType={'multi-dot'} // Hiển thị nhiều chấm nếu một ngày có nhiều loại đánh dấu (ở đây chỉ dùng 1)
            theme={{
              backgroundColor: COLORS.BACKGROUND_PRIMARY,
              calendarBackground: COLORS.BACKGROUND_PRIMARY,
              textSectionTitleColor: COLORS.TEXT_SECONDARY,
              selectedDayBackgroundColor: COLORS.PRIMARY,
              selectedDayTextColor: COLORS.WHITE,
              todayTextColor: COLORS.ACCENT,
              dayTextColor: COLORS.TEXT_PRIMARY,
              textDisabledColor: COLORS.DISABLED,
              dotColor: COLORS.PRIMARY, // Màu mặc định cho dot
              selectedDotColor: COLORS.WHITE,
              arrowColor: COLORS.PRIMARY,
              monthTextColor: COLORS.TEXT_PRIMARY,
              indicatorColor: COLORS.PRIMARY,
              textDayFontFamily: 'System', // Sử dụng font hệ thống
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
            monthFormat={'MMMM, yyyy'}
            firstDay={1} // Tuần bắt đầu từ Thứ Hai
            // hideExtraDays={true} // Ẩn các ngày của tháng trước/sau
          />

          {isLoading && <ActivityIndicator size="large" color={COLORS.PRIMARY} style={styles.loader} />}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchStatsForMonth(currentMonthDate)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Phần Chú thích Cảm xúc */}
          {!isLoading && !error && (
            <View style={styles.legendContainer}>
              <Text style={styles.sectionTitle}>Chú thích:</Text>
              {EMOTIONS_LIST.map(emotionDef => ( // Sử dụng EMOTIONS_LIST từ file định nghĩa chung
                <View key={emotionDef.value} style={styles.legendItem}>
                  <View style={[styles.legendColorDot, {backgroundColor: emotionDef.color}]} />
                  {/* Hoặc dùng icon/emoji: <Text style={{fontSize: 18, marginRight: 5}}>{emotionDef.emoji}</Text> */}
                  {/* <Ionicons name={emotionDef.icon} size={20} color={emotionDef.color} style={styles.legendIcon} /> */}
                  <Text style={styles.legendText}>{emotionDef.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Phần Tóm tắt (Text) */}
          {!isLoading && !error && emotionSummary && Object.keys(emotionSummary).length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Tóm tắt tháng này:</Text>
              {EMOTIONS_LIST.map(emotionDef => { // Lặp qua EMOTIONS_LIST để giữ thứ tự
                const count = emotionSummary[emotionDef.value]
                if (count !== undefined && count > 0) {
                  return (
                    <Text key={emotionDef.value} style={[styles.summaryText, { color: getEmotionVisual(emotionDef.value).color || COLORS.TEXT_SECONDARY }]}>
                      {getEmotionVisual(emotionDef.value).name}: {count} lần
                    </Text>
                  )
                }
                return null
              })}
            </View>
          )}
          
          {/* Biểu đồ BarChart (Tùy chọn) */}
          {!isLoading && !error && chartData && (
             <View style={styles.chartOuterContainer}>
                <Text style={styles.sectionTitle}>Biểu đồ cảm xúc:</Text>
                <BarChart
                    data={chartData}
                    width={screenWidth - 40} // width của container trừ padding
                    height={250}
                    yAxisLabel=""
                    yAxisSuffix=" lần"
                    chartConfig={{
                        backgroundColor: COLORS.BACKGROUND_SECONDARY,
                        backgroundGradientFrom: COLORS.BACKGROUND_SECONDARY,
                        backgroundGradientTo: COLORS.BACKGROUND_SECONDARY,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(200, 200, 220, ${opacity})`, // Màu cho lưới và labels trục
                        labelColor: (opacity = 1) => COLORS.TEXT_SECONDARY,
                        style: {
                            borderRadius: 12,
                        },
                        propsForBars: { // Style cho các cột
                           // fillOpacity: 0.8,
                        },
                        barRadius: 5, // Bo tròn nhẹ các cột
                    }}
                    style={styles.chartStyle}
                    verticalLabelRotation={0} // Giữ label ngang
                    fromZero={true}
                    withCustomBarColorFromData={true} // Quan trọng để dùng màu từ dataset.colors
                    flatColor={true} // Sử dụng màu đơn sắc cho mỗi cột từ dataset.colors
                    showValuesOnTopOfBars={true}
                    withInnerLines={true} // Hiển thị đường lưới ngang
                />
            </View>
          )}

          {/* Thông báo nếu không có dữ liệu cho tháng */}
          {!isLoading && !error && Object.keys(markedDates).length === 0 && Object.keys(emotionSummary).length === 0 && (
            <Text style={styles.noDataText}>Không có dữ liệu cảm xúc cho tháng này.</Text>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
  },
  calendar: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
  },
  loader: {
    marginTop: 30,
    marginBottom:20,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom:20,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    marginTop: 10,
  },
  legendContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendIcon: { // Nếu dùng icon thay vì dot
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    // color: COLORS.TEXT_SECONDARY, // Màu được đặt inline
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryText: {
    fontSize: 15,
    // color: COLORS.TEXT_SECONDARY, // Màu được đặt inline
    marginBottom: 5,
    lineHeight: 22,
  },
  chartOuterContainer: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal:0, // BarChart đã có style riêng
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center', // Để BarChart căn giữa nếu width của nó nhỏ hơn
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 12,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 30,
  }
})

const logger = { // Logger đơn giản
  info: (...args) => console.log('StatisticScreen [INFO]', ...args),
  warn: (...args) => console.warn('StatisticScreen [WARN]', ...args),
  error: (...args) => console.error('StatisticScreen [ERROR]', ...args),
  debug: (...args) => console.log('StatisticScreen [DEBUG]', ...args),
}

export default StatisticScreen