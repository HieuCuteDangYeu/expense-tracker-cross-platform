/**
 * useExpenses — Custom hook for managing project-specific expenses via Supabase.
 * Handles fetching, creating, updating, and deleting expenses, as well as
 * receipt image uploads to cloud storage.
 *
 * All IDs are UUID strings to ensure cross-platform compatibility.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../services/supabase';
import { File as ExpoFile } from 'expo-file-system';
import type { Expense } from '../types/expense';
import type { Project } from '../types/project';
import { mapExpenseFromDB, mapExpenseToDB, mapProjectFromDB } from '../utils/mapper';

export function useExpenses(projectId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch associated project metadata
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projErr) throw projErr;
      setProject(mapProjectFromDB(projData));

      // Fetch all expenses linked to this project, ordered by date (newest first)
      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false });

      if (expErr) throw expErr;
      setExpenses((expData || []).map(mapExpenseFromDB));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Insert a new expense record into the cloud database
  const addExpense = useCallback(
    async (expense: Omit<Expense, 'expenseId' | 'isDeleted'>): Promise<Expense | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const dbExpense = mapExpenseToDB(expense);
        // id is omitted — DB auto-generates via UUID default
        const { data, error: insertErr } = await supabase
          .from('expenses')
          .insert(dbExpense)
          .select()
          .single();

        if (insertErr) throw insertErr;

        const newExpense = mapExpenseFromDB(data);
        // Add to local state immediately
        setExpenses((prev) => [newExpense, ...prev]);
        return newExpense;
      } catch (err: any) {
        const msg = err.message || 'Failed to add expense';
        console.error('[useExpenses] addExpense failed:', msg, err.details || '', err.hint || '');
        setError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Update an existing expense record by ID
  const updateExpense = useCallback(
    async (expenseId: string, updates: Partial<Expense>): Promise<Expense | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const dbUpdates = mapExpenseToDB(updates);
        // Ensure id is NEVER in the update payload — only in the .eq() filter
        delete dbUpdates.id;
        const { data, error: updateErr } = await supabase
          .from('expenses')
          .update(dbUpdates)
          .eq('id', expenseId)
          .select()
          .single();

        if (updateErr) throw updateErr;

        const updatedExpense = mapExpenseFromDB(data);
        // Update the local state immediately with the server's version
        setExpenses((prev) =>
          prev.map((e) => (e.expenseId === expenseId ? updatedExpense : e))
        );
        return updatedExpense;
      } catch (err: any) {
        const msg = err.message || 'Failed to update expense';
        console.error('[useExpenses] updateExpense failed:', msg, err.details || '', err.hint || '');
        setError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Upload receipt image to Supabase Storage
  const uploadReceipt = useCallback(
    async (imageUri: string): Promise<string | null> => {
      try {
        setIsSaving(true);
        setError(null);

        // Generate a unique file path: receipts/{projectId}/{timestamp}.{ext}
        const ext = imageUri.split('.').pop() || 'jpg';
        const filePath = `receipts/${projectId}/${Date.now()}.${ext}`;
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

        // Read file as ArrayBuffer using expo-file-system (SDK 54 API)
        const file = new ExpoFile(imageUri);
        const arrayBuffer = await file.arrayBuffer();

        // Upload directly via fetch (bypasses RN Blob limitation)
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/receipts/${filePath}`;
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': contentType,
          },
          body: arrayBuffer,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errorBody}`);
        }

        // Construct the public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/receipts/${filePath}`;
        return publicUrl;
      } catch (err: any) {
        const msg = err.message || 'Failed to upload receipt';
        console.error('[useExpenses] uploadReceipt failed:', msg, err.details || '', err.hint || '');
        setError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [projectId]
  );

  // Hard-delete expense (DB has no isDeleted column)
  const deleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        setIsSaving(true);
        setError(null);

        const { error: delErr } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId);

        if (delErr) throw delErr;

        // Remove from local state immediately
        setExpenses((prev) => prev.filter((e) => e.expenseId !== expenseId));
      } catch (err: any) {
        const msg = err.message || 'Failed to delete expense';
        console.error('[useExpenses] deleteExpense failed:', msg, err.details || '', err.hint || '');
        setError(msg);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    expenses,
    project,
    isLoading,
    isSaving,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt,
    refetch: fetchExpenses,
  };
}
