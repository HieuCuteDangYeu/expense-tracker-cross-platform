/**
 * ProjectCard — mirrors ProjectCard.kt.
 *
 * Layout from Kotlin:
 *   Surface(shape=8.dp, border=1.dp outlineVariant, color=surface)
 *     Column(padding=16.dp)
 *       Row(SpaceBetween, Top)
 *         Column: projectName (16.sp Bold) + ID (10.sp Medium, textTertiary)
 *         StatusBadge pill (status)
 *       Spacer(12.dp)
 *       Row(SpaceBetween): "Budget Used: X%" + "$spent / $budget" (12.sp, textSecondary)
 *       Spacer(4.dp)
 *       ProgressBar (8.dp height, primary or red if >80%)
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  lightColors,
  spacing,
  borderRadii,
  typography,
} from '../theme/theme';
import { formatCurrency } from '../utils/formatUtils';
import { getFormattedProjectId, type Project } from '../types/project';
import type { Expense } from '../types/expense';

interface ProjectCardProps {
  project: Project;
  expenses: Expense[];
  onPress?: () => void;
  onToggleFavorite?: () => void;
  style?: ViewStyle;
}

export default function ProjectCard({
  project,
  expenses,
  onPress,
  onToggleFavorite,
  style,
}: ProjectCardProps) {
  // Calculate budget usage — matching Kotlin logic
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetPercentage = project.budget > 0 ? totalSpent / project.budget : 0;
  const budgetPercentageInt = Math.round(budgetPercentage * 100);

  // Status colors — matching Kotlin when block
  const statusColors = getProjectStatusColors(project.status);

  // Progress bar color — red if >80%
  const progressBarColor =
    budgetPercentage > 0.8 ? '#EF4444' : lightColors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      {/* Header Row: Name + Favorite + Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.nameColumn}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.projectName, { flex: 1 }]}>{project.projectName}</Text>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              style={{ marginLeft: spacing.sm }}
            >
              <MaterialIcons
                name={project.isFavorite ? 'favorite' : 'favorite-border'}
                size={20}
                color={project.isFavorite ? '#EF4444' : lightColors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.projectId}>
            ID: {getFormattedProjectId(project.projectId)}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
        >
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {project.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Budget Info Row */}
      <View style={styles.budgetRow}>
        <Text style={styles.budgetLabel}>
          Budget Used: {budgetPercentageInt}%
        </Text>
        <Text style={styles.budgetValue}>
          {formatCurrency(totalSpent)} / {formatCurrency(project.budget)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(budgetPercentage * 100, 100)}%`,
              backgroundColor: progressBarColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Status → color mapping matching Kotlin's when block in ProjectCard.kt.
 */
function getProjectStatusColors(status: string): {
  bg: string;
  text: string;
} {
  switch (status.toLowerCase()) {
    case 'active':
      return { bg: lightColors.successBg, text: lightColors.successText };
    case 'on hold':
      return { bg: lightColors.warningBg, text: lightColors.warningText };
    case 'completed':
      return {
        bg: lightColors.surfaceVariant,
        text: lightColors.onSurfaceVariant,
      };
    default:
      return { bg: lightColors.infoBg, text: lightColors.infoText };
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadii.lg,                   // theme.metrics.borderRadius.lg
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    padding: spacing.xl,                            // .padding(16.dp)
    // Elevation matching Compose default card
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameColumn: {
    flex: 1,
  },
  projectName: {
    ...typography.bodyLarge,                        // 16.sp
    fontWeight: '700',                              // FontWeight.Bold
    color: lightColors.onSurface,
  },
  projectId: {
    ...typography.labelSmall,                       // 11.sp
    fontSize: 10,                                   // 10.sp override
    fontWeight: '500',                              // FontWeight.Medium
    letterSpacing: -0.025 * 10,                     // tracking-tight
    color: lightColors.textTertiary,                // AppTheme.extended.textTertiary
    marginTop: spacing.xs,                          // .padding(top = 2.dp)
  },
  statusBadge: {
    borderRadius: borderRadii.full,                 // RoundedCornerShape(50)
    paddingHorizontal: spacing.md,                  // horizontal = 8.dp
    paddingVertical: spacing.xs,                    // vertical = 2.dp
  },
  statusText: {
    ...typography.labelSmall,                       // 11.sp
    fontSize: 10,                                   // override for 10.sp
    fontWeight: '700',                              // FontWeight.Bold
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,                          // Spacer(12.dp)
  },
  budgetLabel: {
    ...typography.labelMedium,                      // 12.sp
    color: lightColors.textSecondary,
  },
  budgetValue: {
    ...typography.labelMedium,                      // 12.sp
    color: lightColors.textSecondary,
  },
  progressTrack: {
    width: '100%',
    height: 8,                                      // .height(8.dp)
    borderRadius: borderRadii.full,                 // RoundedCornerShape(percent = 50)
    backgroundColor: lightColors.surfaceVariant,    // MaterialTheme.colorScheme.surfaceVariant
    marginTop: spacing.sm,                          // Spacer(4.dp)
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: borderRadii.full,
  },
});
