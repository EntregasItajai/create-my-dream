import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ohrzvcbhbitfgwukhchz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocnp2Y2JoYml0Zmd3dWtoY2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzcyMjcsImV4cCI6MjA4NzM1MzIyN30.rhCKLe3Uj0MkF1EOADCBMTU0EjBJr_YWxp41zsjo1e0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
