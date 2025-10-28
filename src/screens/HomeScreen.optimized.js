// Optimized HomeScreen using new shared components
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import optimized contexts
import { useContextData } from '../context/OptimizedContextProvider';
import { useCamera } from '../context/OptimizedCameraProvider';
import { useProgress } from '../context/OptimizedProgressProvider';

// Import shared components
import { Card, Button, StatCard, Header, AchievementCard, PromptCard as SharedPromptCard } from '../components';

// Import utilities
import { COLORS, SPACING, DEFAULT_PROMPTS } from '../utils/constants';
import * as Storage from '../utils/storage';

const { width } = Dimensions.get('window');

export default function HomeScreenOptimized({ navigation }) {
  const { location, triggerEvents, sendContextualNudge, loading: contextLoading } = useContextData();
  const { activateCamera, autoActivation, loading: cameraLoading } = useCamera();
  const { 
    currentStreak, 
    totalRecordings, 
    getTodayProgress, 
    getStreakMotivation,
    achievements,
    loading: progressLoading 
  } = useProgress();

  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [isActivating, setIsActivating] = useState(false);

  const loading = contextLoading || cameraLoading || progressLoading;

  useEffect(() => {
    loadUserPrompts();
  }, []);

  const loadUserPrompts = async () => {
    try {
      const userBuzzwords = await Storage.getItem(Storage.STORAGE_KEYS.USER_BUZZWORDS, []);
      if (userBuzzwords.length > 0) {
        setPrompts([...DEFAULT_PROMPTS, ...userBuzzwords]);
      }
    } catch (error) {
      console.error('Failed to load user prompts:', error);
    }
  };

  const handleQuickRecord = async () => {
    try {
      setIsActivating(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (autoActivation) {
        await activateCamera('quick_record');
      }
      navigation.navigate('Camera');
    } catch (error) {
      Alert.alert('Error', 'Failed to activate camera');
    } finally {
      setIsActivating(false);
    }
  };

  const handlePromptPress = async (prompt) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PromptCard', { prompt });
  };

  const todayProgress = getTodayProgress();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Ionicons name="flame" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalRecordings}</Text>
            <Text style={styles.statLabel}>Total Videos</Text>
            <Ionicons name="videocam" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayProgress.recordings}/{todayProgress.goal}</Text>
            <Text style={styles.statLabel}>Today's Goal</Text>
            <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
        
        <Text style={styles.motivationText}>{getStreakMotivation()}</Text>
      </LinearGradient>

      {/* Quick Record Button */}
      <View style={styles.quickRecordContainer}>
        <Button
          title={isActivating ? 'Activating...' : 'Quick Record'}
          icon="camera"
          size="lg"
          gradient
          fullWidth
          onPress={handleQuickRecord}
          loading={isActivating}
          disabled={isActivating}
        />
      </View>

      {/* Today's Progress Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.progressTitle}>Daily Goal Progress</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min((todayProgress.recordings / todayProgress.goal) * 100, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {todayProgress.recordings} of {todayProgress.goal} recordings
            </Text>
          </View>
          {todayProgress.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.completedText}>Goal Completed! 🎉</Text>
            </View>
          )}
        </Card>
      </View>

      {/* Micro Prompts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Buzzwords</Text>
          <Button
            title="Add"
            icon="add"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <Text style={styles.sectionSubtitle}>Tap to spark creativity</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.promptsScroll}
          contentContainerStyle={styles.promptsContent}
        >
          {prompts.map((prompt) => (
            <SharedPromptCard
              key={prompt.id}
              prompt={prompt}
              onPress={() => handlePromptPress(prompt)}
              compact
            />
          ))}
        </ScrollView>
      </View>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <Button
              title="View All"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('Progress')}
            />
          </View>
          {achievements.slice(-3).reverse().map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              style={styles.achievementCard}
            />
          ))}
        </View>
      )}

      {/* Contextual Triggers */}
      {triggerEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contextual Insights</Text>
          {triggerEvents.slice(-3).reverse().map((event, index) => (
            <Card key={index} style={styles.triggerCard}>
              <Ionicons 
                name={event.type === 'location_trigger' ? 'location' : 'time'} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.triggerText}>{event.message}</Text>
            </Card>
          ))}
        </View>
      )}

      {/* Location Status */}
      {location && (
        <View style={styles.section}>
          <Card style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-sharp" size={20} color={COLORS.success} />
              <Text style={styles.locationTitle}>Location Active</Text>
            </View>
            <Text style={styles.locationText}>
              We'll notify you when you enter creative zones
            </Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  motivationText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickRecordContainer: {
    padding: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  progressCard: {
    padding: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  progressBarContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  promptsScroll: {
    marginHorizontal: -SPACING.lg,
  },
  promptsContent: {
    paddingHorizontal: SPACING.lg,
  },
  achievementCard: {
    marginBottom: SPACING.sm,
  },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  triggerText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  locationCard: {
    padding: SPACING.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});

