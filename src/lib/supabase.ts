
import { createClient } from '@supabase/supabase-js';

// Supabase public anon key is safe to include in client-side code
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
