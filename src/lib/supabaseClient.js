import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // သင့် Supabase URL
const supabaseAnonKey = 'your-anon-key'; // သင့် Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
