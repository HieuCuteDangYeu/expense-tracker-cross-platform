/**
 * useProjects — Custom hook for managing the global project list and associated expenses.
 * Implements complex client-side filtering, searching, and optimistic UI updates
 * for project favorites.
 */
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

      // Fetch all active projects from Supabase, sorted by creation date (newest first)
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projError) throw projError;

      // Fetch all expenses to allow for project-level aggregate calculations
      const { data: expensesDataRaw, error: expError } = await supabase
        .from('expenses')
        .select('*');

      if (expError) throw expError;

      const expensesData = (expensesDataRaw || []).map(mapExpenseFromDB);

      // Group expenses by their parent project ID for efficient lookups during project card rendering
      const expensesByProject = new Map<string, Expense[]>();
      (expensesData || []).forEach((e: Expense) => {
        const list = expensesByProject.get(e.parentProjectId) || [];
        list.push(e);
        expensesByProject.set(e.parentProjectId, list);
      });

      // Map raw database rows to the domain ProjectWithExpenses model including nested expense arrays
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

  // Apply client-side search and multi-criteria advanced filtering to the local project state
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

    // 5. Favorites Only Filter
    let matchesFavorites = true;
    if (filterState.favoritesOnly) {
      matchesFavorites = pw.project.isFavorite === true;
    }

    return matchesSearch && matchesStatus && matchesManager && matchesDates && matchesFavorites;
  });

  // Sort: favorites first, then preserve original order
  const sortedFilteredProjects = [...filteredProjects].sort((a, b) => {
    if (a.project.isFavorite && !b.project.isFavorite) return -1;
    if (!a.project.isFavorite && b.project.isFavorite) return 1;
    return 0;
  });



  // Toggle project favorite status with optimistic UI updates to ensure immediate feedback
  const toggleFavorite = useCallback(
    async (projectId: string, currentStatus: boolean) => {
      // Optimistic update
      setProjects((prev) =>
        prev.map((pw) =>
          pw.project.projectId === projectId
            ? {
                ...pw,
                project: { ...pw.project, isFavorite: !currentStatus },
              }
            : pw
        )
      );

      try {
        const { error: favError } = await supabase
          .from('projects')
          .update({ is_favorite: !currentStatus })
          .eq('id', projectId);

        if (favError) throw favError;
      } catch (err: any) {
        // Revert on failure
        setProjects((prev) =>
          prev.map((pw) =>
            pw.project.projectId === projectId
              ? {
                  ...pw,
                  project: { ...pw.project, isFavorite: currentStatus },
                }
              : pw
          )
        );
        setError(err.message || 'Failed to toggle favorite');
      }
    },
    []
  );

  // Permanently delete a project from the cloud database; cascading deletes handle child expenses via DB constraints
  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        setIsLoading(true); // Reusing isLoading for mutation state to prevent flashes
        setError(null);

        const { error: delErr } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (delErr) throw delErr;

        // Remove from local state immediately
        setProjects((prev) => prev.filter((pw) => pw.project.projectId !== projectId));
      } catch (err: any) {
        const msg = err.message || 'Failed to delete project';
        console.error('[useProjects] deleteProject failed:', msg, err.details || '', err.hint || '');
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    projects: sortedFilteredProjects,
    allProjects: projects,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    managers,
    refetch: fetchProjects,
    toggleFavorite,
    deleteProject,
  };
}
