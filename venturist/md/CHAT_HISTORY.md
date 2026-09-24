# LinkUp — Chat History & Work Log

Compiled from the working chat session (2026-09-24). Use this to pick up where we
left off, rerun setup, or hand the project to someone else.

---

## 1. Project Overview

- **Product**: LinkUp — a marketplace connecting **brands** and **event planners**.
- **Stack**: Plain HTML/CSS/JS (no build step, no framework) + **PocketBase** as
  the self-hosted backend (auth, database, file storage, admin UI).
- **Project folder**:
  `venturist-20260923T030503Z-1-001-20260924T024742Z-1-001\venturist-20260923T030503Z-1-001\venturist\`
- **Users**: two roles — `brand` and `event_planner`.

### Pages/files
- `index.html` — landing page (home)
- `login.html` — login
- `signin.html` — signup with Brand / Event Planner role selector
- `dashboard.html` — authenticated dashboard
- `profile.html` — profile view + inline edit form
- `pocketbase.js` — shared config: `window.pb = new PocketBase("http://127.0.0.1:8090")`
- `auth-guard.js` — shared `requireSession()` / `getInitials()` helpers
- `pocketbase-collections.json` — Admin UI import file (`events` + `opportunities`)
- `README.md`, `CURRENT_STATUS.md`, `IMPLEMENTATION_PLAN.md`, `ROADMAP.md`

---

## 2. Major Decision: Supabase → PocketBase

We were originally building on Supabase but the user asked to move away from it.

- **Migration date**: 2026-09-24
- PocketBase is self-hosted, SQLite-backed, includes an admin UI — nothing to
  configure as a service, and no external account needed.
- **Done during migration**:
  - Created `pocketbase.js` with `window.pb`.
  - Deleted `supabase.js`.
  - Rewrote `login.html`, `signin.html`, `dashboard.html`, `profile.html` to use
    the PocketBase JS SDK.
  - Added inline `getErrorMessage(err)` helpers that read
    `err.response.data.<field>.message` for user-friendly Red/Green error text.
  - Rewrote `README.md` + `CURRENT_STATUS.md` for PocketBase.
  - Grep-verified zero `supabase` references remain in code.

---

## 3. PocketBase Environment (important!)

- **Server binary**: `C:\Users\Ayush\Downloads\pocketbase_0.40.4_windows_amd64\pocketbase.exe`
- **Start it from a terminal** (do not double-click):
  ```
  cd C:\Users\Ayush\Downloads\pocketbase_0.40.4_windows_amd64
  .\pocketbase.exe serve
  ```
- **App URL**: `http://127.0.0.1:8090`
- **Admin UI**: `http://127.0.0.1:8090/_/`
- **JS SDK**: pinned via CDN
  `https://cdn.jsdelivr.net/npm/pocketbase@0.28.1/dist/pocketbase.umd.js`
- **Script order on every page**:
  1. `pocketbase.umd.js` (SDK)
  2. `pocketbase.js` (sets `window.pb`)
  3. `auth-guard.js` (guards)
  4. page-specific logic
- Serve the site with a static server (e.g. VS Code Live Server), then open
  `index.html`.

### auth-guard.js
- `requireSession()` checks `window.pb.authStore.isValid`, then calls
  `pb.collection("users").authRefresh()`; redirects to `login.html` when invalid.
- Returns `{ user: { id, email }, profile: <users record>, error: null }`.
- Profile fields live **directly on the `users` record** (no separate `profiles` table).
- `getInitials(name)` renders the initials avatar.

### Role labels
- Role strings must be exactly `brand` / `event_planner` (lowercase, no spaces).
- Label map: `event_planner` → "Event Planner Account", otherwise → "Brand Account".

---

## 4. Phase-by-Phase Progress

### Phase 1 — Dynamic dashboard ✅
- `auth-guard.js` created; `dashboard.html` loads the real session + profile.
- Sidebar shows real name, initials avatar, role label.
- Welcome + nav link labels render from `profile.role`.
- Removed the demo `[Brand] [Event Planner]` switcher.

### Phase 2 — Dynamic profile ✅
- `profile.html` loads the real profile and renders it.
- "Edit Profile" opens an inline form; Save updates the `users` record and re-renders.
- Interests / Partnership Goals cards kept as marked demo content.

### Phase 3 — Landing page navigation ✅
- Header "Login" → `login.html`; "Get Started" → `signin.html`.
- Hero "Explore Opportunities" → `login.html` (marketplace action; needs a session).
- Hero "Join the Network" + CTA "Join LinkUp" → `signin.html`.
- Footer "Explore Events" / "Discover Brands" / "Opportunities" → `login.html`
  (will point at `discover.html` once built in Phase 5).
- Demo marketplace cards kept, marked `<!-- DEMO ... -->`.

### Phase 4 — Marketplace data model 🚧 (schema file ready, not yet imported)
- `pocketbase-collections.json` defines `events` + `opportunities`.
- Access rules: any logged-in user **reads**; only the owner (organizer)
  creates/updates/deletes (`@request.auth.id = organizer_id`).
