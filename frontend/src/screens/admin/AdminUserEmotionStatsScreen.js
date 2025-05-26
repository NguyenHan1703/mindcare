import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { BarChart } from "react-native-chart-kit";
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons

import COLORS from '../../constants/colors';
import {
    EMOTIONS_LIST,
    getEmotionVisual
} from '../../constants/emotionDefinitions';
import { getUserEmotionStatsForAdminApi } from '../../api/admin.api.js'; // Sử dụng API của admin
import { useNavigation, useRoute } from '@react-navigation/native';

// Cấu hình tiếng Việt cho lịch (nếu chưa làm ở đâu đó global)
if (!LocaleConfig.locales['vi']) {
    LocaleConfig.locales['vi'] = {
        monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
        monthNamesShort: ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'],
        dayNames: ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'],
        dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
        today: 'Hôm nay'
    };
    LocaleConfig.defaultLocale = 'vi';
}

const screenWidth = Dimensions.get("window").width;

// Logger đơn giản
const logger = {
  info: (...args) => console.log('AdminUserEmotionStatsScreen [INFO]', ...args),
  warn: (...args) => console.warn('AdminUserEmotionStatsScreen [WARN]', ...args),
  error: (...args) => console.error('AdminUserEmotionStatsScreen [ERROR]', ...args),
};

const AdminUserEmotionStatsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetUserId, targetUsername } = route.params;

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [emotionSummary, setEmotionSummary] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: `Thống kê: ${targetUsername || 'Người dùng'}`,
    });
  }, [navigation, targetUsername]);

  const fetchStatsForMonth = useCallback(async (dateToFetch) => {
    if (!targetUserId) {
        setError("Không có thông tin người dùng để tải thống kê.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);

    const year = dateToFetch.getFullYear();
    const month = dateToFetch.getMonth() + 1;
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const formatDateForApi = (d) => d.toISOString().split('T')[0];

    logger.info(`Admin fetching emotion stats for UserID: ${targetUserId}, Month: ${year}-${month}`);

    try {
      const response = await getUserEmotionStatsForAdminApi(
        targetUserId,
        formatDateForApi(firstDayOfMonth),
        formatDateForApi(lastDayOfMonth)
      );
      const statsData = response.data;

      const newMarkedDates = {};
      if (statsData && statsData.dailyLogs) {
        statsData.dailyLogs.forEach(log => {
          const visual = getEmotionVisual(log.emotion);
          newMarkedDates[log.logDate] = {
            dots: [{ key: log.emotion, color: visual.color, selectedDotColor: visual.color }],
          };
        });
      }
      setMarkedDates(newMarkedDates);
      setEmotionSummary(statsData?.emotionSummary || {});

    } catch (err) {
      logger.error("Lỗi khi admin tải thống kê cảm xúc:", err.response?.data?.message || err.message);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
      setMarkedDates({});
      setEmotionSummary({});
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchStatsForMonth(currentMonthDate);
  }, [currentMonthDate, fetchStatsForMonth]);

  const onMonthChange = (month) => {
    logger.info("Month changed by admin to:", month.dateString);
    setCurrentMonthDate(new Date(month.timestamp));
  };

  const chartData = useMemo(() => {
    if (!emotionSummary || Object.keys(emotionSummary).length === 0) {
      return null;
    }
    const labels = [];
    const dataValues = [];
    const barColorsFunc = [];

    EMOTIONS_LIST.forEach(emotionDef => {
        if (emotionSummary[emotionDef.value] !== undefined) {
            labels.push(emotionDef.name);
            dataValues.push(emotionSummary[emotionDef.value]);
            barColorsFunc.push((opacity = 1) => emotionDef.color);
        }
    });
    
    if (labels.length === 0) return null;

    return {
      labels: labels,
      datasets: [{ data: dataValues, colors: barColorsFunc }]
    };
  }, [emotionSummary]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <Calendar
            current={currentMonthDate.toISOString().split('T')[0]}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={{
              backgroundColor: COLORS.BACKGROUND_PRIMARY,
              calendarBackground: COLORS.BACKGROUND_PRIMARY,
              textSectionTitleColor: COLORS.TEXT_SECONDARY,
              selectedDayBackgroundColor: COLORS.PRIMARY,
              selectedDayTextColor: COLORS.WHITE,
              todayTextColor: COLORS.ACCENT,
              dayTextColor: COLORS.TEXT_PRIMARY,
              textDisabledColor: COLORS.DISABLED,
              dotColor: COLORS.PRIMARY,
              selectedDotColor: COLORS.WHITE,
              arrowColor: COLORS.PRIMARY,
              monthTextColor: COLORS.TEXT_PRIMARY,
              indicatorColor: COLORS.PRIMARY,
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
            monthFormat={'MMMM, yyyy'}
            firstDay={1}
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
          
          {!isLoading && !error && (
            <View style={styles.legendContainer}>
              <Text style={styles.sectionTitle}>Chú thích:</Text>
              {EMOTIONS_LIST.map(emotionDef => (
                <View key={emotionDef.value} style={styles.legendItem}>
                  <View style={[styles.legendColorDot, {backgroundColor: emotionDef.color}]} />
                  <Text style={styles.legendText}>{emotionDef.name}</Text>
                </View>
              ))}
            </View>
          )}

          {!isLoading && !error && emotionSummary && Object.keys(emotionSummary).length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Tóm tắt tháng này:</Text>
              {EMOTIONS_LIST.map(emotionDef => {
                const count = emotionSummary[emotionDef.value];
                if (count !== undefined && count > 0) {
                  return (
                    <Text key={emotionDef.value} style={[styles.summaryText, { color: getEmotionVisual(emotionDef.value).color || COLORS.TEXT_SECONDARY }]}>
                      {getEmotionVisual(emotionDef.value).name}: {count} lần
                    </Text>
                  );
                }
                return null;
              })}
            </View>
          )}
          
          {!isLoading && !error && chartData && (
             <View style={styles.chartOuterContainer}>
                <Text style={styles.sectionTitle}>Biểu đồ cảm xúc:</Text>
                <BarChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={250}
                    yAxisLabel=""
                    yAxisSuffix=" lần"
                    chartConfig={{
                        backgroundColor: COLORS.BACKGROUND_SECONDARY,
                        backgroundGradientFrom: COLORS.BACKGROUND_SECONDARY,
                        backgroundGradientTo: COLORS.BACKGROUND_SECONDARY,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(200, 200, 220, ${opacity})`,
                        labelColor: (opacity = 1) => COLORS.TEXT_SECONDARY,
                        style: { borderRadius: 12 },
                        barRadius: 5,
                    }}
                    style={styles.chartStyle}
                    verticalLabelRotation={0}
                    fromZero={true}
                    withCustomBarColorFromData={true}
                    flatColor={true}
                    showValuesOnTopOfBars={true}
                    withInnerLines={true}
                />
            </View>
          )}

          {!isLoading && !error && Object.keys(markedDates).length === 0 && Object.keys(emotionSummary).length === 0 && (
            <View style={styles.noDataContainer}>
                <MaterialIcons name="sentiment_dissatisfied" size={60} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.noDataText}>Không có dữ liệu cảm xúc cho {targetUsername} trong tháng này.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles từ StatisticScreen.js 
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
  legendText: {
    fontSize: 15,
    // color: COLORS.TEXT_SECONDARY,
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
    marginBottom: 5,
    lineHeight: 22,
  },
  chartOuterContainer: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 12,
  },
  noDataContainer: { // Style cho thông báo không có dữ liệu
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150, // Đảm bảo nó có chiều cao để hiển thị
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 10,
  }
});

export default AdminUserEmotionStatsScreen;