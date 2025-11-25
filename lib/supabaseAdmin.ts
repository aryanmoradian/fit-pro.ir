
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "https://quniobapknhnqtcerdvf.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzczNTYyMSwiZXhwIjoyMDc5MzExNjIxfQ.cOpsmLLIBMun8Z82S1oStv5s8_0cXkaSu_gvvZhmE-Q";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is missing. Check .env.local");
}

// Admin client with Service Role - bypasses Row Level Security (RLS)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
