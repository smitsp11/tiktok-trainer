// Reusable Card component
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../utils/constants';

export const Card = ({ 
  children, 
  style, 
  onPress, 
  disabled = false,
  elevated = true,
  padding = SPACING.md,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper
      style={[
        styles.card,
        elevated && SHADOW.md,
        { padding },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
});

export default Card;

