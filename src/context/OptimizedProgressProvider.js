// Optimized Progress Provider with better performance
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import * as Storage from '../utils/storage';
import { calculateStreak } from '../utils/helpers';
import { ACHIEVEMENTS, MOTIVATION_MESSAGES, MOTIVATION_BY_STREAK } from '../utils/constants';

const ProgressContext = createContext();

const ACTIONS = {
  SET_STREAK: 'SET_STREAK',
  SET_TOTAL_RECORDINGS: 'SET_TOTAL_RECORDINGS',
  SET_DAILY_GOAL: 'SET_DAILY_GOAL',
  SET_PROGRESS_DATA: 'SET_PROGRESS_DATA',
  ADD_RECORDING_STAT: 'ADD_RECORDING_STAT',
  UPDATE_STREAK: 'UPDATE_STREAK',
  SET_ACHIEVEMENTS: 'SET_ACHIEVEMENTS',
  SET_LOADING: 'SET_LOADING',
};

const initialState = {
  currentStreak: 0,
  longestStreak: 0,
  totalRecordings: 0,
  dailyGoal: 3,
  progressData: [],
  achievements: [],
  lastRecordingDate: null,
  streakStartDate: null,
  loading: false,
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
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

export function OptimizedProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  const loadProgressData = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const data = await Storage.getProgressData();
      
      dispatch({ type: ACTIONS.SET_PROGRESS_DATA, payload: data.progressData || [] });
      dispatch({ type: ACTIONS.SET_STREAK, payload: data.currentStreak || 0 });
      dispatch({ type: ACTIONS.SET_TOTAL_RECORDINGS, payload: data.totalRecordings || 0 });
      dispatch({ type: ACTIONS.SET_DAILY_GOAL, payload: data.dailyGoal || 3 });
      dispatch({ type: ACTIONS.SET_ACHIEVEMENTS, payload: data.achievements || [] });
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const saveProgressData = useCallback(async (data) => {
    await Storage.setProgressData(data);
  }, []);

  const updateDailyProgress = useCallback(async (dateStr) => {
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
    
    const todayData = existingData.find(day => day.date === dateStr);
    if (todayData && todayData.recordings >= state.dailyGoal) {
      todayData.completed = true;
    }
    
    dispatch({ type: ACTIONS.SET_PROGRESS_DATA, payload: existingData });
    return existingData;
  }, [state.progressData, state.dailyGoal]);

  const updateStreak = useCallback(async () => {
    const { currentStreak, longestStreak } = calculateStreak(state.progressData);
    const streakStartDate = state.progressData.length > 0 
      ? state.progressData[0].date 
      : null;
    
    dispatch({ 
      type: ACTIONS.UPDATE_STREAK, 
      payload: { currentStreak, longestStreak, streakStartDate } 
    });
  }, [state.progressData]);

  const checkAchievements = useCallback(async () => {
    const achievements = [...state.achievements];
    const newAchievements = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      const alreadyUnlocked = achievements.find(a => a.id === achievement.id);
      if (alreadyUnlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_recording':
          shouldUnlock = state.totalRecordings >= 1;
          break;
        case 'week_streak':
          shouldUnlock = state.currentStreak >= 7;
          break;
        case 'thirty_recordings':
          shouldUnlock = state.totalRecordings >= 30;
          break;
        case 'hundred_recordings':
          shouldUnlock = state.totalRecordings >= 100;
          break;
        case 'month_streak':
          shouldUnlock = state.currentStreak >= 30;
          break;
        case 'perfect_week':
          const last7Days = state.progressData.slice(-7);
          shouldUnlock = last7Days.length === 7 && last7Days.every(day => day.completed);
          break;
      }
      
      if (shouldUnlock) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      dispatch({ type: ACTIONS.SET_ACHIEVEMENTS, payload: updatedAchievements });
      return newAchievements;
    }
    
    return [];
  }, [state.achievements, state.totalRecordings, state.currentStreak, state.progressData]);

  const addRecording = useCallback(async () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    dispatch({ type: ACTIONS.ADD_RECORDING_STAT });
    
    const updatedProgress = await updateDailyProgress(todayStr);
    await updateStreak();
    const newAchievements = await checkAchievements();
    
    await saveProgressData({
      ...state,
      totalRecordings: state.totalRecordings + 1,
      lastRecordingDate: today.toISOString(),
      progressData: updatedProgress,
    });
    
    return newAchievements;
  }, [state, updateDailyProgress, updateStreak, checkAchievements, saveProgressData]);

  const updateDailyGoal = useCallback(async (newGoal) => {
    dispatch({ type: ACTIONS.SET_DAILY_GOAL, payload: newGoal });
    await saveProgressData({ ...state, dailyGoal: newGoal });
  }, [state, saveProgressData]);

  const getTodayProgress = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.progressData.find(day => day.date === today) || {
      date: today,
      recordings: 0,
      goal: state.dailyGoal,
      completed: false,
    };
  }, [state.progressData, state.dailyGoal]);

  const getWeeklyProgress = useCallback(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    
    return state.progressData.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate <= today;
    });
  }, [state.progressData]);

  const getStreakMotivation = useCallback(() => {
    const streakKey = Object.keys(MOTIVATION_BY_STREAK)
      .reverse()
      .find(key => state.currentStreak >= parseInt(key));
    
    if (streakKey) {
      return MOTIVATION_BY_STREAK[streakKey];
    }
    
    return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
  }, [state.currentStreak]);

  // Memoized context value
  const value = useMemo(() => ({
    ...state,
    addRecording,
    updateDailyGoal,
    getTodayProgress,
    getWeeklyProgress,
    getStreakMotivation,
    saveProgressData,
  }), [
    state,
    addRecording,
    updateDailyGoal,
    getTodayProgress,
    getWeeklyProgress,
    getStreakMotivation,
    saveProgressData,
  ]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within an OptimizedProgressProvider');
  }
  return context;
};

