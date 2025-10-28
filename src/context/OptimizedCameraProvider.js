// Optimized Camera Provider with better performance and state management
import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback, useMemo } from 'react';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as Storage from '../utils/storage';
import { APP_CONFIG } from '../utils/constants';

const CameraContext = createContext();

const ACTIONS = {
  SET_CAMERA_PERMISSION: 'SET_CAMERA_PERMISSION',
  SET_CAMERA_READY: 'SET_CAMERA_READY',
  SET_RECORDING: 'SET_RECORDING',
  SET_RECORDING_URI: 'SET_RECORDING_URI',
  SET_CAMERA_TYPE: 'SET_CAMERA_TYPE',
  SET_FLASH_MODE: 'SET_FLASH_MODE',
  SET_AUTO_ACTIVATION: 'SET_AUTO_ACTIVATION',
  ADD_RECORDING_SESSION: 'ADD_RECORDING_SESSION',
  SET_RECORDING_SESSIONS: 'SET_RECORDING_SESSIONS',
  RESET_CAMERA_STATE: 'RESET_CAMERA_STATE',
  SET_LOADING: 'SET_LOADING',
};

const initialState = {
  hasPermission: null,
  cameraReady: false,
  isRecording: false,
  recordingUri: null,
  cameraType: 'back',
  flashMode: 'off',
  autoActivation: true,
  recordingSessions: [],
  loading: false,
};

function cameraReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CAMERA_PERMISSION:
      return { ...state, hasPermission: action.payload };
    
    case ACTIONS.SET_CAMERA_READY:
      return { ...state, cameraReady: action.payload };
    
    case ACTIONS.SET_RECORDING:
      return { ...state, isRecording: action.payload };
    
    case ACTIONS.SET_RECORDING_URI:
      return { ...state, recordingUri: action.payload };
    
    case ACTIONS.SET_CAMERA_TYPE:
      return { ...state, cameraType: action.payload };
    
    case ACTIONS.SET_FLASH_MODE:
      return { ...state, flashMode: action.payload };
    
    case ACTIONS.SET_AUTO_ACTIVATION:
      return { ...state, autoActivation: action.payload };
    
    case ACTIONS.ADD_RECORDING_SESSION:
      return {
        ...state,
        recordingSessions: [...state.recordingSessions, action.payload]
          .slice(-APP_CONFIG.MAX_RECORDING_SESSIONS)
      };
    
    case ACTIONS.SET_RECORDING_SESSIONS:
      return { ...state, recordingSessions: action.payload };
    
    case ACTIONS.RESET_CAMERA_STATE:
      return {
        ...state,
        isRecording: false,
        recordingUri: null,
      };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

