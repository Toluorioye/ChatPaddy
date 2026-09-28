import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Read credentials from env and sanitize URL (strip any trailing /rest/v1 or slashes)
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Check if valid URL was provided (not empty and not placeholder)
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  envUrl.startsWith('https://') &&
  !envUrl.includes('your-project') &&
  !envAnonKey.includes('your-anon')
);

const fallbackUrl = envUrl || 'https://placeholder.supabase.co';
const fallbackKey = envAnonKey || 'placeholder-anon-key';

export const supabase: SupabaseClient<Database> = createClient<Database>(fallbackUrl, fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
