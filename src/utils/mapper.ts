/**
 * Data transformation layer for mapping between Supabase database models
 * and the application's clean domain entities.
 */
import type { Project } from '../types/project';
import type { Expense } from '../types/expense';

/**
 * Transforms a raw project row from Supabase into a typed Project entity.
 */
export function mapProjectFromDB(row: any): Project {
  return {
    projectId: String(row.id),
    projectName: row.project_name || '',
    description: row.description || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    manager: row.manager || '',
    status: row.status || 'Active',
    budget: Number(row.budget) || 0,
    specialRequirements: row.special_requirements || null,
    clientInfo: row.client_info || null,
    priority: 'Medium', // Default placeholder for UI display
    isDeleted: false, 
    isFavorite: row.is_favorite ?? false,
  };
}

/**
 * Transforms a partial Project entity into a payload suitable for Supabase insertion or updates.
 */
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

/**
 * Transforms a raw expense row from Supabase into a typed Expense entity.
 */
export function mapExpenseFromDB(row: any): Expense {
  return {
    expenseId: String(row.id),
    parentProjectId: String(row.project_id),
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
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Transforms an Expense entity into a database-ready record,
 * ensuring proper format conversions for currency, dates, and relationships.
 */
export function mapExpenseToDB(expense: Partial<Expense>): any {
  const dbRecord: any = {};
  
  if (expense.parentProjectId !== undefined) dbRecord.project_id = String(expense.parentProjectId);
  
  // Format date to ISO YYYY-MM-DD for database consistency
  if (expense.date !== undefined) {
    const raw = String(expense.date);
    dbRecord.expense_date = raw.length > 10 ? raw.slice(0, 10) : raw;
  }
  
  if (expense.amount !== undefined) dbRecord.amount = Number(expense.amount);
  if (expense.currency !== undefined) dbRecord.currency = expense.currency;
  if (expense.type !== undefined) dbRecord.expense_type = expense.type;
  if (expense.paymentMethod !== undefined) dbRecord.payment_method = expense.paymentMethod;
  if (expense.claimant !== undefined) dbRecord.claimant = expense.claimant;
  if (expense.paymentStatus !== undefined) dbRecord.payment_status = expense.paymentStatus;
  if (expense.description !== undefined) dbRecord.description = expense.description;
  if (expense.location !== undefined) dbRecord.location = expense.location;
  if (expense.receiptUrl !== undefined) dbRecord['receiptUrl'] = expense.receiptUrl;

  // Clean up internal keys before sending to database
  delete dbRecord.id;
  delete dbRecord.expenseId;
  delete dbRecord.isDeleted;
  delete dbRecord.is_deleted;

  return dbRecord;
}
