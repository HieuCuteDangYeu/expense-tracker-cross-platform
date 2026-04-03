/**
 * TypeScript interface matching ProjectEntity.kt exactly.
 * Maps 1:1 to the Android Room entity and the Supabase "projects" table.
 */
export interface Project {
  projectId: number;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: string;
  status: 'Active' | 'Completed' | 'On Hold' | string;
  budget: number;
  specialRequirements: string | null;
  clientInfo: string | null;
  priority: 'Low' | 'Medium' | 'High' | string;
  isDeleted: boolean;
}

/**
 * Computed property matching ProjectEntity.kt's `formattedId`.
 */
export function getFormattedProjectId(projectId: number): string {
  return `PRJ-${String(projectId).padStart(4, '0')}`;
}
