/**
 * StatusBadge — mirrors StatusBadge.kt exactly.
 *
 * Pill-shaped badge with uppercase text.
 * Colors determined by getColorsForStatus() from ExpenseUiUtils.kt.
 *
 * Layout: Box with rounded-full bg + bold uppercase Text
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
  fontSize = 10,          // matching Kotlin default: 10.sp
  horizontalPadding = 8,  // matching Kotlin default: 8.dp
  verticalPadding = 2,    // matching Kotlin default: 2.dp
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
    borderRadius: borderRadii.full, // RoundedCornerShape(percent = 50)
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700', // FontWeight.Bold
  },
});
