# LinkUp — Master Implementation Plan

> **Purpose:** Take LinkUp from its current state to its final product, one
> verifiable step at a time. Written so that any AI coding agent (or developer)
> can pick it up and execute the phases in order without needing prior
> conversation context.
>
> **Last updated:** 2026-09-24 — rewritten for **PocketBase** (the Supabase-era
> plan was fully replaced. Phases 1–4 are complete.)

---

## How to use this document

1. Read **Sections 1–5** (rules, current state, conventions, prerequisites) ONCE.
2. Execute phases **in order**. Each phase lists its own goal, files, schema work and acceptance criteria.
3. A phase is **DONE only when its acceptance criteria pass**. Then update `CURRENT_STATUS.md` and move to the next phase.
4. If you hit a problem, identify the category first (HTML / CSS / JS / PocketBase / collections / rules / auth) before making changes. Never rewrite whole files to fix a small bug.
5. Never skip, reorder, or delete phases without the project owner's approval.

---

## 1. Project snapshot

LinkUp is a startup-style web platform that connects **brands** with **event
organizers** (and, in the future, creators, communities and service providers).
Both sides discover each other, connect, propose partnerships and manage
collaborations.

- **Stack:** Plain HTML + CSS + JavaScript (NO React/Vue/Tailwind/etc.).
- **Auth + DB:** **PocketBase** (self-hosted, SQLite-backed, built-in admin UI).
  Runs locally at `http://127.0.0.1:8090`; admin UI at `/_/`.
- **Files live in:** the `venturist/` folder of this repo.
- **The visual identity is Butter + Ink** — butter paper (`#FFEFB3`) on deep
  green ink (`#013E37`), hairline rules, Leckerli One script accents +
  Instrument Sans. See `style.css` → "1. TOKENS".

### Current file inventory

| File | Role |
| --- | --- |
| `index.html` | Public landing page (hero, how it works, sample listings, CTA, footer) |
| `auth/signup.html` | **Signup** page (role selection: Brand / Event Planner + form) |
| `auth/login.html` | Login page |
| `app/dashboard.html` | Private app area (role-based, real session data) |
| `app/profile.html` | Profile page + inline edit (real session data) |
| `app/discover.html` | Discover page — live events from PocketBase (built) |
| `app/opportunities.html` | Opportunities list — role-aware (built) |
| `app/connections.html` / `messages.html` / `partnerships.html` | Placeholder pages (Phase 6) |
| `css/style.css` | Global styles (Butter + Ink design system) |
| `js/script.js` | Shared UI motion (reveals, tilt, parallax) |
| `js/pocketbase.js` | Shared PocketBase client (`window.pb`) |
| `js/auth-guard.js` | Shared `requireSession()` / `getInitials()` / `signOut()` |
| `pocketbase-collections.json` | Import file: `events` + `opportunities` (already imported) |

**File organization:** public pages at the project root and under `auth/`; private
app pages under `app/`. Shared assets live in `css/` and `js/` — pages link them
with relative paths (`../css/style.css`, `../js/*.js` from `auth/` and `app/`).
`signup.html` is the SIGNUP page; `login.html` is the LOGIN page.

---

## 2. Non-negotiable rules

Follow these at all times.

### Development philosophy
1. Make the **smallest logical change**; preserve all working functionality.
2. Do not rewrite a working file "just because". Modify only the needed section.
3. Keep code beginner-friendly, readable, commented where useful.
4. Explain any architectural change before making it.
5. Build incrementally — never create a new collection before a phase needs it.

### Security (hard rules)
1. The frontend only talks to PocketBase over its public REST API.
2. **NEVER** use superuser/admin credentials in frontend code, and never expose
   the admin URL in user-facing flows.
3. **NEVER** disable collection rules to make development easier.
4. Add the route guard to any private page (dashboard, profile, discover, ...):
   if there is no logged-in session, redirect to `auth/login.html`.
