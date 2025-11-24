
import { createClient } from "@supabase/supabase-js";

// Supabase Project Credentials
const supabaseUrl = "https://quniobapknhnqtcerdvf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmlvYmFwa25obnF0Y2VyZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzU2MjEsImV4cCI6MjA3OTMxMTYyMX0.oyb0AuLBeYSwjailvnzE2-79nMw1-Mcy5soRqkTNm7U";

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseKey);
