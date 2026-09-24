# LinkUp

> **A structured marketplace and network for brand–event partnerships and collaborations.**

LinkUp connects **brands** with **event organizers** (and, eventually, creators, communities and service providers) so both sides can discover each other, connect, propose partnerships, and manage collaborations — instead of hunting for sponsors or events through scattered channels.

## What LinkUp is trying to solve

| Side | Needs |
| --- | --- |
| **Brands** | Sponsorship opportunities, events to promote products, relevant audiences, product activations, brand partnerships, collaborators |
| **Event Planners** | Sponsors, brands, products, services, promotional support, vendors, collaborators, partnership opportunities |

## Demo flow (the vertical we are building)

```
Landing page
  ↓
Signup  (role selection: Brand / Event Planner)
  ↓
Real authentication (PocketBase)
  ↓
Dashboard  (renders based on the logged-in role)
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

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (no frameworks)
- **Auth + Database:** PocketBase (self-hosted, SQLite-backed, built-in admin UI)
- **Future possibility:** Python + Flask only if server-side logic is truly needed

## Project structure

```
LinkUp/
├── index.html            Landing page (public)
├── auth/
│   ├── login.html        Login page
│   └── signup.html       Create account / signup (role selection)
├── app/
│   ├── dashboard.html    Main private app area (role-based)
│   ├── profile.html      Profile page (loads the real logged-in user)
│   ├── discover.html     Discover page — live events (Phase 5 MVP)
│   ├── opportunities.html Opportunities list (role-aware)
│   ├── connections.html  Placeholder (Phase 6)
│   ├── messages.html     Placeholder (Phase 6)
│   └── partnerships.html Placeholder (Phase 6)
├── css/
│   └── style.css         Global styles (Butter + Ink design system)
├── js/
│   ├── script.js         Shared UI motion (reveals, tilt, parallax)
│   ├── pocketbase.js     Shared PocketBase client config
│   └── auth-guard.js     Shared session guard (`requireSession()` / `getInitials()`)
├── pocketbase-collections.json   Import file: events + opportunities collections
└── ROADMAP.md            Full product + implementation roadmap
```

> Public pages live at the project root and under `auth/`; private app pages
> under `app/`. `signup.html` is the SIGNUP page; `login.html` is the LOGIN page.
> All HTML pages load shared assets with relative paths (`css/style.css`,
> `js/script.js`, ... — `../css/*` and `../js/*` from `auth/` and `app/`).

## Design language

Warm editorial marketplace — **butter paper** (`#FFEFB3`) with **deep green ink**
(`#013E37`), hairline rules, script accents (Leckerli One) and Instrument Sans.
No gradients, no glassmorphism. Scroll reveals, gentle pointer tilt and parallax
are driven by `script.js` (`data-reveal`, `data-tilt`, `data-parallax`).

## Current capabilities

- ✅ Real PocketBase signup (creates a `users` record with role + profile fields)
- ✅ Real PocketBase login (redirects to dashboard)
- ✅ Role selection stored as `brand` / `event_planner`
- ✅ Dashboard + profile render the real logged-in user's data
- ✅ Landing page CTAs navigate correctly (no dead links in header/hero/CTA/footer)
- ✅ `users` collection extended with `role`, `organization_name`, `location`,
  `category`, `description` (Admin UI)
- ✅ Marketplace collections **imported and live** (`events` + `opportunities`)
- 🚧 Discover page + real marketplace data next (Phase 5)

## How to run

1. Download PocketBase for Windows from <https://pocketbase.io/docs/> and extract
   `pocketbase.exe`.
2. Run `pocketbase.exe` (a terminal/server starts on `http://127.0.0.1:8090`).
3. Open `http://127.0.0.1:8090/_/` and create the admin account.
4. In **Collections → users** add these profile fields (`name` already exists):
   `role` (select: `brand`, `event_planner`), `organization_name`,
   `location`, `category`, `description`.
5. In **Settings → Import collections**, paste the contents of
   `pocketbase-collections.json`. This creates the marketplace collections
   `events` and `opportunities` with their access rules.
6. Serve the project with any static server (e.g. VS Code Live Server) and open
   `index.html`.

The dashboard / profile areas require a logged-in session (sign up first).

## Security rules (always)

- The frontend only talks to PocketBase over its public REST API — never use
  superuser/admin credentials in frontend code.
- Keep the default `users` collection rules (anyone can sign up; a user can only
  update their own record).
- Never disable collection rules or expose the admin URL/credentials.