5. Do not use `localStorage` as the auth system — PocketBase manages sessions and
   stores them itself; pages just call `requireSession()`.

### Product rules
1. No fake authentication.
2. No fake "match %" numbers. Match scores require a **defined algorithm** (see Phase 9).
3. One `app/dashboard.html`, rendered by role (`brand` / `event_planner`) — no separate dashboards.
4. No separate `brands` collection. Brands are found by reading `users` where `role = "brand"`.

---

## 3. Current state (start point)

### Done and verified
- Landing, signup UI, login UI, dashboard UI, profile UI.
- PocketBase server running; `api/health` → 200.
- Real signup (`auth/signup.html`): validates, creates the `users` record (email,
  password, `name`, `role`, `organization_name`, `category`, `location`),
  redirects to `login.html?created=1` (same folder).
- Real login (`auth/login.html`): `authWithPassword(...)`, redirects to
  `../app/dashboard.html`.
- **`users` profile fields added in the Admin UI**:
  `role` (select `brand`/`event_planner`, required), `organization_name`,
  `location`, `category`, `description`.
- **`events` + `opportunities` collections imported and live**
  (`pocketbase-collections.json`), verified via API (HTTP 200).
- Shared `pocketbase.js` (`window.pb`) + `auth-guard.js` used everywhere.
- Dashboard + profile render the real logged-in user; sidebar role labels + welcome
  render from `profile.role`; `[Brand] [Event Planner]` switcher removed.
- Landing CTAs all navigate (header/hero/CTA/footer); marketplace cards kept as
  marked demo.

### NOT done yet (this is the work)
- Live end-to-end verification by the owner (signup → login → dashboard → profile → edit).
- Delete the `lu_probe@test.local` test account (Admin UI).
- `app/discover.html` + real marketplace UI (Phase 5).
- Everything from Phase 6 onward (connections → partnerships → reviews).

### Required PocketBase setup (owner — already done on this machine)
1. PocketBase server started from `pocketbase.exe serve` in a terminal
   (`http://127.0.0.1:8090`).
2. Added the `users` profile fields above via the Admin UI (⚙ Collection settings).
3. Imported `pocketbase-collections.json` with **"Merge with the existing
   collections"** ticked (this keeps `users` + system collections).

> To recreate on a fresh machine, follow `README.md` → "How to run".

---

## 4. Conventions an AI agent MUST follow

### Code / DOM conventions
- The design system lives entirely in `style.css` (tokens at "1. TOKENS").
  Reuse tokens (`--paper`, `--ink`, `--ink-2`, `--line`, ...) and existing
  component classes; do not re-add per-page dark/glass overrides.
- Shared UI motion (`data-reveal`, `data-tilt`, `data-parallax`, `data-today`)
  comes from `script.js`; link it on every page.
- Load the PocketBase stack in **this exact order** on any page that needs auth:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/pocketbase@0.28.1/dist/pocketbase.umd.js"></script>
  <script src="../js/pocketbase.js"></script>
  <script src="../js/auth-guard.js"></script>
  <!-- page-specific script last -->
  ```
  (From pages under `auth/` and `app/`, shared scripts are at `../js/`.)
- The shared client is always referenced as **`window.pb`**.
- Session data comes from `requireSession()` → `{ user: { id, email }, profile: <users record>, error }`.
  Profile fields live **directly on the `users` record** (there is no `profiles` table).
- Role strings are exactly: `"brand"` and `"event_planner"`. Label map:
  `event_planner` → "Event Planner Account", otherwise → "Brand Account".
- Do not introduce new icon/font libraries beyond the design system (Google Fonts:
  Instrument Sans + Leckerli One). Reuse the tokens in `style.css`
  (`--paper #FFEFB3`, `--ink #013E37`, `--line`, ...).
- Match labels (e.g. "92% Match") mean "demo" today; replace only with real scoring.

