
import { createClient } from '@supabase/supabase-js';

// Supabase public anon key is safe to include in client-side code
const supabaseUrl = 'https://mwytkzzzvtdwsscmxqgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eXRrenp6dnRkd3NzY214cWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1OTY0NjYsImV4cCI6MjA1ODE3MjQ2Nn0.oOPdN64DZ922AaKoboxPrewrETh9MbAygoH5EooVk_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
