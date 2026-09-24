# LinkUp — Roadmap

> Last updated: 2026-09-24

This is the full plan for the final product and the order in which we build it.
We **always** follow this order. Advanced features wait until the basics work.

**Stack reality (as of 2026-09-24):** plain HTML + CSS + JavaScript, backed by
**PocketBase** (self-hosted, SQLite, admin UI). The earlier Supabase plan was
fully replaced.

---

## 1. Final product vision

LinkUp is **not** just a "find sponsors" website. It is intended to become:

> **A structured marketplace and network for brand–event partnerships and collaborations.**

The long-term network includes: **Brands · Events · Creators · Communities · Service Providers**

---

## 2. The final demo (one working vertical line)

A smaller number of fully working features beats dozens of fake buttons.

```
Landing
  ↓
Signup  (role selection: Brand / Event Planner)
  ↓
Real authentication
  ↓
Dashboard  (rendered from the user's real role)
  ↓
Profile
  ↓
Discover
  ↓
Opportunity
  ↓
Connection
  ↓
Proposal
  ↓
Partnership
```

---

## 3. Product evolution (the "V" roadmap)

### V1 — Marketplace (auth foundation: ✅ in progress)
Brands ↔ Events discover each other.
- ✅ Real signup + login (PocketBase Auth, self-hosted)
- ✅ `users` collection with `role` field (`brand`, `event_planner`) + profile fields
- ✅ Dynamic dashboard + profile
- ✅ `events` + `opportunities` collections created and live (Phase 4)
- 🚧 Discover page fed by real data (Phase 5 — next)
- 🚧 Planner can create events / opportunities (Phase 6)

### V2 — Matching
A real matching engine recommends relevant opportunities.
- Scoring factors: audience compatibility, location, category, budget, event size, campaign objective, event type, demographics, partnership type
- **No fake percentages** — the scoring logic must be clearly defined first (Phase 9)

### V3 — Collaboration
Connection → Proposal → Messaging → Agreement
- Brands and planners connect with each other
- Structured proposals (product + cash + activation plan + deliverables)
- Messaging tied to a connection/partnership

### V4 — Operations
- Payments
- Deliverables
- Reviews & ratings
- Analytics (campaign reach, engagement, sponsor interest)

### V5 — Network
- Brands
- Events
- Creators
- Communities
- Service Providers

---

## 4. Exact implementation priority (do not reorder)

1. ✅ Make `auth/signup.html` create a real PocketBase account
2. ✅ Save profile information (on the `users` record)
3. ✅ Make `auth/login.html` authenticate users
4. ✅ Fetch the user's role
5. ✅ Redirect to dashboard
6. ✅ Make the dashboard dynamic (role-based UI)
7. ✅ Make the profile dynamic
8. 🚧 Build events / brands / opportunities → **Discover page (Phase 5 + 6)**
9. Connections
10. Messaging
11. Matching engine
12. Proposals / Partnerships

---

## 5. Data model evolution (build incrementally)

Only create the next collection when it is actually needed. In PocketBase,
schema is defined in the Admin UI or via importable collection JSON.

```
users               ✅ DONE  (auth collection: name, role, organization_name,
                              location, category, description, email)
  ↓
events              ✅ DONE  (organizer_id → users, name, category, location,
                              event_date, capacity, description)
opportunities       ✅ DONE  (event_id → events, organizer_id → users, title,
                              type, budget, audience, description, status)
  ↓
connections          (Phase 6/7)
  ↓
proposals           (Phase 10)
messages            (Phase 8)
partnerships        (Phase 11)
  ↓
reviews             (Phase 12)
```

**Important:** there is **no separate `brands` collection** — brands are simply
`users` records where `role = "brand"`. Emails are not exposed to other users
(PocketBase only returns them to the record owner).

Planned future concepts (only when justified):
notifications, saved opportunities, organizations, campaigns.

Permission note: the `users` collection keeps its default rule (a user can only
update **their own** record). Marketplace collections are readable by any logged-in
user but only writable by their owner.

---

## 6. Partners / roles and their journey

### Brand
1. Create account → 2. Complete profile → 3. Discover events → 4. View opportunities
5. Connect → 6. Send proposal → 7. Message organizer → 8. Manage partnership
9. Complete collaboration → 10. Review

### Event Planner
1. Create account → 2. Complete profile → 3. Create events → 4. Create sponsorship opportunities
5. Discover brands → 6. Review proposals → 7. Message brands → 8. Manage partnership
9. Complete collaboration → 10. Review

### Planned partnership types (LinkUp is NOT cash-only)
Cash sponsorship · Product sponsorship · Product sampling · Booth · Giveaway ·
Workshop · Demo · Venue · Equipment · Services · Social media promotion ·
Influencer integration · Stage mention · QR activation · Brand activation ·
Community partnership

---

## 7. Future connection / proposal / partnership states

- **Connections:** pending → accepted / rejected → active → completed
- **Partnerships:** Draft → Proposed → Negotiating → Accepted → Active → Completed → Cancelled

---

## 8. Security principles (always)

- The frontend only talks to PocketBase over its public REST API — **never** use
  superuser/admin credentials in frontend code.
- Never expose the database password or any admin secret.
- Keep **collection rules** ON for every collection; explain any rule change
  before making it. Marketplace rules: logged-in read, owner-only write.
- `users` stays private by default — a user can only create/read/update **their
  own** row. Never make profile data public just to simplify code.
- The `[Brand] [Event Planner]` switcher was a temporary demo and has been
  **removed**; role is read from `users.role` at login and users never change it
  manually.