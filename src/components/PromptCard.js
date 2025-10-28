// Reusable Prompt Card component
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../utils/constants';

const { width } = Dimensions.get('window');

export const PromptCard = ({ prompt, style, onPress, compact = false }) => {
  return (
    <Card 
      style={[compact ? styles.compactContainer : styles.container, style]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{prompt.category}</Text>
        {!compact && (
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.text}>{prompt.text}</Text>
      {!compact && (
        <Text style={styles.hint}>Tap to get recording ideas</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    marginRight: SPACING.md,
    width: width * 0.6,
  },
  compactContainer: {
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: width * 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
});

export default PromptCard;

