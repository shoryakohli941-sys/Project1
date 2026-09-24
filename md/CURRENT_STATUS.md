# LinkUp — Current Status

> Last updated: 2026-09-24

A snapshot of what exists, what is being worked on, and what comes next.

---

## ✅ Completed

**Design / pages**
- Landing page (`index.html`) — hero, how it works, sample marketplace listings, CTA, footer
- New **Butter + Ink** editorial design system (`css/style.css`) — butter paper
  (`#FFEFB3`), deep green ink (`#013E37`), Leckerli One script accents +
  Instrument Sans. Replaces the old black/gold glassmorphism look.
- Shared UI motion via `js/script.js` (scroll reveals, pointer tilt, parallax)
- Signup UI (`auth/signup.html`) — two-column layout, Brand / Event Planner role selector with dynamic form switching
- Login UI (`auth/login.html`)
- Dashboard UI (`app/dashboard.html`) — sidebar, top bar, welcome card, opportunity cards, connections, quick actions
- Profile page (`app/profile.html`) — dynamic, loads the real logged-in user
- Pages reorganized for maintenance: public pages in `auth/`, private app pages
  in `app/`, shared assets in `css/` and `js/`

**Backend / data**
- Backend is **PocketBase** (self-hosted, SQLite-backed, built-in admin UI). Replaces
  the previous Supabase setup entirely.
- PocketBase server (v0.40.4) runs locally at `http://127.0.0.1:8090` (verified
  `api/health` → 200 OK).
- The `users` collection now has the profile fields added in the Admin UI:
  `role` (select `brand` / `event_planner`, required), `organization_name`,
  `location`, `category`, `description`. (`name` is a built-in PocketBase field.)
- **Marketplace collections are imported and live.** `events` + `opportunities`
  were created from `pocketbase-collections.json` (Settings → Import collections).
  Verified via API: `GET /api/collections/events/records`,
  `GET /api/collections/opportunities/records` and
  `GET /api/collections/users/records` all return HTTP 200.
- Marketplace access rules are baked into the collections: any logged-in user can
  **read**; only the owner (`organizer_id`) can create/update/delete.

**Authentication (live)**
- ✅ Real PocketBase signup in `auth/signup.html`
- ✅ Real PocketBase login in `auth/login.html` (`authWithPassword`)
- ✅ Shared `js/pocketbase.js` config (`window.pb`) used by every page
- ✅ `getErrorMessage()` helper turns PocketBase errors into readable messages

**Phase 1 — dynamic dashboard**
- ✅ `js/auth-guard.js` created — shared `requireSession()` / `getInitials()` / `signOut()`
- ✅ `app/dashboard.html` loads the real session + profile
- ✅ Sidebar shows the real name, initials avatar, and role label
- ✅ Welcome + nav link labels render from `profile.role`
- ✅ Temporary `[Brand] [Event Planner]` switcher removed (HTML, CSS and JS)

**Phase 2 — dynamic profile**
- ✅ `app/profile.html` loads the real profile and "Edit Profile" updates the `users`
  record then re-renders
- ✅ Logged-out visitors redirected to `auth/login.html`
- ✅ Interests / Partnership Goals cards kept as marked demo content

**Phase 3 — landing page navigation + auth-aware CTAs**
- ✅ Header "Log in" → `auth/login.html`; "Get started" → `auth/signup.html`
- ✅ Hero / CTA "Explore opportunities" / "Create an account" → `auth/signup.html`;
  footer "Log in" → `auth/login.html`
- ✅ Footer "Explore Events" / "Discover Brands" / "Opportunities" → `auth/login.html`
  (will point at `app/discover.html` once it exists in Phase 5)
- ✅ Marketplace demo cards kept, marked `<!-- DEMO ... -->`

**Phase 4 — marketplace data model (imported)**

`pocketbase-collections.json` defines `events` + `opportunities`:

| Collection | Fields |
| --- | --- |
| `events` | `name`, `category`, `location`, `event_date` (date), `capacity` (number), `description`, `organizer_id` (relation → `users`, required) |
| `opportunities` | `title`, `type`, `budget`, `audience`, `description`, `status` (select: `open`/`closed`), `event_id` (relation → `events`), `organizer_id` (relation → `users`) |

Rules: `listRule` / `viewRule` = any logged-in user (`@request.auth.id != ""`);
`createRule` = logged-in & owner; `updateRule` / `deleteRule` = owner only
(`@request.auth.id = organizer_id`).

> Architecture note: there is **no separate `brands` table**. Brands are found by
> reading `users` where `role = "brand"`. (Emails stay hidden — PocketBase only
> returns them to the record owner.)

---

## 🚧 In progress

- **Owner cleanup (one-time):** delete the `lu_probe@test.local` test account
  created during the compatibility probe (Admin UI → Collections → users).
