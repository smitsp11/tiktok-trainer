// Custom hook for haptic feedback
import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const impact = useCallback(async (style = 'Medium') => {
    try {
      const styles = {
        Light: Haptics.ImpactFeedbackStyle.Light,
        Medium: Haptics.ImpactFeedbackStyle.Medium,
        Heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(styles[style] || styles.Medium);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  const notification = useCallback(async (type = 'Success') => {
    try {
      const types = {
        Success: Haptics.NotificationFeedbackType.Success,
        Warning: Haptics.NotificationFeedbackType.Warning,
        Error: Haptics.NotificationFeedbackType.Error,
      };
      await Haptics.notificationAsync(types[type] || types.Success);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  const selection = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  return {
    impact,
    notification,
    selection,
  };
};

