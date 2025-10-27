import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfDay, endOfDay, isToday, isYesterday, differenceInDays } from 'date-fns';

const ProgressContext = createContext();

const ACTIONS = {
  SET_STREAK: 'SET_STREAK',
  SET_TOTAL_RECORDINGS: 'SET_TOTAL_RECORDINGS',
  SET_DAILY_GOAL: 'SET_DAILY_GOAL',
  SET_PROGRESS_DATA: 'SET_PROGRESS_DATA',
  ADD_RECORDING_STAT: 'ADD_RECORDING_STAT',
  UPDATE_STREAK: 'UPDATE_STREAK',
  SET_ACHIEVEMENTS: 'SET_ACHIEVEMENTS',
};

const initialState = {
  currentStreak: 0,
  longestStreak: 0,
  totalRecordings: 0,
  dailyGoal: 3, // Default goal: 3 recordings per day
  progressData: [], // Array of daily progress
  achievements: [],
  lastRecordingDate: null,
  streakStartDate: null,
};

function progressReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STREAK:
      return { ...state, currentStreak: action.payload };
    case ACTIONS.SET_TOTAL_RECORDINGS:
      return { ...state, totalRecordings: action.payload };
    case ACTIONS.SET_DAILY_GOAL:
      return { ...state, dailyGoal: action.payload };
    case ACTIONS.SET_PROGRESS_DATA:
      return { ...state, progressData: action.payload };
    case ACTIONS.ADD_RECORDING_STAT:
      return { 
        ...state, 
        totalRecordings: state.totalRecordings + 1,
        lastRecordingDate: new Date().toISOString(),
      };
    case ACTIONS.UPDATE_STREAK:
      return { 
        ...state, 
        currentStreak: action.payload.currentStreak,
        longestStreak: Math.max(state.longestStreak, action.payload.currentStreak),
        streakStartDate: action.payload.streakStartDate,
      };
    case ACTIONS.SET_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const progressData = await AsyncStorage.getItem('progressData');
      if (progressData) {
        const parsed = JSON.parse(progressData);
        dispatch({ type: ACTIONS.SET_PROGRESS_DATA, payload: parsed.progressData || [] });
        dispatch({ type: ACTIONS.SET_STREAK, payload: parsed.currentStreak || 0 });
        dispatch({ type: ACTIONS.SET_TOTAL_RECORDINGS, payload: parsed.totalRecordings || 0 });
        dispatch({ type: ACTIONS.SET_DAILY_GOAL, payload: parsed.dailyGoal || 3 });
        dispatch({ type: ACTIONS.SET_ACHIEVEMENTS, payload: parsed.achievements || [] });
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const saveProgressData = async (data) => {
    try {
      await AsyncStorage.setItem('progressData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  };

  const addRecording = async () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Add to total recordings
    dispatch({ type: ACTIONS.ADD_RECORDING_STAT });
    
    // Update daily progress
    const updatedProgress = await updateDailyProgress(todayStr);
    
    // Update streak
    await updateStreak();
    
    // Check for achievements
    await checkAchievements();
    
    // Save all data
    await saveProgressData({
      ...state,
      totalRecordings: state.totalRecordings + 1,
      lastRecordingDate: today.toISOString(),
      progressData: updatedProgress,
    });
  };

  const updateDailyProgress = async (dateStr) => {
    const existingData = [...state.progressData];
    const todayIndex = existingData.findIndex(day => day.date === dateStr);
    
    if (todayIndex >= 0) {
      existingData[todayIndex].recordings += 1;
    } else {
      existingData.push({
        date: dateStr,
        recordings: 1,
        goal: state.dailyGoal,
        completed: false,
      });
    }
    
    // Check if daily goal is completed
    const todayData = existingData.find(day => day.date === dateStr);
    if (todayData && todayData.recordings >= state.dailyGoal) {
      todayData.completed = true;
    }
    
    dispatch({ type: ACTIONS.SET_PROGRESS_DATA, payload: existingData });
    return existingData;
  };

  const updateStreak = async () => {
    const today = new Date();
    const progressData = [...state.progressData];
    
    // Sort by date
    progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let currentStreak = 0;
    let streakStartDate = null;
    
    // Calculate streak backwards from today
    for (let i = progressData.length - 1; i >= 0; i--) {
      const dayData = progressData[i];
      const dayDate = new Date(dayData.date);
      const daysDiff = differenceInDays(today, dayDate);
      
      if (daysDiff === currentStreak && dayData.completed) {
        currentStreak++;
        if (!streakStartDate) {
          streakStartDate = dayData.date;
        }
      } else if (daysDiff === currentStreak + 1 && dayData.completed) {
        // Continue streak
        currentStreak++;
        if (!streakStartDate) {
          streakStartDate = dayData.date;
        }
      } else {
        break;
      }
    }
    
    dispatch({ 
      type: ACTIONS.UPDATE_STREAK, 
      payload: { currentStreak, streakStartDate } 
    });
  };

  const checkAchievements = async () => {
    const achievements = [...state.achievements];
    const newAchievements = [];
    
    // First recording achievement
    if (state.totalRecordings === 1 && !achievements.find(a => a.id === 'first_recording')) {
      newAchievements.push({
        id: 'first_recording',
        title: 'First Steps',
        description: 'Recorded your first video!',
        icon: '🎬',
        unlockedAt: new Date().toISOString(),
      });
    }
    
    // 7-day streak achievement
    if (state.currentStreak >= 7 && !achievements.find(a => a.id === 'week_streak')) {
      newAchievements.push({
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day recording streak!',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
      });
    }
    
    // 30 recordings achievement
    if (state.totalRecordings >= 30 && !achievements.find(a => a.id === 'thirty_recordings')) {
      newAchievements.push({
        id: 'thirty_recordings',
        title: 'Content Creator',
        description: 'Recorded 30 videos!',
        icon: '📹',
        unlockedAt: new Date().toISOString(),
      });
    }
    
    // Perfect week achievement
    const last7Days = state.progressData.slice(-7);
    const perfectWeek = last7Days.length === 7 && last7Days.every(day => day.completed);
    if (perfectWeek && !achievements.find(a => a.id === 'perfect_week')) {
      newAchievements.push({
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Completed daily goals for 7 days straight!',
        icon: '⭐',
        unlockedAt: new Date().toISOString(),
      });
    }
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      dispatch({ type: ACTIONS.SET_ACHIEVEMENTS, payload: updatedAchievements });
    }
  };

  const updateDailyGoal = async (newGoal) => {
    dispatch({ type: ACTIONS.SET_DAILY_GOAL, payload: newGoal });
    await saveProgressData({ ...state, dailyGoal: newGoal });
  };

  const getTodayProgress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.progressData.find(day => day.date === today) || {
      date: today,
      recordings: 0,
      goal: state.dailyGoal,
      completed: false,
    };
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    
    return state.progressData.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate <= today;
    });
  };

  const getStreakMotivation = () => {
    const messages = [
      "Keep the momentum going! 🔥",
      "You're building an amazing habit! 💪",
      "Every recording counts! 📹",
      "Consistency is key! ⭐",
      "You're on fire! 🚀",
    ];
    
    if (state.currentStreak === 0) {
      return "Ready to start your streak? Let's record something! 🎬";
    } else if (state.currentStreak < 3) {
      return "Great start! Keep it up! 🌟";
    } else if (state.currentStreak < 7) {
      return "You're building momentum! 🔥";
    } else {
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };

  const value = {
    ...state,
    addRecording,
    updateDailyGoal,
    getTodayProgress,
    getWeeklyProgress,
    getStreakMotivation,
    saveProgressData,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
