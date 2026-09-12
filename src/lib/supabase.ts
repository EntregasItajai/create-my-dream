import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://etkfbliwhmqwfczghknh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wkacjfx6ybMl0JWun_ag4w_Th6P2sMW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
