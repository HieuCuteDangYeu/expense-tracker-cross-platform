/**
 * AppNavigator — lean flow matching the Android NavHost.
 *
 * NO bottom tabs. Pure NativeStackNavigator:
 *   Dashboard (initial) → ProjectDetails → ExpenseDetails
 *                       → AddProject (stack push)
 *                       → AddExpense (modal presentation)
 *
 * All headers styled per theme.ts (primary on surface, no shadow).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lightColors, typography } from '../theme/theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';
import AddExpenseBottomSheet from '../screens/AddExpenseBottomSheet';

// ─── Type Definitions ───────────────────────────────────────────────────────
export type RootStackParamList = {
  Dashboard: undefined;
  ProjectDetails: { projectId: number };
  ExpenseDetails: { expenseId: number; projectId: number };
  AddExpense: { projectId: number; expenseId?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Shared header style from theme.ts ──────────────────────────────────────
const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: lightColors.surface,         // surface = #FFFFFF
  },
  headerTintColor: lightColors.onSurface,          // onSurface = #0F172A
  headerTitleStyle: {
    fontWeight: typography.titleLarge.fontWeight as '700',
    fontSize: 18,
  },
  headerShadowVisible: false,                      // no shadow, matching native
};

// ─── Root Stack Navigator ───────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        ...sharedHeaderOptions,
        contentStyle: {
          backgroundColor: lightColors.background, // background = #F8F9FA
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetailsScreen}
        options={{ title: 'Project Details' }}
      />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: 'Expense Details' }}
      />

      {/* Modal — slides up from bottom, matching ModalBottomSheet */}
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseBottomSheet}
        options={{
          title: 'Add Expense',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: lightColors.surface,
          },
        }}
      />
    </Stack.Navigator>
  );
}
