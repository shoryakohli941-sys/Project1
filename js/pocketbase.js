// ==========================================
// LINKUP POCKETBASE CONFIG
// ==========================================
//
// This file creates ONE shared PocketBase client,
// used by signin.html, login.html, dashboard.html,
// profile.html and any future page.
//
// The PocketBase SDK (pocketbase.umd.js) must load
// BEFORE this file, because it defines the "PocketBase"
// class used below.
//
// ---------------------------------------------------------
// HOSTING POCKETBASE 24/7 FOR VERCEL
// ---------------------------------------------------------
// If you are deploying to Vercel, the local "127.0.0.1" URL
// won't work because Vercel can't talk to your local PC.
//
// Read `HUGGING_FACE_HOSTING_GUIDE.md` for instructions on how
// to get a free 24/7 PocketBase URL from Hugging Face Spaces.
//
// Once you have your live URL, paste it below:
const LIVE_URL = "YOUR_HUGGING_FACE_URL_HERE"; // e.g., "https://yourusername-linkup-db.hf.space"

// If LIVE_URL is set, use it. Otherwise, fallback to local PC for development.
const pocketbaseUrl = LIVE_URL !== "YOUR_HUGGING_FACE_URL_HERE"
    ? LIVE_URL
    : "http://127.0.0.1:8090";

window.pb = new PocketBase(pocketbaseUrl);