- **Live verification** of the full flow: signup → login → dashboard → profile →
  edit profile persists.

---

## ✅ Phase 5 — Discover marketplace ✅ DONE

- ✅ `app/discover.html` (verified live) — **Discover** band fed by real
  `events` + `opportunities` collections (`sort: "-created"`), with expand on
  `organizer_id` / `event_id,organizer_id`, category pills, location/date/capacity,
  and links to `app/opportunity.html?id=...` (detail page ships in Phase 6).
- ✅ Combined search box filters **both** event + opportunity bands live; each band
  has its own empty state ("No events..."/"No opportunities...") and a real
  count/stamp header.
- ✅ Role-aware: **Event Planner** sees a "+ Create event / opportunity" CTA (opens
  the Phase 6 form section; brands get a browse-only heading). Sidebar identity +
  role label render from the real session.
- ✅ Landing footer links now point at the live app: **Explore events / Discover
  brands / Explore opportunities** → `app/discover.html` (route guard bounces
  logged-out visitors to `auth/login.html`).
- ✅ `app/dashboard.html` — "Recommended opportunities" now renders **3 real recent
  opportunities** (`sort: "-created", limit: 3`, expand `event_id,organizer_id`),
  each linking to `opportunity.html?id=...`, with a live "Live" stamp + empty
  state + graceful failure message. No more demo/sample cards.

---


**Phase 6 — opportunity detail + connections (live)**
- ✅ `app/opportunity.html?id=...` — opportunity detail page wired to the real `opportunities`
  collection (expand `event_id,organizer_id`): title, type, budget, audience, description,
  attached event + event date + location + organizer, live status stamp.
- ✅ Brands see an **"I'm Interested"** action on the detail page → creates a
  `connections` record (`from_user = me`, `to_user = organizer`,
  `opportunity = id`, `status = "pending"`). Planners see an owner notice instead.
  Verified live: brand click → `connections` row created (status `pending`) and
  visible to the planner.
- ✅ `connections` collection **imported and live** (from `json/pocketbase-collections.json`)
  — `from_user` / `to_user` (relations → `users`), `opportunity` (relation →
  `opportunities`), `status` (select: pending / accepted / rejected / archived),
  created/updated autodates. listRule/viewRule: auth can only see their own
  connections (`from_user = @request.auth.id || to_user = @request.auth.id`);
  createRule: `from_user = @request.auth.id`; update/deleteRule: a participant.
- ✅ `app/connections.html` — **Connections (04)**: role-aware view. Planners see
  incoming interest with **Accept / Decline** (updates `status` → `accepted` /
  `rejected`); brands see their own sent requests with a live status stamp
  (pending / accepted / declined). Sidebar identity + initials + role label render
  from the real session; both views have empty states.
- ✅ PocketBase gets a full import via **PUT `/api/collections/import`** (not POST —
  POST 404s on this PocketBase version). `deleteMissing` left at false so the
  existing `users` / `events` / `opportunities` collections aren't dropped.

**Phase 7 — relationships (live)**
- ✅ (wired in Phase 6; full Connections page ships in Phase 8.)

## ⏭ Next (in order)

1. **Create event / opportunity forms** on `app/discover.html` for event planners
   (the "+ Create" CTA already opens the section; next is wiring real POSTs to
   `events` / `opportunities`, then re-fetch + re-render the Discover bands).
2. **Connections (Phase 7)** — the planner/brand Connections list above
   (list rules already enforce visibility; apply the same acceptance pattern to
   messages).
3. **Messaging (Phase 8)** — same acceptance pattern applied to messages.
4. **Matching engine (Phase 9)** — defined scoring, not fake percentages.
5. **Proposals / partnerships (Phases 10 + 11)**.

---

## Known notes / gotchas

- `auth/signup.html` = **signup**; `auth/login.html` = **login**. Public pages live
  in `auth/`, private app pages in `app/` (renamed from flat `signin.html`
  / `dashboard.html` etc. for maintainability).
- **When using Settings → Import collections, always tick "Merge with the existing
  collections".** The import file only lists `events` + `opportunities`; without
  merge, PocketBase wants to delete the `users` and system collections.
- PocketBase stores the login automatically in the browser (localStorage) — page
  reloads keep you signed in; `requireSession()` re-validates the token each load.
- The 92% / 87% / 81% "Match" labels on the dashboard are **demo values** — real
  matching comes later with a defined scoring system.
- Passwords must be at least 8 characters (PocketBase default).
- Frontend pages are served with Live Server (port 5500); PocketBase runs on
  port 8090. Dev-mode PocketBase allows cross-origin requests from any origin.
- `IMPLEMENTATION_PLAN.md` is now PocketBase-accurate (updated alongside this file).
