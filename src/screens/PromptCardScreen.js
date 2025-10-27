import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCamera } from '../context/CameraProvider';
import { useProgress } from '../context/ProgressProvider';

const { width } = Dimensions.get('window');

export default function PromptCardScreen({ navigation, route }) {
  const { activateCamera } = useCamera();
  const { addRecording } = useProgress();
  
  const { prompt } = route.params || {};
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [promptIdeas, setPromptIdeas] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    generatePromptIdeas();
  }, [currentPrompt]);

  const generatePromptIdeas = () => {
    if (!currentPrompt) return;

    const ideas = [
      {
        id: '1',
        title: 'Personal Story',
        description: `Share a personal experience related to "${currentPrompt?.text}"`,
        icon: 'person',
        color: '#FF0050',
      },
      {
        id: '2',
        title: 'Quick Tip',
        description: `Give a 30-second tip about "${currentPrompt?.text}"`,
        icon: 'bulb',
        color: '#FF4081',
      },
      {
        id: '3',
        title: 'Behind the Scenes',
        description: `Show your process or routine with "${currentPrompt?.text}"`,
        icon: 'eye',
        color: '#FF6B9D',
      },
      {
        id: '4',
        title: 'Question & Answer',
        description: `Answer a common question about "${currentPrompt?.text}"`,
        icon: 'help-circle',
        color: '#FF8A80',
      },
      {
        id: '5',
        title: 'Day in the Life',
        description: `Show how "${currentPrompt?.text}" fits into your day`,
        icon: 'calendar',
        color: '#FFAB91',
      },
      {
        id: '6',
        title: 'Motivational Moment',
        description: `Inspire others with your thoughts on "${currentPrompt?.text}"`,
        icon: 'heart',
        color: '#FFCDD2',
      },
    ];

    setPromptIdeas(ideas);
  };

  const handleStartRecording = async (idea) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      
      await activateCamera('prompt_idea');
      navigation.navigate('Camera', { 
        prompt: currentPrompt,
        idea: idea,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    } finally {
      setIsRecording(false);
    }
  };

  const handleQuickRecord = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await activateCamera('quick_prompt');
      navigation.navigate('Camera', { prompt: currentPrompt });
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const renderPromptIdea = (idea) => (
    <TouchableOpacity
      key={idea.id}
      style={styles.ideaCard}
      onPress={() => handleStartRecording(idea)}
      disabled={isRecording}
    >
      <LinearGradient
        colors={[idea.color, idea.color + '80']}
        style={styles.ideaGradient}
      >
        <View style={styles.ideaContent}>
          <Ionicons name={idea.icon} size={24} color="white" />
          <Text style={styles.ideaTitle}>{idea.title}</Text>
          <Text style={styles.ideaDescription}>{idea.description}</Text>
        </View>
        <View style={styles.ideaAction}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={handleQuickRecord}
        disabled={isRecording}
      >
        <LinearGradient
          colors={['#FF0050', '#FF4081']}
          style={styles.quickActionGradient}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.quickActionText}>Quick Record</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.secondaryButton}>
          <Ionicons name="arrow-back" size={24} color="#FF0050" />
          <Text style={styles.secondaryButtonText}>Back</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (!currentPrompt) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF0050" />
          <Text style={styles.errorTitle}>No Prompt Selected</Text>
          <Text style={styles.errorDescription}>
            Please select a buzzword from the home screen to get started.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#FF0050', '#FF4081']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Recording Prompt</Text>
        <Text style={styles.headerSubtitle}>Let's create something amazing!</Text>
      </LinearGradient>

      {/* Prompt Display */}
      <View style={styles.promptContainer}>
        <View style={styles.promptCard}>
          <Text style={styles.promptCategory}>{currentPrompt.category}</Text>
          <Text style={styles.promptText}>"{currentPrompt.text}"</Text>
          <Text style={styles.promptHint}>
            Use this as inspiration for your recording
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Prompt Ideas */}
      <View style={styles.ideasSection}>
        <Text style={styles.sectionTitle}>Recording Ideas</Text>
        <Text style={styles.sectionDescription}>
          Choose a format that resonates with you
        </Text>
        
        <View style={styles.ideasGrid}>
          {promptIdeas.map(renderPromptIdea)}
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Recording Tips</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color="#FF0050" />
          <Text style={styles.tipText}>
            Keep it authentic - speak from your heart about this topic
          </Text>
        </View>
        
        <View style={styles.tipCard}>
          <Ionicons name="time" size={20} color="#FF0050" />
          <Text style={styles.tipText}>
            Aim for 30-60 seconds - perfect for TikTok format
          </Text>
        </View>
        
        <View style={styles.tipCard}>
          <Ionicons name="eye" size={20} color="#FF0050" />
          <Text style={styles.tipText}>
            Look at the camera, not the screen - it creates better connection
          </Text>
        </View>
        
        <View style={styles.tipCard}>
          <Ionicons name="happy" size={20} color="#FF0050" />
          <Text style={styles.tipText}>
            Don't worry about perfection - authenticity beats polish
          </Text>
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
  promptContainer: {
    paddingHorizontal: 20,
    marginTop: -15,
  },
  promptCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  promptCategory: {
    fontSize: 12,
    color: '#FF0050',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 10,
  },
  promptText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  promptHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF0050',
  },
  secondaryButtonText: {
    color: '#FF0050',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  ideasSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  ideasGrid: {
    gap: 15,
  },
  ideaCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  ideaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  ideaContent: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 5,
  },
  ideaDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  ideaAction: {
    marginLeft: 15,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
    flex: 1,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorButton: {
    backgroundColor: '#FF0050',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
