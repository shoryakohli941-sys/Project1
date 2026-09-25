// ==========================================
// LINKUP SUPABASE CONFIG
// ==========================================
//
// This file initializes the shared Supabase client used
// across the application.
//
// The Supabase SDK (supabase-js) is loaded via CDN in the HTML
// files before this script runs.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Create a single supabase client for interacting with your database
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
