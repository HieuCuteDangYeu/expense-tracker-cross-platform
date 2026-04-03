/**
 * Supabase client — replaces SupabaseClient.kt + ApiService.kt.
 *
 * Android uses:
 *   createSupabaseClient(BuildConfig.SUPABASE_URL, BuildConfig.SUPABASE_ANON_KEY)
 *     install(Postgrest)
 *     install(Storage)
 *
 * JS equivalent: createClient with postgrest + storage built-in.
 *
 * TODO: Replace with your actual values (or use env vars).
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://hljpelktlxcngxlwgyak.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsanBlbGt0bHhjbmd4bHdneWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzc3ODUsImV4cCI6MjA4ODYxMzc4NX0.iqqZMJMXtmlvye-Z6gOPNUiKWRAHp3pOC7D_O9GVIpU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
