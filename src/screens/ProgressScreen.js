import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { useProgress } from '../context/ProgressProvider';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const {
    currentStreak,
    longestStreak,
    totalRecordings,
    dailyGoal,
    progressData,
    achievements,
    getTodayProgress,
    getWeeklyProgress,
    updateDailyGoal,
  } = useProgress();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  const todayProgress = getTodayProgress();
  const weeklyProgress = getWeeklyProgress();

  // Prepare chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0], // Will be populated with actual data
        color: (opacity = 1) => `rgba(255, 0, 80, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Populate chart data with weekly progress
  weeklyProgress.forEach((day, index) => {
    if (index < 7) {
      chartData.datasets[0].data[index] = day.recordings;
    }
  });

  const renderAchievement = (achievement) => (
    <View key={achievement.id} style={styles.achievementCard}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        <Text style={styles.achievementDate}>
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderStatCard = (title, value, subtitle, color = '#FF0050') => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <LinearGradient
        colors={['#FF0050', '#FF4081']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Building consistency, one recording at a time</Text>
      </LinearGradient>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard('Current Streak', currentStreak, 'days', '#FF0050')}
        {renderStatCard('Longest Streak', longestStreak, 'days', '#FF4081')}
        {renderStatCard('Total Videos', totalRecordings, 'recordings', '#FF6B9D')}
        {renderStatCard('Today\'s Goal', `${todayProgress.recordings}/${dailyGoal}`, 'completed', '#FF8A80')}
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 0, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF0050',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Calendar View */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.sectionTitle}>Recording Calendar</Text>
          <TouchableOpacity
            style={styles.calendarToggle}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons 
              name={showCalendar ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#FF0050" 
            />
          </TouchableOpacity>
        </View>
        
        {showCalendar && (
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            disableMonthChange={true}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#FF0050',
              selectedDayBackgroundColor: '#FF0050',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF0050',
              dayTextColor: '#333333',
              textDisabledColor: '#d9e1e8',
              dotColor: '#FF0050',
              selectedDotColor: '#ffffff',
              arrowColor: '#FF0050',
              monthTextColor: '#333333',
              indicatorColor: '#FF0050',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF0050' },
              ...progressData.reduce((acc, day) => {
                if (day.completed) {
                  acc[day.date] = { marked: true, dotColor: '#FF0050' };
                }
                return acc;
              }, {}),
            }}
          />
        )}
      </View>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.map(renderAchievement)}
          </ScrollView>
        </View>
      )}

      {/* Goal Settings */}
      <View style={styles.goalContainer}>
        <Text style={styles.sectionTitle}>Daily Goal</Text>
        <Text style={styles.goalDescription}>
          Set how many recordings you want to complete each day
        </Text>
        
        <View style={styles.goalButtons}>
          {[1, 2, 3, 5, 10].map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalButton,
                dailyGoal === goal && styles.goalButtonActive
              ]}
              onPress={() => updateDailyGoal(goal)}
            >
              <Text style={[
                styles.goalButtonText,
                dailyGoal === goal && styles.goalButtonTextActive
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights</Text>
        
        <View style={styles.insightCard}>
          <Ionicons name="trending-up" size={24} color="#FF0050" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Best Recording Time</Text>
            <Text style={styles.insightText}>
              You're most active between 3-4 PM. Keep it up!
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <Ionicons name="location" size={24} color="#FF0050" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Favorite Location</Text>
            <Text style={styles.insightText}>
              You record most often at home. Try exploring new spots!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: -15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 5,
    width: (width - 50) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0050',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartWrapper: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  calendarContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarToggle: {
    padding: 5,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: width * 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  goalContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  goalButtonActive: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  goalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalButtonTextActive: {
    color: 'white',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightContent: {
    flex: 1,
    marginLeft: 15,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
  },
});
