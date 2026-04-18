/**
 * ProjectDetailsScreen — Detailed view of a specific project.
 * Displays project identity, a visual budget summary with progress tracking,
 * and a scrollable list of recent transactions.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/formatUtils';
import { getFormattedProjectId } from '../types/project';
import ExpenseItemCard from '../components/ExpenseItemCard';
import EmptyStateMessage from '../components/EmptyStateMessage';
import FullScreenLoadingIndicator from '../components/FullScreenLoadingIndicator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetails'>;

export default function ProjectDetailsScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  
  // Fetch specific project data and its associated expense list
  const { expenses, project, isLoading, refetch } = useExpenses(projectId);

  /**
   * Ensure data is synchronized when the screen is focused.
   */
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  /**
   * Budget and Progress Calculations
   * Derived from aggregated expense amounts vs project budget.
   */
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = project?.budget ?? 0;
  const progress = budget > 0 ? Math.min(totalSpent / budget, 1) : 0;
  const percentage = Math.round(progress * 100);

  /**
   * Navigation handler for drill-down into expense details.
   */
  const handleExpensePress = useCallback(
    (expenseId: string) => {
      navigation.navigate('ExpenseDetails', { expenseId, projectId });
    },
    [navigation, projectId]
  );

  /**
   * Open the 'Add Expense' modal contextually for the current project.
   */
  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', { projectId });
  }, [navigation, projectId]);

  // Initial loading guard to prevent flashing empty UI
  if (isLoading && !project) {
    return <FullScreenLoadingIndicator />;
  }

  // Error boundary for missing project entries
  if (!project) {
    return (
      <View style={styles.container}>
        <EmptyStateMessage
          title="Project not found"
          iconName="error-outline"
        />
      </View>
    );
  }

  // Sort transactions chronologically (newest first) for consistent display
  const sortedExpenses = [...expenses].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={sortedExpenses}
        keyExtractor={(item) => String(item.expenseId)}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={lightColors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Project Header and Identity */}
            <View style={styles.headerSurface}>
              <Text style={styles.projectName}>{project.projectName}</Text>
              <Text style={styles.projectIdText}>
                Project ID: {getFormattedProjectId(project.projectId)}
              </Text>

              {/* Visual Budget Summary Card */}
              <View style={styles.budgetBox}>
                <View style={styles.budgetRow}>
                  {/* Expense Accumulation Display */}
                  <View>
                    <Text style={styles.budgetLabel}>TOTAL SPENT</Text>
                    <Text style={styles.budgetAmountPrimary}>
                      {formatCurrency(totalSpent)}
                    </Text>
                  </View>
                  {/* Allocated Budget Display */}
                  <View style={styles.budgetRight}>
                    <Text style={styles.budgetLabel}>BUDGET</Text>
                    <Text style={styles.budgetAmountSecondary}>
                      {formatCurrency(budget)}
                    </Text>
                  </View>
                </View>

                {/* Progress Tracking Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: lightColors.primary,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.budgetPercentText}>
                  {percentage}% of budget used
                </Text>
              </View>
            </View>

            {/* Transaction List Context Header */}
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.xxl }}>
            <EmptyStateMessage
              title="No expenses yet"
              description="Add your first expense to this project"
              iconName="receipt-long"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.xxl }}>
            <ExpenseItemCard
              expense={item}
              onPress={() => handleExpensePress(item.expenseId)}
            />
          </View>
        )}
      />

      {/* Primary Action Button (Add Expense) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleAddExpense}
      >
        <MaterialIcons name="add" size={24} color={lightColors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  headerSurface: {
    backgroundColor: lightColors.background,
    paddingTop: 0,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.primary,
  },
  projectIdText: {
    fontSize: 14,
    color: lightColors.textSecondary,
    marginTop: 4,
  },
  budgetBox: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(47, 62, 70, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(47, 62, 70, 0.1)',
    borderRadius: borderRadii.lg,
    padding: spacing.xl,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  budgetRight: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.textSecondary,
    letterSpacing: 0.5,
  },
  budgetAmountPrimary: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.primary,
  },
  budgetAmountSecondary: {
    fontSize: 18,
    fontWeight: '500',
    color: lightColors.onSurfaceVariant,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: lightColors.surfaceVariant,
    borderRadius: borderRadii.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: borderRadii.full,
  },
  budgetPercentText: {
    fontSize: 12,
    color: lightColors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.md,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.onSurface,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.primary,
  },
  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
