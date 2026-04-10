/**
 * ProjectDetailsScreen — mirrors ProjectDetailsScreen.kt exactly.
 *
 * Layout from Kotlin:
 *   Scaffold(FAB = Add Expense)
 *     Column(fillMaxSize)
 *       Surface(header, color=surface)
 *         Column(padding 16/0/16/16)
 *           Text(projectName, 24.sp, Bold, primary)
 *           Text("Project ID: PRJ-XXXX", 14.sp, textSecondary)
 *           Spacer(8.dp)
 *           Surface(Budget Summary Box, rounded=12, primary/5% bg, primary/10% border)
 *             Column(padding=16)
 *               Row(SpaceBetween, Bottom)
 *                 Column: "TOTAL SPENT"(12.sp lbl) + amount(24.sp Bold primary)
 *                 Column(End): "BUDGET"(12.sp lbl) + amount(18.sp Med onSurfaceVariant)
 *               Spacer(8.dp)
 *               ProgressBar(10.dp height, primary)
 *               Text("X% of budget used", 12.sp, End, textSecondary)
 *       Column(padding=24)
 *         Row("Recent Transactions" + "View All" primary)
 *         Spacer(16.dp)
 *         LazyColumn(spacedBy=12) → ExpenseItemCard items
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
  const { expenses, project, isLoading, refetch } = useExpenses(projectId);

  // Refetch when screen regains focus (after add/edit/delete in other screens)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Budget calculations (matching Kotlin logic)
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = project?.budget ?? 0;
  const progress = budget > 0 ? Math.min(totalSpent / budget, 1) : 0;
  const percentage = Math.round(progress * 100);

  // Navigate to expense details
  const handleExpensePress = useCallback(
    (expenseId: number) => {
      navigation.navigate('ExpenseDetails', { expenseId, projectId });
    },
    [navigation, projectId]
  );

  // Navigate to AddExpense modal
  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', { projectId });
  }, [navigation, projectId]);

  if (isLoading && !project) {
    return <FullScreenLoadingIndicator />;
  }

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

  // Sort expenses by date descending (matching Kotlin .sortedByDescending { it.date })
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
            {/* ─── Header Section ─── */}
            {/* Surface(color=surface) → Column(padding 16/0/16/16) */}
            <View style={styles.headerSurface}>
              <Text style={styles.projectName}>{project.projectName}</Text>
              <Text style={styles.projectIdText}>
                Project ID: {getFormattedProjectId(project.projectId)}
              </Text>

              {/* ─── Budget Summary Box ─── */}
              {/* Surface(rounded=12, primary/5% bg, primary/10% border) */}
              <View style={styles.budgetBox}>
                <View style={styles.budgetRow}>
                  {/* Left: TOTAL SPENT */}
                  <View>
                    <Text style={styles.budgetLabel}>TOTAL SPENT</Text>
                    <Text style={styles.budgetAmountPrimary}>
                      {formatCurrency(totalSpent)}
                    </Text>
                  </View>
                  {/* Right: BUDGET */}
                  <View style={styles.budgetRight}>
                    <Text style={styles.budgetLabel}>BUDGET</Text>
                    <Text style={styles.budgetAmountSecondary}>
                      {formatCurrency(budget)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar (10.dp height) */}
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

            {/* ─── Recent Transactions Header ─── */}
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

      {/* ─── FAB ─── */}
      {/* FloatingActionButton(primary, onPrimary, CircleShape) */}
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
    paddingTop: 0,                     // top=0.dp
    paddingBottom: spacing.xl,         // bottom=16.dp
    paddingHorizontal: spacing.xxl,
  },

  projectName: {
    fontSize: 24,                      // 24.sp
    fontWeight: '700',                 // FontWeight.Bold
    color: lightColors.primary,        // primary
  },

  projectIdText: {
    fontSize: 14,                      // 14.sp
    color: lightColors.textSecondary,  // textSecondary
    marginTop: 4,                      // .padding(top = 4.dp)
  },

  // Budget Summary Box
  budgetBox: {
    marginTop: spacing.md,             // Spacer(8.dp)
    backgroundColor: 'rgba(47, 62, 70, 0.05)', // primary.copy(alpha = 0.05f)
    borderWidth: 1,
    borderColor: 'rgba(47, 62, 70, 0.1)',      // primary.copy(alpha = 0.1f)
    borderRadius: borderRadii.lg,               // RoundedCornerShape(12.dp)
    padding: spacing.xl,                         // .padding(16.dp)
  },

  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',            // verticalAlignment = Bottom
  },

  budgetRight: {
    alignItems: 'flex-end',            // horizontalAlignment = End
  },

  budgetLabel: {
    fontSize: 12,                      // 12.sp
    fontWeight: '600',                 // FontWeight.SemiBold
    color: lightColors.textSecondary,  // textSecondary
    letterSpacing: 0.5,                // 0.5.sp
  },

  budgetAmountPrimary: {
    fontSize: 24,                      // 24.sp
    fontWeight: '700',                 // FontWeight.Bold
    color: lightColors.primary,
  },

  budgetAmountSecondary: {
    fontSize: 18,                      // 18.sp
    fontWeight: '500',                 // FontWeight.Medium
    color: lightColors.onSurfaceVariant,
  },

  // Progress bar (10.dp height, CircleShape)
  progressTrack: {
    width: '100%',
    height: 10,                        // .height(10.dp)
    backgroundColor: lightColors.surfaceVariant,
    borderRadius: borderRadii.full,    // CircleShape
    marginTop: spacing.md,             // Spacer(8.dp)
    overflow: 'hidden',
  },

  progressFill: {
    height: 10,
    borderRadius: borderRadii.full,
  },

  budgetPercentText: {
    fontSize: 12,                      // 12.sp
    color: lightColors.textSecondary,
    textAlign: 'right',                // .align(End)
    marginTop: spacing.md,             // .padding(top = 8.dp)
  },

  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,         // Spacer(16.dp)
    paddingHorizontal: spacing.xxl,
  },

  transactionsTitle: {
    fontSize: 18,                      // 18.sp
    fontWeight: '700',                 // FontWeight.Bold
    color: lightColors.onSurface,
  },

  viewAllText: {
    fontSize: 14,                      // 14.sp
    fontWeight: '600',                 // FontWeight.SemiBold
    color: lightColors.primary,
  },

  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },

  // FAB (matching FloatingActionButton)
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,                  // CircleShape
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
