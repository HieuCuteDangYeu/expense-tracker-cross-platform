import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Project } from '../types/project';
import type { Expense } from '../types/expense';
import { mapProjectFromDB, mapExpenseFromDB } from '../utils/mapper';
import type { FilterState } from '../components/AdvancedSearchPanel';

export interface ProjectWithExpenses {
  project: Project;
  expenses: Expense[];
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<FilterState>({});

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all non-deleted projects (matching ProjectDao.filterProjects)
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

      if (projError) throw projError;

      // Fetch all non-deleted expenses (matching ExpenseDao.getAllExpenses)
      const { data: expensesDataRaw, error: expError } = await supabase
        .from('expenses')
        .select('*');

      if (expError) throw expError;

      const expensesData = (expensesDataRaw || []).map(mapExpenseFromDB);

      // Group expenses by parentProjectId (matching ProjectWithExpenses relation)
      const expensesByProject = new Map<number, Expense[]>();
      (expensesData || []).forEach((e: Expense) => {
        const list = expensesByProject.get(e.parentProjectId) || [];
        list.push(e);
        expensesByProject.set(e.parentProjectId, list);
      });

      // Build ProjectWithExpenses list
      const result: ProjectWithExpenses[] = (projectsData || []).map((row: any) => {
        const p = mapProjectFromDB(row);
        return {
          project: p,
          expenses: expensesByProject.get(p.projectId) || [],
        };
      });

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

  // Derived list of unique managers for the filter dropdown
  const managers = useMemo(() => {
    const mgrs = projects.map((p) => p.project.manager).filter(Boolean);
    return Array.from(new Set(mgrs));
  }, [projects]);

  // Client-side search and complex filter
  const filteredProjects = projects.filter((pw) => {
    // 1. Text Search filtering
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        pw.project.projectName.toLowerCase().includes(q) ||
        pw.project.description.toLowerCase().includes(q) ||
        pw.project.manager.toLowerCase().includes(q);
    }

    // 2. Advanced Status Filter
    let matchesStatus = true;
    if (filterState.status) {
      matchesStatus = pw.project.status === filterState.status;
    }

    // 3. Advanced Manager Filter
    let matchesManager = true;
    if (filterState.manager) {
      matchesManager = pw.project.manager === filterState.manager;
    }

    // 4. Date Range Filter
    let matchesDates = true;
    if (filterState.startDate || filterState.endDate) {
      const pStart = new Date(pw.project.startDate).getTime();
      const pEnd = new Date(pw.project.endDate).getTime();
      
      const filterStart = filterState.startDate ? new Date(filterState.startDate).getTime() : null;
      const filterEnd = filterState.endDate ? new Date(filterState.endDate).getTime() : null;

      if (filterStart && pStart < filterStart) matchesDates = false;
      if (filterEnd && pEnd > filterEnd) matchesDates = false;
    }

    return matchesSearch && matchesStatus && matchesManager && matchesDates;
  });

  // Soft-delete (matching projectDao.deleteProject which sets isDeleted = true)
  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        const { error: delError } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

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
    filterState,
    setFilterState,
    managers,
    refetch: fetchProjects,
    deleteProject,
  };
}