### Naming conventions
- HTML `id`s are camelCase (existing: `brandRole`, `eventRole`, `signupForm`,
  `loginForm`, `welcomeTitle`, `welcomeDescription`, `discoverLink`,
  `opportunitiesLink`, `profileGrid`, `editProfileCard`, ...).
- New files: lowercase, in their folder — public in `auth/`, private in `app/`
  (e.g. `app/discover.html`, `app/messages.html`, `app/partnerships.html`).
- Collection/field names: lowercase with underscores (`organizer_id`, `event_date`).
  Field IDs in collection JSON are free-form.

### PocketBase query helpers used in this app
- List with all rows: `pb.collection("events").getFullList({ sort: "-created", expand: "organizer_id" })`
- Single record: `pb.collection("events").getOne(id, { expand: "..." })`
- Create: `pb.collection("events").create({ ... })`
- Update: `pb.collection("events").update(id, { ... })`
- Errors: read `err.response.data.<field>.message` via the shared `getErrorMessage()` pattern.

---

## 5. Definition of "final state"

When ALL of these are true:

1. A visitor can sign up as Brand or Event Planner with real PocketBase auth; the
   `users` record carries the role + profile fields.
2. The same user can log in and lands on a dashboard that greets them by name and
   shows the **correct role view** (Brand: Discover Events / Opportunities; Event
   Planner: Discover Brands / My Opportunities).
3. `app/profile.html` shows real DB data and "Edit Profile" saves changes.
4. Event Planners can create **events** and **opportunities**; Brands can browse
   them on a **Discover** page fed by real data (no static demo cards on app pages).
5. Brands can express interest → creates a **connection** the planner can accept.
6. Connected users can **message** each other.
7. A **matching engine** with a documented scoring model produces match scores.
8. Brands can submit **proposals**; planners can accept/reject; an accepted
   proposal becomes a **partnership** with status tracking.
9. Landing page CTAs navigate correctly; private pages are protected by route guards.
10. All access respects **collection rules**; no admin/superuser secrets leak to the frontend.

---

## 6. Phases

---

### PHASE 1 — Dynamic, role-based dashboard + route guard ✅ DONE

- ✅ `auth-guard.js` with `requireSession()` + `getInitials()`.
- ✅ `app/dashboard.html` uses the real session; sidebar (avatar, name, role label),
  welcome title and `discoverLink` / `opportunitiesLink` labels render from `profile.role`.
- ✅ `[Brand] [Event Planner]` switcher removed (HTML, CSS, JS).
- ✅ Demo "Recommended opportunities" cards kept, marked `<!-- DEMO CARDS: replace in Phase 5 -->`.

**Verified:** logged-out visitors are redirected to `auth/login.html`; logged-in users
see real name/role content.

---

### PHASE 2 — Dynamic profile page + edit ✅ DONE

- ✅ `app/profile.html` renders avatar initials, name, role label, brand/org, email,
  location, category, description from the `users` record.
- ✅ "Edit Profile" opens an inline form; Save updates the `users` record
  (`name`, `organization_name`, `location`, `category`, `description`) and re-renders.
- ✅ Logged-out visitors redirected to `auth/login.html`.
- ✅ Interests / Partnership Goals cards kept as demo content (commented).

**Verified:** reload shows persisted values.

---

### PHASE 3 — Fix landing page navigation + auth-aware CTAs ✅ DONE

- ✅ Header "Log in" → `auth/login.html`; "Get started" → `auth/signup.html`.
- ✅ Hero "Explore opportunities" / "Create an account" → `auth/signup.html`.
- ✅ Footer "Log in" → `auth/login.html`; "Explore Events" / "Discover Brands" /
  "Opportunities" → `auth/login.html` (swap for `app/discover.html` once it
  exists — do it during Phase 5).
- ✅ Marketplace demo cards still `#` with demo comments.

---

### PHASE 4 — Marketplace data model (imported) ✅ DONE

- ✅ `pocketbase-collections.json` defines `events` + `opportunities` (fields +
  access rules). Imported into the server; API returns 200 for both.
