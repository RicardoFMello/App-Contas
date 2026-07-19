// ============================================================
// CONFIG: Supabase
// Preencha com os dados do seu projeto (Supabase → Project Settings → API)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hnvupzrbszhsoncyzdzv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_f8DyXvbhuYn3VLd0Xe9AvA_6SmtGt6Q';

if (SUPABASE_URL.startsWith('COLOQUE_AQUI')) {
  console.warn(
    '[config/supabase.js] Configure SUPABASE_URL e SUPABASE_ANON_KEY antes de usar o app.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
