// ==========================================
// LINKUP AUTH GUARD
// ==========================================
//
// Shared helpers for private pages
// (dashboard, profile, discover, ...).
//
// requireSession():
//   - Checks whether a user is logged in.
//   - If not, redirects to login.html and
//     returns null (page should stop).
//   - If yes, loads { user, profile, error }.
//
// getInitials():
//   - Turns "Alex Sharma" into "AS".

async function requireSession() {

    // 1. Any saved session? PocketBase keeps the auth
    //    state in localStorage automatically.

    if (!window.pb.authStore.isValid) {
        window.location.href = "../auth/login.html";
        return null;
    }

    // 2. Re-validate the saved token and fetch a fresh
    //    user record (the profile fields live on it).

    let record;

    try {
        // authRefresh() resolves with { token, record } in
        // pocketbase@0.28.x, so unwrap the record from it.
        const response = await window.pb.collection("users").authRefresh();
        record = (response && response.record) || window.pb.authStore.record;
    } catch (err) {
        console.error("Session refresh failed:", err);
        window.pb.authStore.clear();
        window.location.href = "../auth/login.html";
        return null;
    }

    // 3. Return the current user.

    if (!record) {
        window.location.href = "../auth/login.html";
        return null;
    }

    return {
        user: record,
        profile: record,
        error: null
    };

}

// Sign the current user out and return to the login screen.

function signOut() {
    window.pb.authStore.clear();
    document.cookie = "pb_auth=; Max-Age=0; path=/";
    window.location.href = "../auth/login.html";
}


function getInitials(fullName) {

    const name = fullName || "LinkUp";

    return name
        .split(" ")
        .map(function(word) {
            return word.charAt(0);
        })
        .join("")
        .slice(0, 2)
        .toUpperCase();

}