- ✅ Rules: any logged-in user reads; only the owner (`organizer_id`) writes.

See `CURRENT_STATUS.md` for the exact field lists.

---

### PHASE 5 — Discover page (real marketplace) ✅ DONE

**Goal:** a new `app/discover.html` showing real `events` and their `opportunities`;
brands see opportunities, event planners see events + can create (forms come in
Phase 6).

**Files:** new `app/discover.html`, edits to `index.html` (footer links) and
`app/dashboard.html` (real "Recommended opportunities" instead of demo cards).

**Work items**

1. Create `app/discover.html` matching the dashboard shell (reuse the sidebar
   pattern from `app/dashboard.html`; highlight the "Discover" nav item; use the
   same script order). Page title: "Discover".
2. Topbar title e.g. "Discover" with subtitle "Events and opportunities from the LinkUp network."
3. Load the session + profile (`requireSession()`); branch UI on `profile.role`:
   - **Event Planner:** primary call-to-action "+ Create event / opportunity"
     (opening the Phase 6 form section).
   - **Brand:** a clean browse-only heading.
4. Fetch data:
   ```js
   const events = await window.pb.collection("events").getFullList({
       sort: "-created",
       expand: "organizer_id"          // organizer identity (users) if shown
   });
   const opportunities = await window.pb.collection("opportunities").getFullList({
       sort: "-created",
       expand: "event_id,organizer_id"
   });
   ```
5. Render:
   - **Events band** — card per event: name, category, location, `event_date`
     (formatted), capacity, description, organizer name from `expand.organizer_id.name`.
   - **Opportunities band** — card per opportunity: `title`, `type`, `budget`,
     `audience`, `description`, event name from `expand.event_id.name`, event
     location/category. Link the card CTA to `app/opportunity.html?id=<id>` (page
     built in Phase 6; the link can exist now).
   - Empty state: "No opportunities yet" when a collection is empty.
6. Replace `app/dashboard.html`'s demo "Recommended opportunities" cards with 3 real
   rows fetched via `getFullList({ sort: "-created", limit: 3 })` — so dashboard
   and discover feel connected.
7. Update `index.html` footer "Explore Events" / "Discover Brands" /
   "Opportunities" links → `app/discover.html` (still requires a session; the route
   guard will bounce logged-out visitors to `auth/login.html`).

**Acceptance criteria**
- `app/discover.html` shows DB events/opportunities (not the static demo list).
- Cards show name, type, location, audience, budget.
- Logged-out users are redirected to `auth/login.html`.
- Dashboard shows real (3) recent rows, no demo cards.

---

### PHASE 6 — Opportunity detail + "I'm Interested" + create-forms (events & opportunities)

**Goal:** `app/opportunity.html?id=...`; a brand can mark interest (creates a
**connection**); an event planner can create an event and an opportunity.

**Files:** new `app/opportunity.html`, edits to `app/discover.html`, new `connections` collection.

**Work items**

1. `opportunity.html?id=`:
   - Read `?id=` from the URL; fetch the opportunity with
     `getOne(id, { expand: "event_id,organizer_id" })`.
   - Render full detail: title, type, budget, audience, description, status badge
     (open/closed), event name/location/date/capacity (from expand), organizer name.
   - **Brand users only:** "I'm Interested" button.
2. Create the `connections` collection (Admin UI, or a JSON import). Fields + rules:

   | Field | Type | Options |
   | --- | --- | --- |
   | `from_user` | relation → `users` | required, max 1 |
   | `to_user` | relation → `users` | required, max 1 |
   | `opportunity` | relation → `opportunities` | not required, max 1 |
   | `status` | select | `pending` / `accepted` / `rejected` / `archived`, required, max 1 |

   Rules:
   ```
   listRule/viewRule:   @request.auth.id != "" && (from_user = @request.auth.id || to_user = @request.auth.id)
   createRule:          @request.auth.id != "" && from_user = @request.auth.id
   updateRule/deleteRule: @request.auth.id != "" && (from_user = @request.auth.id || to_user = @request.auth.id)
   ```
