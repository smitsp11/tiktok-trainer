import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContextData } from '../context/ContextProvider';
import { useCamera } from '../context/CameraProvider';
import { useProgress } from '../context/ProgressProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { 
    location, 
    creativeZones, 
    addCreativeZone, 
    sendContextualNudge,
    notificationPermission 
  } = useContextData();
  
  const { autoActivation, activateCamera } = useCamera();
  const { dailyGoal, updateDailyGoal } = useProgress();

  const [settings, setSettings] = useState({
    autoActivation: true,
    contextualNudges: true,
    hapticFeedback: true,
    soundEffects: true,
    locationTracking: true,
    creativeZoneNotifications: true,
  });

  const [userBuzzwords, setUserBuzzwords] = useState([]);
  const [newBuzzword, setNewBuzzword] = useState('');

  useEffect(() => {
    loadSettings();
    loadBuzzwords();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadBuzzwords = async () => {
    try {
      const buzzwords = await AsyncStorage.getItem('userBuzzwords');
      if (buzzwords) {
        setUserBuzzwords(JSON.parse(buzzwords));
      }
    } catch (error) {
      console.error('Failed to load buzzwords:', error);
    }
  };

  const saveBuzzwords = async (buzzwords) => {
    try {
      await AsyncStorage.setItem('userBuzzwords', JSON.stringify(buzzwords));
      setUserBuzzwords(buzzwords);
    } catch (error) {
      console.error('Failed to save buzzwords:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const addBuzzword = () => {
    if (newBuzzword.trim()) {
      const buzzword = {
        id: Date.now().toString(),
        text: newBuzzword.trim(),
        category: 'custom',
        createdAt: new Date().toISOString(),
      };
      const updatedBuzzwords = [...userBuzzwords, buzzword];
      saveBuzzwords(updatedBuzzwords);
      setNewBuzzword('');
    }
  };

  const removeBuzzword = (id) => {
    const updatedBuzzwords = userBuzzwords.filter(b => b.id !== id);
    saveBuzzwords(updatedBuzzwords);
  };

  const addCurrentLocationAsZone = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const zone = {
        id: Date.now().toString(),
        name: 'Current Location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 100, // 100 meters
        createdAt: new Date().toISOString(),
      };
      
      await addCreativeZone(zone);
      Alert.alert('Success', 'Current location added as creative zone');
    } catch (error) {
      Alert.alert('Error', 'Failed to add creative zone');
    }
  };

  const testNotification = async () => {
    if (!notificationPermission) {
      Alert.alert('Permission Required', 'Please enable notifications in your device settings');
      return;
    }
    
    await sendContextualNudge('This is a test notification from TikTok Trainer!');
    Alert.alert('Test Sent', 'Check your notifications');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your progress, recordings, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (title, description, key, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon} size={20} color="#FF0050" />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => handleSettingChange(key, value)}
        trackColor={{ false: '#e0e0e0', true: '#FF0050' }}
        thumbColor={settings[key] ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#FF0050', '#FF4081']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your TikTok Trainer experience</Text>
      </LinearGradient>

      {/* Camera Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camera & Recording</Text>
        {renderSettingItem(
          'Auto Camera Activation',
          'Automatically open camera when contextual triggers are detected',
          'autoActivation',
          'camera'
        )}
        {renderSettingItem(
          'Haptic Feedback',
          'Vibrate when starting/stopping recordings',
          'hapticFeedback',
          'phone-portrait'
        )}
        {renderSettingItem(
          'Sound Effects',
          'Play sounds for camera actions',
          'soundEffects',
          'volume-high'
        )}
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {renderSettingItem(
          'Contextual Nudges',
          'Receive prompts based on your location and activity',
          'contextualNudges',
          'notifications'
        )}
        {renderSettingItem(
          'Creative Zone Alerts',
          'Get notified when you enter a creative zone',
          'creativeZoneNotifications',
          'location'
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={testNotification}>
          <Ionicons name="send" size={20} color="#FF0050" />
          <Text style={styles.actionButtonText}>Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Zones</Text>
        {renderSettingItem(
          'Location Tracking',
          'Use location to provide contextual prompts',
          'locationTracking',
          'location'
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={addCurrentLocationAsZone}>
          <Ionicons name="add-circle" size={20} color="#FF0050" />
          <Text style={styles.actionButtonText}>Add Current Location as Creative Zone</Text>
        </TouchableOpacity>

        {creativeZones.length > 0 && (
          <View style={styles.zonesList}>
            <Text style={styles.zonesTitle}>Your Creative Zones:</Text>
            {creativeZones.map((zone) => (
              <View key={zone.id} style={styles.zoneItem}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.zoneText}>{zone.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Buzzwords Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Buzzwords</Text>
        <Text style={styles.sectionDescription}>
          Add personal keywords that spark your creativity
        </Text>
        
        <View style={styles.buzzwordInput}>
          <TextInput
            style={styles.buzzwordTextInput}
            placeholder="Add a new buzzword..."
            value={newBuzzword}
            onChangeText={setNewBuzzword}
            onSubmitEditing={addBuzzword}
          />
          <TouchableOpacity style={styles.addButton} onPress={addBuzzword}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.buzzwordsList}>
          {userBuzzwords.map((buzzword) => (
            <View key={buzzword.id} style={styles.buzzwordItem}>
              <Text style={styles.buzzwordText}>{buzzword.text}</Text>
              <TouchableOpacity onPress={() => removeBuzzword(buzzword.id)}>
                <Ionicons name="close-circle" size={20} color="#FF0050" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.01</Text>
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
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FF0050',
    marginLeft: 10,
    fontWeight: '500',
  },
  zonesList: {
    marginTop: 15,
  },
  zonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  zoneText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  buzzwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buzzwordTextInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF0050',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buzzwordsList: {
    marginTop: 10,
  },
  buzzwordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  buzzwordText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
