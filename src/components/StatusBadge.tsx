/**
 * StatusBadge — A contextual visual indicator for transaction and project states.
 * 
 * Generates a pill-shaped badge with dynamic background and foreground colors
 * based on the provided status string.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getColorsForStatus } from '../utils/expenseUiUtils';
import { borderRadii } from '../theme/theme';

interface StatusBadgeProps {
  status: string;
  fontSize?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  style?: ViewStyle;
}

export default function StatusBadge({
  status,
  fontSize = 10,          // Default typography sizing
  horizontalPadding = 8,  // Standard horizontal spacing
  verticalPadding = 2,    // Compact vertical spacing
  style,
}: StatusBadgeProps) {
  const { bgColor, textColor } = getColorsForStatus(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color: textColor,
          },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
  },
});