- **Architecture change**: there is **NO separate `brands` collection** — brands
  are found by reading `users` where `role = "brand"`. (Emails stay hidden;
  PocketBase only returns them to the record owner.)

### Remaining phases
1. **Discover page** — `discover.html` fed by real `events`/`opportunities`, plus
   create-event/opportunity forms for event planners (Phase 5 + 6).
2. Connections
3. Messaging
4. Matching engine (defined scoring, not fake percentages)
5. Proposals / partnerships

---

## 5. The users Collection Setup (do this in Admin UI)

> The PocketBase `users` collection already ships with `name` + `avatar` — there
> is **no `full_name`**. The app code was updated to use `name`.

### Where the collection editor is (v0.40.4 Admin UI)
- "New record" = data entry only (id, email, password, verified, name, avatar).
- Sidebar "New collection" = brand-new table.
- To edit `users`: click **⚙ gear icon** titled **"Collection settings"** in the
  top-right (a small circle icon) — it opens the Fields + API rules editor.

### Fields added to `users` (in progress / mostly done)
| Field | Type | Settings |
|---|---|---|
| `role` | Select | Values: `brand` (line 1), `event_planner` (line 2); Max select = 1; Required |
| `organization_name` | Text | — |
| `location` | Text | — |
| `category` | Text | — |
| `description` | Text | — |

System fields present: `id`, `email`, `emailVisibility`, `verified`, `password`,
`tokenKey`, `created`, `updated`, `name`, `avatar`.

---

## 6. Test Account Created During Probe (must be deleted)

A compatibility probe created a junk user in the database:
- **Email**: `lu_probe@test.local`
- **Password**: `12345678`

Delete it in Admin UI → Collections → users. Do **not** sign up with it later.

---

## 7. Current Blocker (last message)

The user added the fields but clicking **Save** (or the Import step) reported
"invalid configuration for the pocketbase collection". Likely causes, in order:

1. The `role` **Values** box must contain **exactly one option per line** with **no
   blank lines** (`brand` then `event_planner`). An empty line = invalid config.
2. Field names must be lowercase with underscores only —
   `role`, `organization_name`, `location`, `category`, `description` — no spaces.
3. The Author was waiting for the user to paste the **exact red error message**
   and confirm whether it appeared when **(A)** saving users or **(B)** importing
   the JSON.

### Verified facts (from v0.40.4 source, no guessing)
- Field IDs are free-form, 1–100 chars → readable ids in the import JSON are fine.
- Select options JSON keys: `values`, `maxSelect`, `required`.
- Relation options keys: `collectionId`, `cascadeDelete`, `minSelect`, `maxSelect`, `required`.
- Date options keys: `min`, `max`. Number options keys: `min`, `max`.
  (`displayFields` does not exist in v0.40.4 — it is ignored if present, harmless.)

---

## 8. Finish-Setup Checklist (next actions)

1. Get the exact error message from the admin UI; fix the `role` Values box /
   field names, then click **Save** on the `users` collection.
2. **Settings → Import collections** → paste `pocketbase-collections.json` →
   confirm. Expect new collections `events` + `opportunities`.
3. Delete `lu_probe@test.local`.
4. Restart `pocketbase.exe` if unsure (it picks up schema changes automatically).
5. Test full flow: signup → login → dashboard name/role → profile → edit profile persists.

---

## 9. Key Technical Reference (PocketBase import JSON — v0.40.4)

`pocketbase-collections.json` **must be pasted as a JSON array**. Each entry:
```json
{
  "name": "events",
  "type": "base",
  "fields": [
    { "id": "name", "name": "name", "type": "text", "system": false, "required": true,
      "options": { "min": null, "max": null, "pattern": "" } },
    { "name": "organizer_id", "type": "relation", "required": true,
      "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false,
                   "minSelect": null, "maxSelect": 1 } }
  ],
  "indexes": [],
  "listRule": "@request.auth.id != \"\"",
  "viewRule": "@request.auth.id != \"\"",
  "createRule": "@request.auth.id != \"\" && @request.auth.id = organizer_id",
  "updateRule": "@request.auth.id = organizer_id",
  "deleteRule": "@request.auth.id = organizer_id",
  "options": {}
}
```
- The special users-collection id is `_pb_users_auth_`.
- A demo GET to `/api/collections/users/records` succeeded during the probe
  (that's what created `lu_probe@test.local`).

---

## 10. Other Notes

- **Context7 MCP** was down (OAuth token errors) during the session — used
  websearch + reading the v0.40.4 GitHub source instead.
- `IMPLEMENTATION_PLAN.md` and `ROADMAP.md` still describe the old Supabase era
  (they mention `full_name`, a `profiles` table, etc.). They need a rewrite to
  match the PocketBase reality — not urgent, no impact on testing.
- Docs `README.md` / `CURRENT_STATUS.md` were updated to use `name` (not `full_name`).
- The server was confirmed running with HTTP **200 OK** at `http://127.0.0.1:8090/api/health`.