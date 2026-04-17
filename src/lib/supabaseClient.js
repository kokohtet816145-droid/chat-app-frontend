import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iztgfxzxlzztitgtxlms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dGdmeHp4bHp6dGl0Z3R4bG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzQyNjgsImV4cCI6MjA5MTg1MDI2OH0.u_QhXNlDx_QVKGmm4JE4PPI4ZA_bBQKV9Y5Jq0DYBy4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
