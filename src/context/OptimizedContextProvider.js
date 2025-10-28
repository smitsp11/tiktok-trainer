// Optimized Context Provider with memoization and better performance
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { calculateDistance } from '../utils/helpers';
import * as Storage from '../utils/storage';
import { APP_CONFIG } from '../utils/constants';

const ContextContext = createContext();

// Action types
const ACTIONS = {
  SET_LOCATION: 'SET_LOCATION',
  SET_APP_STATE: 'SET_APP_STATE',
  SET_USER_PATTERNS: 'SET_USER_PATTERNS',
  SET_CREATIVE_ZONES: 'SET_CREATIVE_ZONES',
  ADD_TRIGGER_EVENT: 'ADD_TRIGGER_EVENT',
  SET_NOTIFICATION_PERMISSION: 'SET_NOTIFICATION_PERMISSION',
  SET_LOADING: 'SET_LOADING',
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
  loading: false,
};

// Optimized reducer with better immutability
function contextReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOCATION:
      return { ...state, location: action.payload };
    
    case ACTIONS.SET_APP_STATE:
      return { ...state, appState: action.payload };
    
    case ACTIONS.SET_USER_PATTERNS:
      return { 
        ...state, 
        userPatterns: { ...state.userPatterns, ...action.payload } 
      };
    
    case ACTIONS.SET_CREATIVE_ZONES:
      return { ...state, creativeZones: action.payload };
    
    case ACTIONS.ADD_TRIGGER_EVENT:
      return { 
        ...state, 
        triggerEvents: [...state.triggerEvents, action.payload].slice(-APP_CONFIG.MAX_TRIGGER_EVENTS)
      };
    
    case ACTIONS.SET_NOTIFICATION_PERMISSION:
      return { ...state, notificationPermission: action.payload };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

export function OptimizedContextProvider({ children }) {
  const [state, dispatch] = useReducer(contextReducer, initialState);

  // Memoized initialization functions
  const initializeLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        dispatch({ type: ACTIONS.SET_LOCATION, payload: location });
        
        // Start watching location changes
        Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.Balanced, 
            timeInterval: APP_CONFIG.LOCATION_UPDATE_INTERVAL,
            distanceInterval: APP_CONFIG.LOCATION_UPDATE_DISTANCE,
          },
          (newLocation) => {
            dispatch({ type: ACTIONS.SET_LOCATION, payload: newLocation });
            checkLocationTriggers(newLocation);
          }
        );
      }
    } catch (error) {
      console.error('Location initialization failed:', error);
    }
  }, []);

  const initializeNotifications = useCallback(async () => {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        dispatch({ 
          type: ACTIONS.SET_NOTIFICATION_PERMISSION, 
          payload: finalStatus === 'granted' 
        });
      }
    } catch (error) {
      console.error('Notification initialization failed:', error);
    }
  }, []);

  const loadUserPatterns = useCallback(async () => {
    const patterns = await Storage.getUserPatterns();
    dispatch({ type: ACTIONS.SET_USER_PATTERNS, payload: patterns });
  }, []);

  const loadCreativeZones = useCallback(async () => {
    const zones = await Storage.getCreativeZones();
    dispatch({ type: ACTIONS.SET_CREATIVE_ZONES, payload: zones });
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      await Promise.all([
        initializeLocation(),
        initializeNotifications(),
        loadUserPatterns(),
        loadCreativeZones(),
      ]);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    };
    
    initialize();
  }, [initializeLocation, initializeNotifications, loadUserPatterns, loadCreativeZones]);

  // Memoized location trigger check
  const checkLocationTriggers = useCallback((location) => {
    if (!location) return;
    
    const { latitude, longitude } = location.coords;
    
    const isInCreativeZone = state.creativeZones.some(zone => {
      const distance = calculateDistance(
        latitude, 
        longitude,
        zone.latitude, 
        zone.longitude
      );
      return distance < (zone.radius || APP_CONFIG.LOCATION_RADIUS);
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
  }, [state.creativeZones]);

  // Memoized functions
  const addCreativeZone = useCallback(async (zone) => {
    const newZones = [...state.creativeZones, zone];
    await Storage.setCreativeZones(newZones);
    dispatch({ type: ACTIONS.SET_CREATIVE_ZONES, payload: newZones });
  }, [state.creativeZones]);

  const sendContextualNudge = useCallback(async (message, type = 'info') => {
    if (!state.notificationPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TikTok Trainer',
          body: message,
          data: { type },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [state.notificationPermission]);

  const updateRecordingPattern = useCallback(async (recordingData) => {
    const patterns = {
      ...state.userPatterns,
      recordingFrequency: state.userPatterns.recordingFrequency + 1,
      lastRecording: new Date().toISOString(),
    };

    const currentHour = new Date().getHours();
    if (!patterns.activeHours.includes(currentHour)) {
      patterns.activeHours = [...patterns.activeHours, currentHour];
    }

    await Storage.setUserPatterns(patterns);
    dispatch({ type: ACTIONS.SET_USER_PATTERNS, payload: patterns });
  }, [state.userPatterns]);

  const saveUserPatterns = useCallback(async (patterns) => {
    await Storage.setUserPatterns(patterns);
    dispatch({ type: ACTIONS.SET_USER_PATTERNS, payload: patterns });
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    ...state,
    addCreativeZone,
    sendContextualNudge,
    updateRecordingPattern,
    saveUserPatterns,
  }), [
    state,
    addCreativeZone,
    sendContextualNudge,
    updateRecordingPattern,
    saveUserPatterns,
  ]);

  return (
    <ContextContext.Provider value={value}>
      {children}
    </ContextContext.Provider>
  );
}

export const useContextData = () => {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error('useContextData must be used within an OptimizedContextProvider');
  }
  return context;
};

