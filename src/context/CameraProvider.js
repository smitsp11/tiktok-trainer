import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  RESET_CAMERA_STATE: 'RESET_CAMERA_STATE',
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
      };
    case ACTIONS.RESET_CAMERA_STATE:
      return {
        ...state,
        cameraReady: false,
        isRecording: false,
        recordingUri: null,
      };
    default:
      return state;
  }
}

export function CameraProvider({ children }) {
  const [state, dispatch] = useReducer(cameraReducer, initialState);
  const cameraRef = useRef(null);

  useEffect(() => {
    initializeCamera();
    loadRecordingSessions();
  }, []);

  const initializeCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      dispatch({ type: ACTIONS.SET_CAMERA_PERMISSION, payload: status === 'granted' });
      
      if (status === 'granted') {
        const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
        if (audioStatus !== 'granted') {
          console.warn('Microphone permission not granted');
        }
        
        // Request media library permission for saving videos
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
          console.warn('Media library permission not granted - videos won\'t be saved to gallery');
        }
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
    }
  };

  const loadRecordingSessions = async () => {
    try {
      const sessions = await AsyncStorage.getItem('recordingSessions');
      if (sessions) {
        dispatch({ 
          type: ACTIONS.ADD_RECORDING_SESSION, 
          payload: JSON.parse(sessions) 
        });
      }
    } catch (error) {
      console.error('Failed to load recording sessions:', error);
    }
  };

  const saveRecordingSession = async (session) => {
    try {
      const sessions = [...state.recordingSessions, session];
      await AsyncStorage.setItem('recordingSessions', JSON.stringify(sessions));
      dispatch({ type: ACTIONS.ADD_RECORDING_SESSION, payload: session });
    } catch (error) {
      console.error('Failed to save recording session:', error);
    }
  };

  const saveVideoToGallery = async (videoUri) => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission not granted');
        return null;
      }

      const asset = await MediaLibrary.createAssetAsync(videoUri);
      console.log('✅ Video saved to gallery:', asset.uri);
      return asset;
    } catch (error) {
      console.error('Failed to save video to gallery:', error);
      return null;
    }
  };

  const startRecording = async () => {
    console.log('Attempting to start recording...');
    console.log('Current state:', { 
      hasRef: !!cameraRef.current, 
      isRecording: state.isRecording, 
      cameraReady: state.cameraReady 
    });

    if (!cameraRef.current || state.isRecording || !state.cameraReady) {
      console.log('Camera not ready for recording:', { 
        hasRef: !!cameraRef.current, 
        isRecording: state.isRecording, 
        cameraReady: state.cameraReady 
      });
      return;
    }

    try {
      // Haptic feedback for recording start
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('About to call toggleRecordingAsync...');
      const recording = await cameraRef.current.toggleRecordingAsync();

      console.log('Recording started successfully:', recording);
      dispatch({ type: ACTIONS.SET_RECORDING, payload: true });
      
      // Save recording session
      const session = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        duration: 0,
        uri: null,
        completed: false,
      };
      
      await saveRecordingSession(session);
      
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !state.isRecording) return;
  
    try {
      // Haptic feedback for recording stop
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      console.log('About to stop recording...');
      
      // Use toggleRecordingAsync to stop recording
      const recording = await cameraRef.current.toggleRecordingAsync();
      
      console.log('Recording stopped, result:', recording);
      
      dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
      
      // The recording object should now contain the video data
      if (recording && recording.uri) {
        dispatch({ type: ACTIONS.SET_RECORDING_URI, payload: recording.uri });
        
        // Save video to gallery
        const galleryAsset = await saveVideoToGallery(recording.uri);
        
        // Update the latest recording session
        const sessions = [...state.recordingSessions];
        if (sessions.length > 0) {
          const latestSession = sessions[sessions.length - 1];
          latestSession.endTime = new Date().toISOString();
          latestSession.uri = recording.uri;
          latestSession.galleryUri = galleryAsset?.uri || null;
          latestSession.completed = true;
          latestSession.duration = new Date(latestSession.endTime) - new Date(latestSession.startTime);
          
          await AsyncStorage.setItem('recordingSessions', JSON.stringify(sessions));
        }
        
        // Reset camera state for next recording
        setTimeout(() => {
          dispatch({ type: ACTIONS.RESET_CAMERA_STATE });
        }, 1000);
        
      } else {
        console.log('No recording URI found in result:', recording);
      }
      
      return recording;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  };

  const toggleCameraType = () => {
    const newType = state.cameraType === 'back' ? 'front' : 'back';
    dispatch({ type: ACTIONS.SET_CAMERA_TYPE, payload: newType });
  };

  const toggleFlashMode = () => {
    const modes = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(state.flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch({ type: ACTIONS.SET_FLASH_MODE, payload: modes[nextIndex] });
  };

  const setCameraReady = (ready) => {
    dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: ready });
  };

  const activateCamera = async (reason = 'manual') => {
    if (!state.hasPermission) {
      await initializeCamera();
    }
    
    // Haptic feedback for camera activation
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Log activation event
    const activationEvent = {
      timestamp: new Date().toISOString(),
      reason,
      success: true,
    };
    
    try {
      const activations = await AsyncStorage.getItem('cameraActivations') || '[]';
      const parsedActivations = JSON.parse(activations);
      parsedActivations.push(activationEvent);
      await AsyncStorage.setItem('cameraActivations', JSON.stringify(parsedActivations));
    } catch (error) {
      console.error('Failed to log camera activation:', error);
    }
  };

  const deactivateCamera = () => {
    dispatch({ type: ACTIONS.SET_CAMERA_READY, payload: false });
    dispatch({ type: ACTIONS.SET_RECORDING, payload: false });
    dispatch({ type: ACTIONS.SET_RECORDING_URI, payload: null });
  };

  const value = {
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
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};
