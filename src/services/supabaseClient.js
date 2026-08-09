import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://havlcqnaupruxxpreyxo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_De5aAeVkq3bxrtMzc0R44w_nS7HtMvf';

export const supabase = createClient(supabaseUrl, supabaseKey);
