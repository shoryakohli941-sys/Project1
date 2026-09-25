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
    // 1. Check if the user is signed in via Supabase
    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.href = "../auth/login.html";
        return null;
    }

    // 2. Fetch the custom profile from the users table
    const { data: profile, error: profileError } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (profileError || !profile) {
        console.error("Failed to load user profile:", profileError);
        window.supabaseClient.auth.signOut();
        window.location.href = "../auth/login.html";
        return null;
    }

    // 3. Return the user and their profile.
    return {
        user: session.user,
        profile: profile,
        error: null
    };
}

// Sign the current user out and return to the login screen.
async function signOut() {
    await window.supabaseClient.auth.signOut();
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