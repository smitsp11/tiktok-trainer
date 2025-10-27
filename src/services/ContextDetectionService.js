// Context Detection Service for monitoring user behavior and triggers
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ContextDetectionService {
  constructor() {
    this.isMonitoring = false;
    this.locationWatcher = null;
    this.appStateWatcher = null;
    this.lastKnownLocation = null;
    this.lastAppState = 'active';
    this.triggerThresholds = {
      idleTime: 30 * 60 * 1000, // 30 minutes
      locationRadius: 100, // 100 meters
      recordingGap: 3 * 60 * 60 * 1000, // 3 hours
    };
  }

  // Start monitoring user context
  async startMonitoring() {
    if (this.isMonitoring) return;

    try {
      this.isMonitoring = true;
      
      // Start location monitoring
      await this.startLocationMonitoring();
      
      // Start app state monitoring
      this.startAppStateMonitoring();
      
      // Start periodic context checks
      this.startPeriodicChecks();
      
      console.log('Context monitoring started');
    } catch (error) {
      console.error('Failed to start context monitoring:', error);
      this.isMonitoring = false;
    }
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
    
    if (this.appStateWatcher) {
      this.appStateWatcher.remove();
      this.appStateWatcher = null;
    }
    
    console.log('Context monitoring stopped');
  }

  // Start location monitoring
  async startLocationMonitoring() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({});
      this.lastKnownLocation = location;
      await this.checkLocationTriggers(location);

      // Watch for location changes
      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Check every 30 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        async (location) => {
          this.lastKnownLocation = location;
          await this.checkLocationTriggers(location);
        }
      );
    } catch (error) {
      console.error('Location monitoring failed:', error);
    }
  }

  // Start app state monitoring
  startAppStateMonitoring() {
    // This would integrate with app state changes
    // For now, we'll simulate periodic checks
    this.appStateWatcher = setInterval(() => {
      this.checkAppStateTriggers();
    }, 60000); // Check every minute
  }

  // Start periodic context checks
  startPeriodicChecks() {
    setInterval(async () => {
      if (this.isMonitoring) {
        await this.performContextAnalysis();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Check location-based triggers
  async checkLocationTriggers(location) {
    try {
      const creativeZones = await this.getCreativeZones();
      const userPatterns = await this.getUserPatterns();

      // Check if user is in a creative zone
      const inCreativeZone = creativeZones.some(zone => {
        const distance = this.calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          zone.latitude,
          zone.longitude
        );
        return distance <= zone.radius;
      });

      if (inCreativeZone) {
        await this.triggerContextualNudge({
          type: 'location',
          message: "You're in a creative zone — ready to record?",
          confidence: 0.8,
          location: location.coords,
        });
      }

      // Check for location-based patterns
      const locationKey = `${location.coords.latitude.toFixed(2)},${location.coords.longitude.toFixed(2)}`;
      const locationHistory = userPatterns.frequentLocations || [];
      
      if (locationHistory.includes(locationKey)) {
        await this.triggerContextualNudge({
          type: 'familiar_location',
          message: "You're at a spot where you've recorded before — feeling inspired?",
          confidence: 0.7,
          location: location.coords,
        });
      }

    } catch (error) {
      console.error('Location trigger check failed:', error);
    }
  }

  // Check app state triggers
  async checkAppStateTriggers() {
    try {
      const userPatterns = await this.getUserPatterns();
      const lastRecording = userPatterns.lastRecording;
      
      if (lastRecording) {
        const timeSinceLastRecording = Date.now() - new Date(lastRecording).getTime();
        
        if (timeSinceLastRecording > this.triggerThresholds.recordingGap) {
          await this.triggerContextualNudge({
            type: 'recording_gap',
            message: "It's been a while since your last recording — ready for a quick update?",
            confidence: 0.6,
            timeSinceLastRecording,
          });
        }
      }

      // Check for idle time
      const lastActivity = await this.getLastActivity();
      if (lastActivity) {
        const idleTime = Date.now() - new Date(lastActivity).getTime();
        
        if (idleTime > this.triggerThresholds.idleTime) {
          await this.triggerContextualNudge({
            type: 'idle_time',
            message: "You've been quiet for a while — perfect time for a thought drop!",
            confidence: 0.5,
            idleTime,
          });
        }
      }

    } catch (error) {
      console.error('App state trigger check failed:', error);
    }
  }

  // Perform comprehensive context analysis
  async performContextAnalysis() {
    try {
      const context = await this.gatherContextData();
      const triggers = await this.analyzeContextTriggers(context);
      
      if (triggers.length > 0) {
        // Find the highest confidence trigger
        const bestTrigger = triggers.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        if (bestTrigger.confidence > 0.6) {
          await this.triggerContextualNudge(bestTrigger);
        }
      }
    } catch (error) {
      console.error('Context analysis failed:', error);
    }
  }

  // Gather all context data
  async gatherContextData() {
    const userPatterns = await this.getUserPatterns();
    const creativeZones = await this.getCreativeZones();
    const recentRecordings = await this.getRecentRecordings();
    
    return {
      location: this.lastKnownLocation,
      appState: this.lastAppState,
      userPatterns,
      creativeZones,
      recentRecordings,
      timestamp: new Date().toISOString(),
    };
  }

  // Analyze context for potential triggers
  async analyzeContextTriggers(context) {
    const triggers = [];

    // Time-based triggers
    const currentHour = new Date().getHours();
    const activeHours = context.userPatterns.activeHours || [];
    
    if (activeHours.includes(currentHour)) {
      triggers.push({
        type: 'optimal_time',
        message: `This is typically a productive time for you (${currentHour}:00)`,
        confidence: 0.7,
        hour: currentHour,
      });
    }

    // Location-based triggers
    if (context.location) {
      const inCreativeZone = context.creativeZones.some(zone => {
        const distance = this.calculateDistance(
          context.location.coords.latitude,
          context.location.coords.longitude,
          zone.latitude,
          zone.longitude
        );
        return distance <= zone.radius;
      });

      if (inCreativeZone) {
        triggers.push({
          type: 'creative_zone',
          message: "You're in a creative zone — ready to capture something?",
          confidence: 0.8,
          location: context.location.coords,
        });
      }
    }

    // Recording frequency triggers
    const recordingFrequency = context.userPatterns.recordingFrequency || 0;
    const todayRecordings = context.recentRecordings.filter(recording => {
      const recordingDate = new Date(recording.startTime);
      const today = new Date();
      return recordingDate.toDateString() === today.toDateString();
    }).length;

    if (todayRecordings === 0 && recordingFrequency > 0) {
      triggers.push({
        type: 'daily_goal',
        message: "Haven't recorded today yet — want to keep your streak going?",
        confidence: 0.6,
        todayRecordings,
      });
    }

    return triggers;
  }

  // Trigger contextual nudge
  async triggerContextualNudge(trigger) {
    try {
      // Save trigger event
      await this.saveTriggerEvent(trigger);
      
      // Send notification if enabled
      const settings = await this.getNotificationSettings();
      if (settings.contextualNudges) {
        await this.sendNotification(trigger.message);
      }
      
      // Log trigger for analysis
      console.log('Contextual trigger:', trigger);
      
    } catch (error) {
      console.error('Failed to trigger contextual nudge:', error);
    }
  }

  // Send notification
  async sendNotification(message) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TikTok Trainer',
          body: message,
          data: { type: 'contextual_nudge' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Helper methods
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Data access methods
  async getCreativeZones() {
    try {
      const zones = await AsyncStorage.getItem('creativeZones');
      return zones ? JSON.parse(zones) : [];
    } catch (error) {
      console.error('Failed to get creative zones:', error);
      return [];
    }
  }

  async getUserPatterns() {
    try {
      const patterns = await AsyncStorage.getItem('userPatterns');
      return patterns ? JSON.parse(patterns) : {};
    } catch (error) {
      console.error('Failed to get user patterns:', error);
      return {};
    }
  }

  async getRecentRecordings() {
    try {
      const recordings = await AsyncStorage.getItem('recordingSessions');
      return recordings ? JSON.parse(recordings) : [];
    } catch (error) {
      console.error('Failed to get recent recordings:', error);
      return [];
    }
  }

  async getLastActivity() {
    try {
      const activity = await AsyncStorage.getItem('lastActivity');
      return activity;
    } catch (error) {
      console.error('Failed to get last activity:', error);
      return null;
    }
  }

  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      return settings ? JSON.parse(settings) : { contextualNudges: true };
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return { contextualNudges: true };
    }
  }

  async saveTriggerEvent(trigger) {
    try {
      const events = await AsyncStorage.getItem('triggerEvents') || '[]';
      const parsedEvents = JSON.parse(events);
      parsedEvents.push({
        ...trigger,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 100 events
      const recentEvents = parsedEvents.slice(-100);
      await AsyncStorage.setItem('triggerEvents', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to save trigger event:', error);
    }
  }
}

export default new ContextDetectionService();
