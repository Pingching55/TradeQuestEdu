import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT CREDENTIALS
// If using a build tool like Vite/CRA, use process.env.REACT_APP_...
const supabaseUrl = process.env.SUPABASE_URL || 'https://uxhiofrvktfnailidjfm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aGlvZnJ2a3RmbmFpbGlkamZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODQ5NDksImV4cCI6MjA4MDE2MDk0OX0.TVYLIj2Uehi7P78Zznbi2OreIjXZ7_C6Xh0fpCEhFSA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
