/**
 * Date utility functions — replaces DateUtils.kt.
 */

/**
 * Formats a date string for display (e.g., "Mar 15, 2026").
 */
export function formatDateDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a date to ISO string for storage (e.g., "2026-03-15").
 */
export function formatDateForStorage(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Returns today's date formatted for storage.
 */
export function getTodayFormatted(): string {
  return formatDateForStorage(new Date());
}
