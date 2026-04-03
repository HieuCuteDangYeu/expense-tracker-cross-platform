/**
 * ExpenseItemCard — mirrors ExpenseItemCard.kt exactly.
 *
 * Layout from Kotlin:
 *   Surface(shape=12.dp, border=1.dp outlineVariant, color=surface)
 *     Row(padding=12.dp, verticalAlignment=CenterVertically)
 *       Box(40×40, bg=typeColor, rounded=8.dp) → Icon(24.dp, tint=typeTint)
 *       Spacer(16.dp)
 *       Column(weight=1f)
 *         Row(fillMaxWidth, SpaceBetween, Top)
 *           Text(description||type, 14.sp, Bold, onSurface, maxLines=1, ellipsis)
 *           Text(formattedAmount, 14.sp, Bold, onSurface)
 *         Spacer(2.dp)
 *         Row(fillMaxWidth, SpaceBetween, CenterVertically)
 *           Text("date • type", 12.sp, textSecondary)
 *           StatusBadge(paymentStatus)
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { getIconAndColorsForType } from '../utils/expenseUiUtils';
import { formatCurrency } from '../utils/formatUtils';
import StatusBadge from './StatusBadge';
import type { Expense } from '../types';

interface ExpenseItemCardProps {
  expense: Expense;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function ExpenseItemCard({
  expense,
  onPress,
  style,
}: ExpenseItemCardProps) {
  const { iconName, bgColor, tintColor } = getIconAndColorsForType(expense.type);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.row}>
        {/* Icon Box — 40×40, rounded 8dp, colored background */}
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialIcons
            name={iconName as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={tintColor}
          />
        </View>

        {/* Content Column */}
        <View style={styles.content}>
          {/* Top Row: Description + Amount */}
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {expense.description || expense.type}
            </Text>
            <Text style={styles.amount}>
              {formatCurrency(expense.amount, expense.currency)}
            </Text>
          </View>

          {/* Bottom Row: Date•Type + StatusBadge */}
          <View style={styles.bottomRow}>
            <Text style={styles.meta}>
              {expense.date} • {expense.type}
            </Text>
            <StatusBadge status={expense.paymentStatus} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadii.lg,              // RoundedCornerShape(12.dp)
    backgroundColor: lightColors.surface,       // MaterialTheme.colorScheme.surface
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,     // outlineVariant
  },
  row: {
    flexDirection: 'row',
    padding: spacing.lg,                        // .padding(12.dp)
    alignItems: 'center',
  },
  iconBox: {
    width: 40,                                  // .size(40.dp)
    height: 40,
    borderRadius: borderRadii.md,               // RoundedCornerShape(8.dp)
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.xl,                     // Spacer(16.dp)
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 14,                               // 14.sp
    fontWeight: '700',                          // FontWeight.Bold
    color: lightColors.onSurface,
  },
  amount: {
    fontSize: 14,                               // 14.sp
    fontWeight: '700',                          // FontWeight.Bold
    color: lightColors.onSurface,
    marginLeft: spacing.md,                     // Spacer(8.dp)
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,                      // Spacer(2.dp)
  },
  meta: {
    fontSize: 12,                               // text-xs → 12.sp
    color: lightColors.textSecondary,            // AppTheme.extended.textSecondary
  },
});
