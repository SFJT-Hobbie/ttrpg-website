import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhlfazgdmflcldzojbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobGZhemdkbWZsY2xkem9qYmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzM0OTMsImV4cCI6MjA2MjkwOTQ5M30.FqvgGqUgc4WRDk4s8Geb4TpRoijtxTt0jh--ErrV6qg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);