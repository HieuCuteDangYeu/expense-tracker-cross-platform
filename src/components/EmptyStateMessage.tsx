/**
 * EmptyStateMessage — A centered placeholder component used when data lists are empty.
 * 
 * Provides a clear visual cue with an optional icon, title, and descriptive text
 * to guide users toward an initial action or explain the absence of data.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, typography, spacing, borderRadii } from '../theme/theme';

interface EmptyStateMessageProps {
  title: string;
  description?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
}

export default function EmptyStateMessage({
  title,
  description,
  iconName,
  style,
}: EmptyStateMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={48}                              // Modifier.size(48.dp)
            color={lightColors.textSecondary}      // AppTheme.extended.textSecondary
          />
        )}
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadii.lg,                  // RoundedCornerShape(12.dp)
    backgroundColor: lightColors.surface,           // MaterialTheme.colorScheme.surface
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,         // MaterialTheme.colorScheme.outlineVariant
  },
  content: {
    padding: spacing.xxxl,                          // .padding(48.dp)
    alignItems: 'center',
    gap: spacing.lg,                                // Arrangement.spacedBy(12.dp)
  },
  title: {
    fontSize: 18,                                   // 18.sp
    fontWeight: '600',                              // FontWeight.SemiBold
    color: lightColors.onSurface,                   // MaterialTheme.colorScheme.onSurface
  },
  description: {
    fontSize: typography.bodyMedium.fontSize,        // 14.sp
    color: lightColors.textSecondary,                // AppTheme.extended.textSecondary
    lineHeight: 20,                                  // 20.sp
    textAlign: 'center',
    paddingHorizontal: spacing.xl,                   // .padding(horizontal = 16.dp)
  },
});
