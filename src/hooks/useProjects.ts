/**
 * useProjects — replaces ProjectViewModel.kt (online-first, no Room).
 *
 * Kotlin logic ported:
 *   - allProjectsWithExpenses → projects + expenses join
 *   - searchQuery + filterState → client-side filtering
 *   - deleteProject(id) → soft-delete via Supabase
 *
 * Exposes: projects, isLoading, error, searchQuery, setSearchQuery, refetch, deleteProject
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Project } from '../types/project';
import type { Expense } from '../types/expense';

export interface ProjectWithExpenses {
  project: Project;
  expenses: Expense[];
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all non-deleted projects (matching ProjectDao.filterProjects)
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('isDeleted', false)
        .order('projectId', { ascending: false });

      if (projError) throw projError;

      // Fetch all non-deleted expenses (matching ExpenseDao.getAllExpenses)
      const { data: expensesData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('isDeleted', false);

      if (expError) throw expError;

      // Group expenses by parentProjectId (matching ProjectWithExpenses relation)
      const expensesByProject = new Map<number, Expense[]>();
      (expensesData || []).forEach((e: Expense) => {
        const list = expensesByProject.get(e.parentProjectId) || [];
        list.push(e);
        expensesByProject.set(e.parentProjectId, list);
      });

      // Build ProjectWithExpenses list
      const result: ProjectWithExpenses[] = (projectsData || []).map(
        (p: Project) => ({
          project: p,
          expenses: expensesByProject.get(p.projectId) || [],
        })
      );

      setProjects(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Client-side search filter (matching ProjectViewModel combine + flatMapLatest)
  const filteredProjects = projects.filter((pw) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pw.project.projectName.toLowerCase().includes(q) ||
      pw.project.description.toLowerCase().includes(q) ||
      pw.project.manager.toLowerCase().includes(q)
    );
  });

  // Soft-delete (matching projectDao.deleteProject which sets isDeleted = true)
  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        const { error: delError } = await supabase
          .from('projects')
          .update({ isDeleted: true })
          .eq('projectId', projectId);

        if (delError) throw delError;

        // Optimistic removal from local state
        setProjects((prev) =>
          prev.filter((pw) => pw.project.projectId !== projectId)
        );
      } catch (err: any) {
        setError(err.message || 'Failed to delete project');
      }
    },
    []
  );

  return {
    projects: filteredProjects,
    allProjects: projects,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: fetchProjects,
    deleteProject,
  };
}
