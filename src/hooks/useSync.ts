/**
 * Placeholder for useSync hook — will replace SyncViewModel.kt.
 *
 * Responsibilities from Android:
 *   - syncStatus: Idle | Syncing | Success | Error
 *   - lastSyncTime (from SyncPreferencesManager)
 *   - triggerSync()
 *   - Push local → Supabase, Pull Supabase → local
 *   - Handle soft-deleted items
 */
export function useSync() {
  // TODO: Implement with Supabase JS client
  return {
    syncStatus: 'idle' as const,
    lastSyncTime: null as string | null,
    triggerSync: () => {},
  };
}
