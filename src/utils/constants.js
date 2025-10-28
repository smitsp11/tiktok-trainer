// App-wide constants
export const COLORS = {
  primary: '#FF0050',
  primaryLight: '#FF4081',
  primaryDark: '#CC003D',
  secondary: '#FF6B9D',
  accent: '#FF8A80',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#FFFFFF',
  },
  
  // Background colors
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
    dark: '#1A1A1A',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// App configuration constants
export const APP_CONFIG = {
  IDLE_TIME_THRESHOLD: 30 * 60 * 1000, // 30 minutes
  LOCATION_RADIUS: 100, // meters
  RECORDING_GAP_THRESHOLD: 3 * 60 * 60 * 1000, // 3 hours
  MAX_TRIGGER_EVENTS: 100,
  MAX_RECORDING_SESSIONS: 1000,
  DEFAULT_DAILY_GOAL: 3,
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  LOCATION_UPDATE_DISTANCE: 50, // meters
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_RECORDING: {
    id: 'first_recording',
    title: 'First Steps',
    description: 'Recorded your first video!',
    icon: '🎬',
    threshold: 1,
  },
  WEEK_STREAK: {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintained a 7-day recording streak!',
    icon: '🔥',
    threshold: 7,
  },
  THIRTY_RECORDINGS: {
    id: 'thirty_recordings',
    title: 'Content Creator',
    description: 'Recorded 30 videos!',
    icon: '📹',
    threshold: 30,
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Completed daily goals for 7 days straight!',
    icon: '⭐',
    threshold: 7,
  },
  HUNDRED_RECORDINGS: {
    id: 'hundred_recordings',
    title: 'Century Club',
    description: 'Recorded 100 videos!',
    icon: '💯',
    threshold: 100,
  },
  MONTH_STREAK: {
    id: 'month_streak',
    title: 'Consistency King',
    description: 'Maintained a 30-day recording streak!',
    icon: '👑',
    threshold: 30,
  },
};

// Prompt categories
export const PROMPT_CATEGORIES = {
  MOTIVATION: 'motivation',
  GROWTH: 'growth',
  PERSONAL: 'personal',
  FITNESS: 'fitness',
  INSPIRATION: 'inspiration',
  EDUCATION: 'education',
  LIFESTYLE: 'lifestyle',
  CUSTOM: 'custom',
};

// Default prompts
export const DEFAULT_PROMPTS = [
  { id: '1', text: 'discipline', category: PROMPT_CATEGORIES.MOTIVATION },
  { id: '2', text: 'building consistency', category: PROMPT_CATEGORIES.GROWTH },
  { id: '3', text: 'post-midterm burnout', category: PROMPT_CATEGORIES.PERSONAL },
  { id: '4', text: 'gym progress', category: PROMPT_CATEGORIES.FITNESS },
  { id: '5', text: 'creative flow', category: PROMPT_CATEGORIES.INSPIRATION },
];

// Recording idea templates
export const RECORDING_IDEAS = [
  {
    id: '1',
    title: 'Personal Story',
    description: 'Share a personal experience',
    icon: 'person',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'Quick Tip',
    description: 'Give a 30-second tip',
    icon: 'bulb',
    color: COLORS.primaryLight,
  },
  {
    id: '3',
    title: 'Behind the Scenes',
    description: 'Show your process',
    icon: 'eye',
    color: COLORS.secondary,
  },
  {
    id: '4',
    title: 'Question & Answer',
    description: 'Answer a common question',
    icon: 'help-circle',
    color: COLORS.accent,
  },
  {
    id: '5',
    title: 'Day in the Life',
    description: 'Show how it fits into your day',
    icon: 'calendar',
    color: '#FFAB91',
  },
  {
    id: '6',
    title: 'Motivational Moment',
    description: 'Inspire others',
    icon: 'heart',
    color: '#FFCDD2',
  },
];

// Notification messages
export const NOTIFICATION_MESSAGES = {
  LOCATION_TRIGGER: "You're in a creative zone — ready to record?",
  IDLE_TIME: "You've been quiet for a while — perfect time for a thought drop!",
  RECORDING_GAP: "It's been a while since your last recording — ready for a quick update?",
  DAILY_GOAL: "Haven't recorded today yet — want to keep your streak going?",
  OPTIMAL_TIME: "This is typically a good time for you to record",
};

// Motivational messages
export const MOTIVATION_MESSAGES = [
  "Keep the momentum going! 🔥",
  "You're building an amazing habit! 💪",
  "Every recording counts! 📹",
  "Consistency is key! ⭐",
  "You're on fire! 🚀",
  "One step closer to your goal! 🎯",
  "Amazing progress! Keep it up! 🌟",
  "You're unstoppable! 💥",
];

export const MOTIVATION_BY_STREAK = {
  0: "Ready to start your streak? Let's record something! 🎬",
  1: "Great start! Keep it up! 🌟",
  2: "Building momentum! 🔥",
  3: "You're on a roll! Keep going! 💪",
  7: "Week warrior! One week strong! 👑",
  14: "Two weeks of consistency! Incredible! 🎉",
  30: "One month streak! You're a legend! 🏆",
};

