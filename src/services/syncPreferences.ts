/**
 * Sync preferences — replaces SyncPreferencesManager.kt.
 *
 * The Android app uses SharedPreferences to store lastSyncTimestamp.
 * This uses AsyncStorage as the React Native equivalent.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = 'last_sync_timestamp';

export async function getLastSyncTimestamp(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

export async function setLastSyncTimestamp(timestamp: string): Promise<void> {
  return AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
}

export async function clearLastSyncTimestamp(): Promise<void> {
  return AsyncStorage.removeItem(LAST_SYNC_KEY);
}
