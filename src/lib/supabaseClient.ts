import { createClient } from "@supabase/supabase-js";

// Fallback credentials to ensure the app runs even if .env loading fails
const FALLBACK_URL = "https://quniobapknhnqtcerdvf.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmlvYmFwa25obnF0Y2VyZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzU2MjEsImV4cCI6MjA3OTMxMTYyMX0.oyb0AuLBeYSwjailvnzE2-79nMw1-Mcy5soRqkTNm7U";

// Check for Next.js prefix, then Create React App prefix, then Fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables (URL or Anon Key) are missing. Please check .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
