import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCamera } from '../context/CameraProvider';
import { useProgress } from '../context/ProgressProvider';
import { useContextData } from '../context/ContextProvider';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation }) {
  const {
    hasPermission,
    cameraReady,
    isRecording,
    recordingUri,
    cameraType,
    flashMode,
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlashMode,
    activateCamera,
    setCameraReady,
  } = useCamera();

  const { addRecording } = useProgress();
  const { updateRecordingPattern } = useContextData();

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const durationInterval = useRef(null);

  useEffect(() => {
    if (!cameraReady) {
      activateCamera('manual');
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startRecording();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const recording = await stopRecording();
      
      // Update progress
      await addRecording();
      await updateRecordingPattern({
        duration: recordingDuration,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        'Recording Complete!',
        `You recorded for ${recordingDuration} seconds. Great job!`,
        [
          { text: 'Record Again', onPress: () => setRecordingDuration(0) },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission denied</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => activateCamera('permission_retry')}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        onCameraReady={() => {
          console.log('Camera ready callback fired');
          setShowControls(true);
          // Add a small delay to ensure camera is fully ready
          setTimeout(() => {
            setCameraReady(true);
            console.log('Camera ready state set to true');
          }, 500);
        }}
      />
      
      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlashMode}
        >
          <Ionicons 
            name={flashMode === 'off' ? 'flash-off' : 'flash'} 
            size={30} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraType}
        >
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!cameraReady}
        >
          <View style={styles.recordButtonInner}>
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('PromptCard')}
        >
          <Ionicons name="bulb" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Recording progress bar */}
      {isRecording && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(recordingDuration / 60) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#FF0050',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0050',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordButtonActive: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0050',
  },
  stopIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#FF0050',
    borderRadius: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0050',
    borderRadius: 2,
  },
});