3. "I'm Interested" handler:
   ```js
   await window.pb.collection("connections").create({
       from_user: user.id,
       to_user: opportunity.organizer_id,   // the planner owns the opportunity
       opportunity: opportunityId,
       status: "pending"
   });
   ```
   Show an inline success message; disable the button after a row exists
   (check with `getFullList` filter `from_user` + `opportunity` first).
4. Create-forms on `app/discover.html` (visible to event planners):
   - **Create event:** `name`, `category`, `location`, `event_date`
     (datetime-local input), `capacity` (number), `description` →
     `pb.collection("events").create({ ... , organizer_id: user.id })`.
   - **Create opportunity:** dropdown of the planner's own events
     (`getFullList` filter `organizer_id = <id>`), then `title`, `type`, `budget`,
     `audience`, `description`, `status: "open"` →
     `pb.collection("opportunities").create({ ..., event_id, organizer_id: user.id })`.
   - After creating, re-fetch the lists and render.

**Acceptance criteria**
- A brand's click creates a `pending` connection to the opportunity's owner.
- An event planner can create an event + opportunity that appear in Discover
  (both events and opportunities).

---

### PHASE 7 — Connections management

**Goal:** a "Connections" page (new `app/connections.html`) letting a planner accept/
reject incoming interest and both sides see statuses.

**Files:** new `app/connections.html`, edits to `app/dashboard.html` (replace the demo
"Recent connections" rows with real data or a link to `app/connections.html`),
sidebar "Connections" `#` → `app/connections.html`.

**Work items**

1. Fetch connections where the user is a participant:
   ```js
   await window.pb.collection("connections").getFullList({
       filter: "(from_user = '" + user.id + "' || to_user = '" + user.id + "')",
       sort: "-created",
       expand: "from_user,to_user,opportunity"
   });
   ```
   Show the other party (name via expand) + role label + opportunity title.
2. Planners: incoming `pending` rows get **Accept** / **Reject** buttons →
   `update(id, { status: "accepted" | "rejected" })`.
3. Brands: show their sent requests + status badges (Pending / Accepted / Rejected).
4. Empty state: "No connections yet."

**Acceptance criteria**
- Interest from a brand shows as `pending` for the planner; accept/reject works and persists.
- Status changes are visible to both sides after refresh.
- Dashboard no longer shows demo connection rows.

---

### PHASE 8 — Messaging

**Goal:** messages inside an accepted connection.

**Files:** new `app/messages.html`, new `messages` collection, sidebar "Messages" `#` → `app/messages.html`.

**Work items**

1. Create `messages`:

   | Field | Type | Options |
   | --- | --- | --- |
   | `connection` | relation → `connections` | required, max 1, **cascadeDelete** |
   | `sender` | relation → `users` | required, max 1 |
   | `content` | text | required |

   Rules:
   ```
   listRule/viewRule: @request.auth.id != "" && (connection.from_user = @request.auth.id || connection.to_user = @request.auth.id)
   createRule:        @request.auth.id != "" && sender = @request.auth.id
   updateRule/deleteRule: (empty — messages are not editable)
   ```
2. `app/messages.html`:
   - Dropdown of the user's **accepted** connections (label with both party names
     + opportunity title).
   - On select, render the thread:
     `pb.collection("messages").getFullList({ filter: "connection = '<connId>'", sort: "created" })`.
   - Input + Send → `pb.collection("messages").create({ connection, sender: user.id, content })`,
     then re-fetch. Attachments, read receipts and notifications are LATER.

**Acceptance criteria**
- Two users on an accepted connection can exchange messages that persist and reload.

---

### PHASE 9 — Matching engine (documented scoring, no fake %)

**Goal:** replace demo percentages with a transparent, computed match score.

**Files:** new `matching.js` (pure function library loaded by `app/dashboard.html` / `app/discover.html`).

**Scoring model v1 (implement EXACTLY, then tune later)**