export function OptimizedCameraProvider({ children }) {
  const [state, dispatch] = useReducer(cameraReducer, initialState);
  const cameraRef = useRef(null);
  const recordingPromiseRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Memoized initialization
  const initializeCamera = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const { status } = await Camera.requestCameraPermissionsAsync();
      dispatch({ type: ACTIONS.SET_CAMERA_PERMISSION, payload: status === 'granted' });
      
      if (status === 'granted') {
        const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
        if (audioStatus !== 'granted') {
          console.warn('Microphone permission not granted');
        }
        
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
          console.warn('Media library permission not granted');
        }
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const loadRecordingSessions = useCallback(async () => {
    const sessions = await Storage.getRecordingSessions();
    if (Array.isArray(sessions)) {
      dispatch({ type: ACTIONS.SET_RECORDING_SESSIONS, payload: sessions });
    }
  }, []);

  useEffect(() => {
    initializeCamera();
    loadRecordingSessions();
  }, [initializeCamera, loadRecordingSessions]);

  // Memoized media library permission check
  const ensureMediaLibraryPermission = useCallback(async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status === 'granted') return true;
    if (permission.canAskAgain) {
      const request = await MediaLibrary.requestPermissionsAsync();
      return request.status === 'granted';
    }
    return false;
  }, []);

  const saveVideoToGallery = useCallback(async (videoUri) => {
    try {
      const hasPermission = await ensureMediaLibraryPermission();
      if (!hasPermission) {
        console.warn('Media library permission not granted');
        return null;
      }

      const assetId = await MediaLibrary.saveToLibraryAsync(videoUri);
      const asset = await MediaLibrary.getAssetAsync(assetId);
      
      console.log('✅ Video saved to gallery successfully!');
      return asset;
    } catch (error) {
      console.error('Failed to save video to gallery:', error);
      return null;
    }
  }, [ensureMediaLibraryPermission]);

  const saveRecordingSession = useCallback(async (session) => {
    const sessions = [...state.recordingSessions, session];
    await Storage.setRecordingSessions(sessions);
    dispatch({ type: ACTIONS.ADD_RECORDING_SESSION, payload: session });
  }, [state.recordingSessions]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecordingRef.current || !state.cameraReady) {
      console.log('Camera not ready for recording');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      isRecordingRef.current = true;
      dispatch({ type: ACTIONS.SET_RECORDING, payload: true });
      
      cameraRef.current.recordAsync().then(async (video) => {
        if (video && video.uri) {
          dispatch({ type: ACTIONS.SET_RECORDING_URI, payload: video.uri });
          
          const galleryAsset = await saveVideoToGallery(video.uri);
          
          const sessions = [...state.recordingSessions];
          if (sessions.length > 0) {
            const latestSession = sessions[sessions.length - 1];
            latestSession.endTime = new Date().toISOString();
            latestSession.uri = video.uri;
            latestSession.galleryUri = galleryAsset?.uri || null;
            latestSession.completed = true;
            latestSession.duration = new Date(latestSession.endTime) - new Date(latestSession.startTime);
            await Storage.setRecordingSessions(sessions);
          }
        }
      }).catch((error) => {
        console.error('Recording error:', error);
      }).finally(() => {
        isRecordingRef.current = false;
        dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
        dispatch({ type: ACTIONS.RESET_CAMERA_STATE });
      });
      
      const session = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        duration: 0,
        uri: null,
        completed: false,
      };
      
      await saveRecordingSession(session);
    } catch (error) {
      console.error('Failed to start recording:', error);
      isRecordingRef.current = false;
      dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
      throw error;
    }
  }, [state.cameraReady, state.recordingSessions, saveRecordingSession, saveVideoToGallery]);

  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current || !cameraRef.current) {
      return null;
    }
  
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cameraRef.current.stopRecording();
      return { stopped: true };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      isRecordingRef.current = false;
      dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
      throw error;
    }
  }, []);

  const toggleCameraType = useCallback(() => {
    const newType = state.cameraType === 'back' ? 'front' : 'back';
    dispatch({ type: ACTIONS.SET_CAMERA_TYPE, payload: newType });
  }, [state.cameraType]);

  const toggleFlashMode = useCallback(() => {
    const modes = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(state.flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch({ type: ACTIONS.SET_FLASH_MODE, payload: modes[nextIndex] });
  }, [state.flashMode]);

  const setCameraReady = useCallback((ready) => {
    dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: ready });
  }, []);

  const activateCamera = useCallback(async (reason = 'manual') => {
    if (!state.hasPermission) {
      await initializeCamera();
    }
    
    dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: true });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const activationEvent = {
      timestamp: new Date().toISOString(),
      reason,
      success: true,
    };
    
    try {
      const activations = await Storage.getItem(Storage.STORAGE_KEYS.CAMERA_ACTIVATIONS, []);
      activations.push(activationEvent);
      await Storage.setItem(Storage.STORAGE_KEYS.CAMERA_ACTIVATIONS, activations);
    } catch (error) {
      console.error('Failed to log camera activation:', error);
    }
  }, [state.hasPermission, initializeCamera]);

  const deactivateCamera = useCallback(() => {
    dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: false });
    dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
    dispatch({ type: ACTIONS.SET_RECORDING_URI, payload: null });
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    ...state,
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlashMode,
    activateCamera,
    deactivateCamera,
    setCameraReady,
    saveRecordingSession,
  }), [
    state,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlashMode,
    activateCamera,
    deactivateCamera,
    setCameraReady,
    saveRecordingSession,
  ]);

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within an OptimizedCameraProvider');
  }
  return context;
};

