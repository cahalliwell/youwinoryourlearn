import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://cvowwctcpepbctokktpn.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2b3d3Y3RjcGVwYmN0b2trdHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTYyMjIsImV4cCI6MjA3NjI5MjIyMn0.eOJ1Y7c5aBtf64sEXnO1G7z3YQAOhJNUqPfuLcjdNFw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
