// Reusable Achievement Card component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../utils/constants';
import { formatDate } from '../utils/helpers';

export const AchievementCard = ({ achievement, style, onPress }) => {
  return (
    <Card style={[styles.container, style]} onPress={onPress}>
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        {achievement.unlockedAt && (
          <Text style={styles.date}>
            Unlocked {formatDate(achievement.unlockedAt)}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.disabled,
  },
});

export default AchievementCard;