```
matchScore = round(100 * (
  0.30 * categoryMatch
+ 0.25 * locationMatch
+ 0.20 * audienceMatch
+ 0.15 * budgetFit
+ 0.10 * sizeFit
))
```

Definitions (return 0..1):
- `categoryMatch`: 1 if the brand's `category` equals the event/opportunity
  category, 0.5 if both are from the same group (Lifestyle/Fashion/Beauty →
  "lifestyle"; College Event/Workshop → "education"), else 0.
- `locationMatch`: 1 if normalized city strings equal (trim, lowercase, strip
  punctuation), else 0.
- `audienceMatch`: 1 if any keyword of the brand's preferred audience appears in
  the opportunity `audience` text, else 0.5 (neutral default).
- `budgetFit`: 0.5 neutral default until `budget` is structured.
- `sizeFit`: 0.5 neutral default until capacity tiers are defined.

Rules:
- Only compute for opportunities the user CAN see (same-role safeguards).
- Always show the score with an honest label ("Match score computed from
  category/location/audience, budget and size").
- Users with no profile fields set should see "—" instead of a fake number.
- Inputs come from the brand's `users.category`/`location` and the
  event's `category`/`location` (`expand.event_id`).

**Acceptance criteria**
- Scores change predictably when inputs change (verify by inspecting the function).
- Demo 92% / 87% / 81% values are fully gone from the dashboard.

---

### PHASE 10 — Proposals

**Goal:** a brand submits a proposal for an opportunity; the planner reviews it.

**Files:** new `app/proposal.html` (brand side), proposal review UI in `app/dashboard.html`,
new `proposals` collection.

**Work items**

1. Create `proposals`:

   | Field | Type | Options |
   | --- | --- | --- |
   | `opportunity` | relation → `opportunities` | required, max 1, cascadeDelete |
   | `brand` | relation → `users` | required, max 1 |
   | `planner` | relation → `users` | required, max 1 |
   | `message` | text | required |
   | `cash_amount` | number | — |
   | `product_quantity` | number | — |
   | `activation_idea` | text | — |
   | `status` | select | `proposed` / `negotiating` / `accepted` / `rejected`, required, max 1 |

   Rules:
   ```
   listRule/viewRule: @request.auth.id != "" && (brand = @request.auth.id || planner = @request.auth.id)
   createRule:        @request.auth.id != "" && brand = @request.auth.id
   updateRule:        @request.auth.id != "" && (brand = @request.auth.id || planner = @request.auth.id)
   deleteRule:        (empty)
   ```
2. `app/proposal.html?opportunity_id=...`: form (message, cash amount, product
   quantity, activation idea) → `create({ opportunity, brand: user.id, planner: organizerId })`.
3. Planner UI (dashboard section): list proposals for their opportunities with
   Accept / Reject (update `status`).
4. Wire a "Send Proposal" button into `app/opportunity.html` for brand users.

**Acceptance criteria**
- A brand proposal lands on the planner's dashboard; accept/reject persists.

---

### PHASE 11 — Partnerships

**Goal:** an accepted proposal becomes a tracked partnership.

**Files:** new `app/partnerships.html`, new `partnerships` collection, sidebar
"Partnerships" `#` → `app/partnerships.html`.

**Work items**

1. Create `partnerships`:

   | Field | Type | Options |
   | --- | --- | --- |
   | `proposal` | relation → `proposals` | not required, max 1 |
   | `brand` | relation → `users` | required, max 1 |
   | `planner` | relation → `users` | required, max 1 |
   | `deliverables` | text | — |
   | `deadlines` | text | — |
   | `status` | select | `accepted` / `active` / `completed` / `cancelled`, required, max 1 |

   Rules (participants-only, like `proposals`).
2. When a proposal is accepted, create a `partnerships` row.
3. `app/partnerships.html`: list the user's partnerships with status badges and a
   status updater (Accept → Active → Complete / Cancel). Deliverables/deadlines
   are text fields for now.

**Acceptance criteria**
- Accepting a proposal creates a partnership; either side can move it through
  accepted → active → completed.

---

### PHASE 12 — Reviews (reputation, light version)

**Goal:** completed partnerships can leave a 1–5 rating + short review.

**Files:** new `reviews` collection, UI inside `app/partnerships.html`.

**Work items**

1. Create `reviews`:

   | Field | Type | Options |
   | --- | --- | --- |
   | `partnership` | relation → `partnerships` | required, max 1, cascadeDelete |
   | `reviewer` | relation → `users` | required, max 1 |
   | `partner` | relation → `users` | required, max 1 |
   | `rating` | number | 1–5 |
   | `comment` | text | — |

   Rules: `listRule/viewRule` = any logged-in user (reputation is public to members);
   `createRule` = `reviewer = @request.auth.id`.
2. After a partnership is `completed`, each participant can submit one review.
3. Show average rating on a user's profile page.

**Acceptance criteria**
- A review persists and its rating appears on the partner's profile.

---

### PHASE 13 — Final polish, demo script, docs sync

**Goal:** the app feels finished and demo-ready.

**Work items**

1. Audit every page for dead `#` links; make navigation consistent.
2. Mobile pass on dashboard/discover/connections/messages (collapse rules exist
   for dashboard; mirror them).
3. Empty states: "No opportunities yet", "No connections yet", "No messages yet" —
   friendly, on-brand.
4. Create a `DEMO_SCRIPT.md` — the exact click-path for the demo:
   1) Landing → Get Started → sign up Brand →
   2) dashboard (brand view) → discover → view opportunity → interested →
   3) create Event Planner account → create event + opportunity → accept brand →
   4) message → proposal → accept → partnership → complete → review.
