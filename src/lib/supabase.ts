
import { createClient } from '@supabase/supabase-js';

// Use the hardcoded values instead of environment variables
const supabaseUrl = "https://hhfbxftaburyxxjcomto.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmJ4ZnRhYnVyeXh4amNvbXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzc5ODAsImV4cCI6MjA2MjgxMzk4MH0.8xs5fpfzdGy8KNHxgDs25GZsuOkn8Mwov8wV-NArZUM";

// Create the Supabase client with explicit persistent sessions and storage configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'gallery-auth',
    storage: localStorage
  }
});
