import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContextData } from '../context/ContextProvider';
import { useCamera } from '../context/CameraProvider';
import { useProgress } from '../context/ProgressProvider';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { location, triggerEvents, sendContextualNudge } = useContextData();
  const { activateCamera, autoActivation } = useCamera();
  const { 
    currentStreak, 
    totalRecordings, 
    getTodayProgress, 
    getStreakMotivation,
    achievements 
  } = useProgress();

  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMicroPrompts();
    checkForTriggers();
  }, []);

  const loadMicroPrompts = async () => {
    // Load user's saved buzzwords/prompts
    const savedPrompts = [
      { id: '1', text: 'discipline', category: 'motivation' },
      { id: '2', text: 'building consistency', category: 'growth' },
      { id: '3', text: 'post-midterm burnout', category: 'personal' },
      { id: '4', text: 'gym progress', category: 'fitness' },
      { id: '5', text: 'creative flow', category: 'inspiration' },
    ];
    setPrompts(savedPrompts);
  };

  const checkForTriggers = () => {
    // Check if we should trigger a contextual nudge
    const lastRecording = getTodayProgress();
    const hoursSinceLastRecording = lastRecording.recordings > 0 ? 2 : 0; // Mock calculation
    
    if (hoursSinceLastRecording > 3) {
      sendContextualNudge("You've been quiet for a while — ready for a quick thought drop?");
    }
  };

  const handleQuickRecord = async () => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (autoActivation) {
        await activateCamera('quick_record');
        navigation.navigate('Camera');
      } else {
        navigation.navigate('Camera');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to activate camera');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptPress = async (prompt) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PromptCard', { prompt });
  };

  const renderPromptCard = (prompt) => (
    <TouchableOpacity
      key={prompt.id}
      style={styles.promptCard}
      onPress={() => handlePromptPress(prompt)}
    >
      <Text style={styles.promptText}>{prompt.text}</Text>
      <Text style={styles.promptCategory}>{prompt.category}</Text>
    </TouchableOpacity>
  );

  const renderAchievement = (achievement) => (
    <View key={achievement.id} style={styles.achievementCard}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementText}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
    </View>
  );

  const todayProgress = getTodayProgress();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with streak and stats */}
      <LinearGradient
        colors={['#FF0050', '#FF4081']}
        style={styles.header}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalRecordings}</Text>
            <Text style={styles.statLabel}>Total Videos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayProgress.recordings}/{todayProgress.goal}</Text>
            <Text style={styles.statLabel}>Today's Goal</Text>
          </View>
        </View>
        
        <Text style={styles.motivationText}>{getStreakMotivation()}</Text>
      </LinearGradient>

      {/* Quick Record Button */}
      <View style={styles.quickRecordContainer}>
        <TouchableOpacity
          style={[styles.quickRecordButton, isLoading && styles.quickRecordButtonDisabled]}
          onPress={handleQuickRecord}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#FF0050', '#FF4081']}
            style={styles.quickRecordGradient}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text style={styles.quickRecordText}>
              {isLoading ? 'Activating...' : 'Quick Record'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Micro Prompts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Buzzwords</Text>
        <Text style={styles.sectionSubtitle}>Tap to spark creativity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
          {prompts.map(renderPromptCard)}
        </ScrollView>
      </View>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {achievements.slice(-3).map(renderAchievement)}
        </View>
      )}

      {/* Contextual Triggers */}
      {triggerEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contextual Insights</Text>
          {triggerEvents.slice(-3).map((event, index) => (
            <View key={index} style={styles.triggerCard}>
              <Ionicons name="location" size={20} color="#FF0050" />
              <Text style={styles.triggerText}>{event.message}</Text>
            </View>
          ))}
        </View>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  quickRecordContainer: {
    padding: 20,
  },
  quickRecordButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickRecordButtonDisabled: {
    opacity: 0.6,
  },
  quickRecordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  quickRecordText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  promptsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  promptCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  promptCategory: {
    fontSize: 12,
    color: '#FF0050',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
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
  achievementText: {
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
  },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  triggerText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});
