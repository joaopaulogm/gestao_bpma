
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://oiwwptnqaunsyhpkwbrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE';

export const supabase = createClient(supabaseUrl, supabaseKey);
