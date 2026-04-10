import type { Project } from '../types/project';
import type { Expense } from '../types/expense';

export function mapProjectFromDB(row: any): Project {
  return {
    projectId: Number(row.id),
    projectName: row.project_name || '',
    description: row.description || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    manager: row.manager || '',
    status: row.status || 'Active',
    budget: Number(row.budget) || 0,
    specialRequirements: row.special_requirements || null,
    clientInfo: row.client_info || null,
    priority: 'Medium', // Placeholder since DB doesn't have it
    isDeleted: false, // DB performs hard deletes
    isFavorite: row.is_favorite ?? false,
  };
}

export function mapProjectToDB(project: Partial<Project>): any {
  const dbRecord: any = {};
  if (project.projectName !== undefined) dbRecord.project_name = project.projectName;
  if (project.description !== undefined) dbRecord.description = project.description;
  if (project.startDate !== undefined) dbRecord.start_date = project.startDate;
  if (project.endDate !== undefined) dbRecord.end_date = project.endDate;
  if (project.manager !== undefined) dbRecord.manager = project.manager;
  if (project.status !== undefined) dbRecord.status = project.status;
  if (project.budget !== undefined) dbRecord.budget = project.budget;
  if (project.specialRequirements !== undefined) dbRecord.special_requirements = project.specialRequirements;
  if (project.clientInfo !== undefined) dbRecord.client_info = project.clientInfo;
  if (project.isFavorite !== undefined) dbRecord.is_favorite = project.isFavorite;
  return dbRecord;
}

export function mapExpenseFromDB(row: any): Expense {
  return {
    expenseId: Number(row.id),
    parentProjectId: Number(row.project_id),
    date: row.expense_date || '',
    amount: Number(row.amount) || 0,
    currency: row.currency || 'USD',
    type: row.expense_type || 'Travel',
    paymentMethod: row.payment_method || '',
    claimant: row.claimant || '',
    paymentStatus: row.payment_status || 'Pending',
    description: row.description || null,
    location: row.location || null,
    receiptUrl: row.receiptUrl || row.receipturl || null,
    isDeleted: false,
  };
}

export function mapExpenseToDB(expense: Partial<Expense>): any {
  const dbRecord: any = {};
  // parentProjectId (frontend) → project_id (DB text column)
  if (expense.parentProjectId !== undefined) dbRecord.project_id = String(expense.parentProjectId);
  // date (frontend) → expense_date (DB text column, ISO format YYYY-MM-DD)
  if (expense.date !== undefined) dbRecord.expense_date = String(expense.date);
  // amount — explicitly cast to Number to prevent Supabase numeric type-mismatch
  if (expense.amount !== undefined) dbRecord.amount = Number(expense.amount);
  // currency (frontend) → currency (DB text column)
  if (expense.currency !== undefined) dbRecord.currency = expense.currency;
  // type (frontend category) → expense_type (DB text column)
  if (expense.type !== undefined) dbRecord.expense_type = expense.type;
  // paymentMethod (frontend) → payment_method (DB text column)
  if (expense.paymentMethod !== undefined) dbRecord.payment_method = expense.paymentMethod;
  // claimant (frontend) → claimant (DB text column)
  if (expense.claimant !== undefined) dbRecord.claimant = expense.claimant;
  // paymentStatus (frontend) → payment_status (DB text column)
  if (expense.paymentStatus !== undefined) dbRecord.payment_status = expense.paymentStatus;
  // description (frontend) → description (DB text column, nullable)
  if (expense.description !== undefined) dbRecord.description = expense.description;
  // location (frontend) → location (DB text column, nullable)
  if (expense.location !== undefined) dbRecord.location = expense.location;
  // receiptUrl (frontend) → receiptUrl (DB column is camelCase)
  if (expense.receiptUrl !== undefined) dbRecord['receiptUrl'] = expense.receiptUrl;
  // Note: isDeleted is not mapped — the DB uses hard deletes
  return dbRecord;
}
