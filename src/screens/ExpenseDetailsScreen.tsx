/**
 * ExpenseDetailsScreen — mirrors ExpenseDetailsScreen.kt exactly.
 *
 * Layout from Kotlin (scrollable Column):
 *   Surface(header, centered)
 *     Column(padding=24, centered)
 *       Box(56.dp, CircleShape, typeColor bg) → Icon(28.dp)
 *       Spacer(16)
 *       Text(amount, 36.sp Bold)
 *       Spacer(8)
 *       StatusBadge(12.sp, h=16, v=4)
 *   Spacer(8)
 *   Surface(detail card)
 *     Column(padding=24)
 *       DetailRow("Category", type)
 *       Divider / DetailRow("Date", date)
 *       Divider / DetailRow("Location", location) [optional]
 *       Divider / DetailRow("Payment Method", "Paid via X")
 *       Divider / DetailRow("Claimant", claimant)
 *   [if description] Surface → Column(padding=24): Title + desc text
 *   [if receipt]     Surface → Column(padding=24): Title + Image(220.dp, rounded=12)
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrencyDetailed } from '../utils/formatUtils';
import { getIconAndColorsForType } from '../utils/expenseUiUtils';
import StatusBadge from '../components/StatusBadge';
import FullScreenLoadingIndicator from '../components/FullScreenLoadingIndicator';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetails'>;

export default function ExpenseDetailsScreen({ navigation, route }: Props) {
  const { expenseId, projectId } = route.params;
  const { expenses, deleteExpense } = useExpenses(projectId);

  // Find the specific expense
  const expense = expenses.find((e) => e.expenseId === expenseId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Add header buttons (Edit + Delete)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={() => {/* TODO: trigger edit */}}>
            <MaterialIcons name="edit" size={22} color={lightColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDeleteDialog(true)}>
            <MaterialIcons name="delete" size={22} color={lightColors.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    await deleteExpense(expenseId);
    navigation.goBack();
  }, [deleteExpense, expenseId, navigation]);

  if (!expense) {
    return <FullScreenLoadingIndicator />;
  }

  const { iconName, bgColor, tintColor } = getIconAndColorsForType(expense.type);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── Amount Header ─── */}
        {/* Surface(color=surface) → Column(padding=24, centered) */}
        <View style={styles.headerSurface}>
          {/* Category icon pill — Box(56.dp, CircleShape, bgColor) */}
          <View style={[styles.categoryIcon, { backgroundColor: bgColor }]}>
            <MaterialIcons
              name={iconName as keyof typeof MaterialIcons.glyphMap}
              size={28}
              color={tintColor}
            />
          </View>

          {/* Amount — 36.sp Bold onSurface */}
          <Text style={styles.amount}>
            {formatCurrencyDetailed(expense.amount, expense.currency)}
          </Text>

          {/* StatusBadge(12.sp, h=16, v=4) */}
          <StatusBadge
            status={expense.paymentStatus}
            fontSize={12}
            horizontalPadding={16}
            verticalPadding={4}
          />
        </View>

        {/* ─── Details Card ─── */}
        {/* Surface(color=surface) → Column(padding=24) */}
        <View style={styles.detailsCard}>
          <DetailRow label="Category" value={expense.type} />
          <View style={styles.divider} />
          <DetailRow label="Date" value={expense.date} />
          <View style={styles.divider} />

          {expense.location ? (
            <>
              <DetailRow label="Location" value={expense.location} />
              <View style={styles.divider} />
            </>
          ) : null}

          <DetailRow
            label="Payment Method"
            value={`Paid via ${expense.paymentMethod}`}
          />
          <View style={styles.divider} />
          <DetailRow label="Claimant" value={expense.claimant} />
        </View>

        {/* ─── Description Section ─── */}
        {expense.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{expense.description}</Text>
          </View>
        ) : null}

        {/* ─── Receipt Section ─── */}
        {expense.receiptUrl ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <Image
              source={{ uri: expense.receiptUrl }}
              style={styles.receiptImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Expense"
        message="Are you sure you want to permanently delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        onDismiss={() => setShowDeleteDialog(false)}
      />
    </>
  );
}

/** DetailRow — matching the private DetailRow composable */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },

  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Amount header — Surface(color=surface), Column(padding=24, centered)
  headerSurface: {
    backgroundColor: lightColors.surface,
    padding: spacing.xxl,               // .padding(24.dp)
    alignItems: 'center',
  },

  // Box(56.dp, CircleShape, bgColor)
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,                   // CircleShape
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,           // Spacer(16.dp)
  },

  // 36.sp Bold onSurface
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: lightColors.onSurface,
    marginBottom: spacing.md,           // Spacer(8.dp)
  },

  // Details card
  detailsCard: {
    backgroundColor: lightColors.surface,
    marginTop: spacing.md,              // Spacer(8.dp)
    padding: spacing.xxl,               // .padding(24.dp)
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 14,                        // 14.sp
    color: lightColors.textSecondary,    // textSecondary
  },

  detailValue: {
    fontSize: 14,                        // 14.sp
    fontWeight: '500',                   // FontWeight.Medium
    color: lightColors.onSurface,
  },

  // HorizontalDivider(padding vertical=12.dp, outlineVariant)
  divider: {
    height: 1,
    backgroundColor: lightColors.outlineVariant,
    marginVertical: spacing.lg,          // padding(vertical = 12.dp)
  },

  // Description / Receipt cards
  sectionCard: {
    backgroundColor: lightColors.surface,
    marginTop: spacing.md,               // Spacer(8.dp)
    padding: spacing.xxl,               // .padding(24.dp)
  },

  sectionTitle: {
    fontSize: 16,                        // 16.sp
    fontWeight: '700',                   // FontWeight.Bold
    color: lightColors.onSurface,
    marginBottom: spacing.md,            // Spacer(8.dp)
  },

  descriptionText: {
    fontSize: 14,                        // 14.sp
    color: lightColors.textSecondary,
    lineHeight: 22,                      // 22.sp
  },

  // AsyncImage(crop, fillMaxWidth, height=220, clip=12.dp)
  receiptImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadii.lg,        // RoundedCornerShape(12.dp)
    marginTop: spacing.lg,              // Spacer(12.dp)
  },
});
