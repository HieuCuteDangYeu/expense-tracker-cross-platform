/**
 * useExpenses — replaces ExpenseViewModel.kt data-fetching logic (online-first).
 *
 * Kotlin logic ported:
 *   - projectDetails (flatMapLatest projectId → getProjectWithExpenses)
 *   - allExpenses (from expenseDao.getAllExpenses)
 *   - saveExpense (insert or update via DAO)
 *   - deleteExpense (soft-delete)
 *
 * Exposes: expenses, project, isLoading, error, addExpense, updateExpense, deleteExpense, refetch
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Expense } from '../types/expense';
import type { Project } from '../types/project';

export function useExpenses(projectId?: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch project (matching projectDao.getProjectWithExpenses)
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('projectId', projectId)
        .single();

      if (projErr) throw projErr;
      setProject(projData as Project);

      // Fetch expenses for this project (matching the @Relation query)
      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('parentProjectId', projectId)
        .eq('isDeleted', false)
        .order('date', { ascending: false });

      if (expErr) throw expErr;
      setExpenses((expData as Expense[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Insert expense (matching expenseDao.insertExpense)
  const addExpense = useCallback(
    async (expense: Omit<Expense, 'expenseId'>) => {
      try {
        const { data, error: insertErr } = await supabase
          .from('expenses')
          .insert(expense)
          .select()
          .single();

        if (insertErr) throw insertErr;

        // Optimistic add
        setExpenses((prev) => [data as Expense, ...prev]);
        return data as Expense;
      } catch (err: any) {
        setError(err.message || 'Failed to add expense');
        return null;
      }
    },
    []
  );

  // Update expense (matching expenseDao.updateExpense)
  const updateExpense = useCallback(
    async (expenseId: number, updates: Partial<Expense>) => {
      try {
        const { data, error: updateErr } = await supabase
          .from('expenses')
          .update(updates)
          .eq('expenseId', expenseId)
          .select()
          .single();

        if (updateErr) throw updateErr;

        // Optimistic update
        setExpenses((prev) =>
          prev.map((e) => (e.expenseId === expenseId ? (data as Expense) : e))
        );
        return data as Expense;
      } catch (err: any) {
        setError(err.message || 'Failed to update expense');
        return null;
      }
    },
    []
  );

  // Soft-delete (matching expenseDao.deleteExpense → isDeleted = true)
  const deleteExpense = useCallback(
    async (expenseId: number) => {
      try {
        const { error: delErr } = await supabase
          .from('expenses')
          .update({ isDeleted: true })
          .eq('expenseId', expenseId);

        if (delErr) throw delErr;

        setExpenses((prev) => prev.filter((e) => e.expenseId !== expenseId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete expense');
      }
    },
    []
  );

  return {
    expenses,
    project,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
