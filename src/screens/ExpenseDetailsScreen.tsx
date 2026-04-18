/**
 * ExpenseDetailsScreen — Detailed view for an individual expense transaction.
 * Displays financial data (amount, currency), status badges, and comprehensive metadata
 * including location, payment method, claimant, and receipts.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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

  /**
   * Data Layer Interface
   * Uses the centralized useExpenses hook to manage transaction state.
   */
  const { expenses, deleteExpense, refetch } = useExpenses(projectId);

  /**
   * Lifecycle Management
   * Triggers a refetch when returning to this screen from an edit action.
   */
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  /**
   * Primary Identification
   * Locates the specific transaction from the cached or fetched expense list.
   */
  const expense = expenses.find((e) => e.expenseId === expenseId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Navigation Header Configuration
   * Dynamically injects context-aware action buttons (Edit/Delete).
   */
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddExpense', {
                projectId,
                expenseId,
              })
            }
          >
            <MaterialIcons name="edit" size={22} color={lightColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowDeleteDialog(true)}
          >
            <MaterialIcons name="delete" size={22} color={lightColors.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, projectId, expenseId]);

  /**
   * Persistent Storage Deletion
   * Executes the deletion via the service layer and rolls back navigation.
   */
  const handleDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    await deleteExpense(expenseId);
    navigation.goBack();
  }, [deleteExpense, expenseId, navigation]);

  if (!expense) {
    return <FullScreenLoadingIndicator />;
  }

  // Visual configuration based on expense category
  const { iconName, bgColor, tintColor } = getIconAndColorsForType(expense.type);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transaction Identity and Financial Header */}
        <View style={styles.headerSurface}>
          {/* Categorical Visual Pill */}
          <View style={[styles.categoryIcon, { backgroundColor: bgColor }]}>
            <MaterialIcons
              name={iconName as keyof typeof MaterialIcons.glyphMap}
              size={28}
              color={tintColor}
            />
          </View>

          {/* Primary Financial Figure */}
          <Text style={styles.amount}>
            {formatCurrencyDetailed(expense.amount, expense.currency)}
          </Text>

          {/* Verification / Payment Status */}
          <StatusBadge
            status={expense.paymentStatus}
            fontSize={12}
            horizontalPadding={16}
            verticalPadding={4}
          />
        </View>

        {/* Structured Metadata Layer */}
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

        {/* Descriptive Narrative (Optional) */}
        {expense.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{expense.description}</Text>
          </View>
        ) : null}

        {/* Proof of Transaction (Optional) */}
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

      {/* Confirmation Workflow for Destructive Actions */}
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

/** 
 * DetailRow — Sub-component for consistent metadata labeling and value pairing.
 */
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
  headerSurface: {
    backgroundColor: lightColors.surface,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: lightColors.onSurface,
    marginBottom: spacing.md,
  },
  detailsCard: {
    backgroundColor: lightColors.surface,
    marginTop: spacing.md,
    padding: spacing.xxl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: lightColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: lightColors.outlineVariant,
    marginVertical: spacing.lg,
  },
  sectionCard: {
    backgroundColor: lightColors.surface,
    marginTop: spacing.md,
    padding: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: lightColors.onSurface,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    color: lightColors.textSecondary,
    lineHeight: 22,
  },
  receiptImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadii.lg,
    marginTop: spacing.lg,
  },
});
