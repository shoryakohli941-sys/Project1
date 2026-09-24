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
// The URL below points at your local PocketBase server
// (started by running pocketbase.exe in a terminal).
//
// Dev-mode PocketBase allows requests from any origin,
// so pages served by Live Server (a different port) work fine.

window.pb = new PocketBase("http://127.0.0.1:8090");