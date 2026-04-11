/**
 * TypeScript interface matching ProjectEntity.kt exactly.
 * Maps 1:1 to the Android Room entity and the Supabase "projects" table.
 *
 * IDs are strings (UUIDs) to match the native Android app and Supabase schema.
 */
export interface Project {
  projectId: string;
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
  isFavorite: boolean;
}

/**
 * Formats a project ID for display.
 * For UUIDs, shows a shortened version; for numeric IDs, pads to 4 digits.
 */
export function getFormattedProjectId(projectId: string): string {
  // If it looks like a UUID, show the first 8 chars
  if (projectId.includes('-')) {
    return `PRJ-${projectId.slice(0, 8).toUpperCase()}`;
  }
  // Legacy numeric IDs — pad to 4 digits
  return `PRJ-${projectId.padStart(4, '0')}`;
}
