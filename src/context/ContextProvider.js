import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context for managing app state and context detection
const ContextContext = createContext();

// Action types
const ACTIONS = {
  SET_LOCATION: 'SET_LOCATION',
  SET_APP_STATE: 'SET_APP_STATE',
  SET_USER_PATTERNS: 'SET_USER_PATTERNS',
  SET_CREATIVE_ZONES: 'SET_CREATIVE_ZONES',
  ADD_TRIGGER_EVENT: 'ADD_TRIGGER_EVENT',
  SET_NOTIFICATION_PERMISSION: 'SET_NOTIFICATION_PERMISSION',
};

// Initial state
const initialState = {
  location: null,
  appState: 'active',
  userPatterns: {
    frequentLocations: [],
    activeHours: [],
    recordingFrequency: 0,
    lastRecording: null,
  },
  creativeZones: [],
  triggerEvents: [],
  notificationPermission: false,
};

// Reducer
function contextReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOCATION:
      return { ...state, location: action.payload };
    case ACTIONS.SET_APP_STATE:
      return { ...state, appState: action.payload };
    case ACTIONS.SET_USER_PATTERNS:
      return { ...state, userPatterns: { ...state.userPatterns, ...action.payload } };
    case ACTIONS.SET_CREATIVE_ZONES:
      return { ...state, creativeZones: action.payload };
    case ACTIONS.ADD_TRIGGER_EVENT:
      return { 
        ...state, 
        triggerEvents: [...state.triggerEvents, action.payload].slice(-50) // Keep last 50 events
      };
    case ACTIONS.SET_NOTIFICATION_PERMISSION:
      return { ...state, notificationPermission: action.payload };
    default:
      return state;
  }
}

export function ContextProvider({ children }) {
  const [state, dispatch] = useReducer(contextReducer, initialState);

  // Initialize location tracking
  useEffect(() => {
    initializeLocation();
  }, []);

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Load user patterns from storage
  useEffect(() => {
    loadUserPatterns();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        dispatch({ type: ACTIONS.SET_LOCATION, payload: location });
        
        // Start watching location changes
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 30000 },
          (location) => {
            dispatch({ type: ACTIONS.SET_LOCATION, payload: location });
            checkLocationTriggers(location);
          }
        );
      }
    } catch (error) {
      console.error('Location initialization failed:', error);
    }
  };

  const initializeNotifications = async () => {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        dispatch({ type: ACTIONS.SET_NOTIFICATION_PERMISSION, payload: finalStatus === 'granted' });
      }
    } catch (error) {
      console.error('Notification initialization failed:', error);
    }
  };

  const loadUserPatterns = async () => {
    try {
      const patterns = await AsyncStorage.getItem('userPatterns');
      if (patterns) {
        dispatch({ type: ACTIONS.SET_USER_PATTERNS, payload: JSON.parse(patterns) });
      }
    } catch (error) {
      console.error('Failed to load user patterns:', error);
    }
  };

  const saveUserPatterns = async (patterns) => {
    try {
      await AsyncStorage.setItem('userPatterns', JSON.stringify(patterns));
      dispatch({ type: ACTIONS.SET_USER_PATTERNS, payload: patterns });
    } catch (error) {
      console.error('Failed to save user patterns:', error);
    }
  };

  const checkLocationTriggers = (location) => {
    const { latitude, longitude } = location.coords;
    
    // Check if user is in a known creative zone
    const isInCreativeZone = state.creativeZones.some(zone => {
      const distance = calculateDistance(
        latitude, longitude,
        zone.latitude, zone.longitude
      );
      return distance < zone.radius; // within 100m
    });

    if (isInCreativeZone) {
      dispatch({
        type: ACTIONS.ADD_TRIGGER_EVENT,
        payload: {
          type: 'location_trigger',
          timestamp: new Date().toISOString(),
          location: { latitude, longitude },
          message: "You're in a creative zone — ready to record?"
        }
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  };

  const addCreativeZone = async (zone) => {
    const newZones = [...state.creativeZones, zone];
    await AsyncStorage.setItem('creativeZones', JSON.stringify(newZones));
    dispatch({ type: ACTIONS.SET_CREATIVE_ZONES, payload: newZones });
  };

  const sendContextualNudge = async (message, type = 'info') => {
    if (!state.notificationPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TikTok Trainer',
          body: message,
          data: { type },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const updateRecordingPattern = async (recordingData) => {
    const patterns = {
      ...state.userPatterns,
      recordingFrequency: state.userPatterns.recordingFrequency + 1,
      lastRecording: new Date().toISOString(),
    };

    // Update active hours based on current time
    const currentHour = new Date().getHours();
    if (!patterns.activeHours.includes(currentHour)) {
      patterns.activeHours.push(currentHour);
    }

    await saveUserPatterns(patterns);
  };

  const value = {
    ...state,
    addCreativeZone,
    sendContextualNudge,
    updateRecordingPattern,
    saveUserPatterns,
  };

  return (
    <ContextContext.Provider value={value}>
      {children}
    </ContextContext.Provider>
  );
}

export const useContextData = () => {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error('useContextData must be used within a ContextProvider');
  }
  return context;
};
