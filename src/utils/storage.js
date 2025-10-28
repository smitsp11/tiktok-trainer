// Unified storage utility for AsyncStorage operations
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_PATTERNS: 'userPatterns',
  CREATIVE_ZONES: 'creativeZones',
  RECORDING_SESSIONS: 'recordingSessions',
  PROGRESS_DATA: 'progressData',
  APP_SETTINGS: 'appSettings',
  USER_BUZZWORDS: 'userBuzzwords',
  ACHIEVEMENTS: 'achievements',
  TRIGGER_EVENTS: 'triggerEvents',
  CAMERA_ACTIVATIONS: 'cameraActivations',
  AI_BEHAVIOR_MODEL: 'aiBehaviorModel',
  LAST_ACTIVITY: 'lastActivity',
};

/**
 * Generic get function for AsyncStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} Retrieved value
 */
export const getItem = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Failed to get ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Generic set function for AsyncStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<boolean>} Success status
 */
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set ${key}:`, error);
    return false;
  }
};

/**
 * Remove item from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
    return false;
  }
};

/**
 * Clear all AsyncStorage data
 * @returns {Promise<boolean>} Success status
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};

/**
 * Get multiple items at once
 * @param {Array<string>} keys - Array of storage keys
 * @returns {Promise<Object>} Object with key-value pairs
 */
export const getMultiple = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.reduce((acc, [key, value]) => {
      acc[key] = value ? JSON.parse(value) : null;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to get multiple items:', error);
    return {};
  }
};

/**
 * Set multiple items at once
 * @param {Object} keyValuePairs - Object with key-value pairs
 * @returns {Promise<boolean>} Success status
 */
export const setMultiple = async (keyValuePairs) => {
  try {
    const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Failed to set multiple items:', error);
    return false;
  }
};

/**
 * Get all keys in AsyncStorage
 * @returns {Promise<Array<string>>} Array of keys
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Failed to get all keys:', error);
    return [];
  }
};

/**
 * Export all data (for backup/debugging)
 * @returns {Promise<Object>} All stored data
 */
export const exportData = async () => {
  try {
    const keys = await getAllKeys();
    return await getMultiple(keys);
  } catch (error) {
    console.error('Failed to export data:', error);
    return {};
  }
};

/**
 * Import data (for restore)
 * @param {Object} data - Data to import
 * @returns {Promise<boolean>} Success status
 */
export const importData = async (data) => {
  try {
    await setMultiple(data);
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// Specific storage helpers
export const getUserPatterns = () => getItem(STORAGE_KEYS.USER_PATTERNS, {
  frequentLocations: [],
  activeHours: [],
  recordingFrequency: 0,
  lastRecording: null,
});

export const setUserPatterns = (patterns) => setItem(STORAGE_KEYS.USER_PATTERNS, patterns);

export const getCreativeZones = () => getItem(STORAGE_KEYS.CREATIVE_ZONES, []);

export const setCreativeZones = (zones) => setItem(STORAGE_KEYS.CREATIVE_ZONES, zones);

export const getRecordingSessions = () => getItem(STORAGE_KEYS.RECORDING_SESSIONS, []);

export const setRecordingSessions = (sessions) => setItem(STORAGE_KEYS.RECORDING_SESSIONS, sessions);

export const getProgressData = () => getItem(STORAGE_KEYS.PROGRESS_DATA, {
  progressData: [],
  currentStreak: 0,
  longestStreak: 0,
  totalRecordings: 0,
  dailyGoal: 3,
  achievements: [],
});

export const setProgressData = (data) => setItem(STORAGE_KEYS.PROGRESS_DATA, data);

export const getAppSettings = () => getItem(STORAGE_KEYS.APP_SETTINGS, {
  autoActivation: true,
  contextualNudges: true,
  hapticFeedback: true,
  soundEffects: true,
  locationTracking: true,
  creativeZoneNotifications: true,
});

export const setAppSettings = (settings) => setItem(STORAGE_KEYS.APP_SETTINGS, settings);