5. Update `CURRENT_STATUS.md` (mark phases done), `ROADMAP.md` if any
   order/scope changed (with owner approval).

**Acceptance criteria**
- Full demo path works end-to-end.
- No demo-data labels remain on app pages.

---

## 7. Cross-cutting: shared helpers (recommended when a phase needs them)

Create small, focused helper files instead of duplicating logic:

- `auth-guard.js` — ✅ exists. `requireSession()` returns
  `{ user, profile, error }` or redirects to `auth/login.html`. Used by every app page.
- `matching.js` — the scoring function from Phase 9.
- `sidebar.js` — optional; extract when sidebar markup is duplicated 3+ times.

Order of `<script>` tags on every app page (paths relative to the `app/` page):

```html
<script src="https://cdn.jsdelivr.net/npm/pocketbase@0.28.1/dist/pocketbase.umd.js"></script>
<script src="../js/pocketbase.js"></script>
<script src="../js/auth-guard.js"></script>
<!-- page-specific script last -->
```

---

## 8. Verification / testing approach (no framework assumed)

- Manual flows via a static server: run `npx serve` or VS Code "Live Server" in
  the `venturist/` folder and walk the acceptance criteria.
- PocketBase must be running (`pocketbase.exe serve` → `http://127.0.0.1:8090`).
- Use the browser DevTools **Network** and **Console** tabs; PocketBase errors
  surface as `{ status, message, data: { <field>: { message } } }` — read the
  per-field messages first (see the shared `getErrorMessage()` pattern).
- After every schema change, verify in the **Admin UI** and against the
  collection rules' behavior (signed in vs signed out; brand vs planner).
- Importing collections? Always tick **"Merge with the existing collections"** so
  `users` + system collections are never deleted.
- Keep `CURRENT_STATUS.md` honest: completed phases get checked; in-progress work
  is listed with its blocker.

---

## 9. Don't-build list (until explicitly requested)

- No Python/Flask backend yet (only add if server-side logic is truly required).
- No real-time sockets for messaging (reload/refresh is fine for now).
- No notifications, analytics dashboards, payments, attachments, or QR activations.
- No separate dashboards per role.
- No superuser access from the frontend — ever.