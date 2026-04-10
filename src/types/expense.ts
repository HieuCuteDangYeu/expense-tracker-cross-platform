/**
 * TypeScript interface matching ExpenseEntity.kt exactly.
 * Maps 1:1 to the Android Room entity and the Supabase "expenses" table.
 */
export interface Expense {
  expenseId: number;
  parentProjectId: number;
  date: string;
  amount: number;
  currency: string;
  type: ExpenseType | string;
  paymentMethod: string;
  claimant: string;
  paymentStatus: PaymentStatus | string;
  description: string | null;
  location: string | null;
  receiptUrl: string | null;
  updatedAt?: string;
}

/**
 * Known expense types from the Android app's ExpenseUiUtils.kt.
 */
export type ExpenseType =
  | 'Travel'
  | 'Equipment'
  | 'Materials'
  | 'Services'
  | 'Software'
  | 'Labour'
  | 'Utilities'
  | 'Misc';

/**
 * Known payment statuses from the Android app.
 */
export type PaymentStatus = 'Paid' | 'Pending' | 'Reimbursed';

/**
 * Mirrors ProjectWithExpenses.kt — a project with its child expenses.
 */
export interface ProjectWithExpenses {
  project: import('./project').Project;
  expenses: Expense[];
}

/**
 * Mirrors ExpenseByType.kt — aggregation result for insights.
 */
export interface ExpenseByType {
  type: string;
  totalAmount: number;
}
