# Redesign brief — LinkUp

## What this is

LinkUp is a two-sided marketplace connecting **brands** (want audiences, visibility, product activations) with **event organizers** (want sponsors, products, vendors, promotional support). Static HTML/CSS/JS, no frameworks, no build step. Auth and data come from PocketBase over its REST API.

I want the whole app redesigned. The current look is "premium dark SaaS with glassmorphism and gold accents" — it is competent but it reads as templated. I want something with an actual point of view.

## Files

```
index.html       landing page (public) — hero, intro strip, problem/solution,
                 How It Works (4 steps), marketplace preview cards, CTA, footer
signin.html      SIGNUP page — two-column, Brand / Event Planner role selector
                 with a form that swaps fields by role  (name is intentional)
login.html       LOGIN page                              (name is intentional)
dashboard.html   private app — sidebar, top bar, welcome card, opportunity
                 cards, connections list, quick actions. Role-aware.
profile.html     private — avatar/initials, name, role, org, email, location,
                 category, description, inline edit form, demo interest cards
style.css        the shared design system (~27k, tokens at the top)
script.js        small helpers
pocketbase.js    PocketBase client (window.pb)
auth-guard.js    requireSession() / getInitials()
```

Current tokens live in `style.css` under `2. DESIGN TOKENS` (`--black #050505`, `--gold #d6a82e`, `--gold-light #f4c542`, radii, `--container: 1180px`). Fonts are DM Sans + Manrope via Google Fonts.

## Step 1 — audit before you touch anything

Read all five pages and `style.css` first. Then tell me, briefly:

- what specifically makes this read as generic AI output right now
- where the type scale, spacing rhythm, and color usage break down
- what's inconsistent between the landing page and the logged-in pages
- anything structurally wrong (e.g. `index.html` loads `style.css` from the *bottom* of `<body>`, and `dashboard.html` / `signin.html` / `login.html` / `profile.html` each carry large page-local `<style>` blocks that duplicate and override the shared system — that fragmentation is part of the problem)

## Step 2 — propose directions, don't just start building

Give me **3 distinct visual directions**, each as a short written pitch: the idea in one sentence, the typography pairing, the palette with actual hex values, the layout logic, how motion behaves, and what kind of product it makes LinkUp feel like. They should be genuinely different from each other — not three shades of the same dark gradient. At least one should be a real departure from dark + gold.

Marketplace-y reference points worth thinking against: editorial / print-influenced, brutalist-utility, warm and human rather than cold-tech, dense data-forward. Pick your own; I'm not prescribing.

Stop after the pitches and wait for me to choose. Don't write code yet.

## Step 3 — build the chosen direction

Then, across all five pages:

1. Rebuild the design system in `style.css` — real tokens, one type scale, one spacing scale, one radius/elevation logic. Collapse the page-local `<style>` blocks into it wherever the styles are shared; keep only genuinely page-specific rules inline, and make them use the tokens.
2. Apply it to `index.html`, `signin.html`, `login.html`, `dashboard.html`, `profile.html` so the public pages and the logged-in app feel like one product.
3. Keep every page responsive down to 360px.
4. Keep it vanilla — no React, no Tailwind, no build step, no npm. External CSS/fonts via CDN link is fine.

## Hard constraints — do not break these

- **Do not touch the PocketBase logic.** The `<script>` blocks doing `pb.collection("users").create/authWithPassword/update`, `requireSession()`, `getInitials()`, and the element IDs/classes those scripts query must keep working. If you restructure markup, update the selectors in the same edit and say what you changed.
- Keep all existing `id` hooks and form `name`/`type` attributes on inputs, or migrate them deliberately and tell me.
- The signup role selector must still produce `brand` or `event_planner`.
- Don't rename files. `signin.html` is signup, `login.html` is login.
- Don't invent new pages or new backend collections. Redesign only.
- The dashboard's `92% / 87% / 81%` match figures are **demo data** — keep them visually de-emphasized or clearly labeled as sample, not presented as a real feature.
- Same for the marketplace preview cards on the landing page: they're illustrative.

## What I care about

Hierarchy that actually guides the eye. Type that has contrast and confidence. Spacing with a rhythm rather than arbitrary padding. Color used with restraint and intent. Motion that's purposeful and subtle, never decorative bounce. Empty states and forms that look designed, not skipped.

Avoid: generic glassmorphism cards, purple/blue gradient hero blobs, evenly-spaced 3-column feature grids with emoji icons, "Trusted by" logo strips with nothing in them, drop shadows on everything, centered-everything layouts.

## Deliverable

Edit the files in place. When you're done, summarize what changed per file and flag anything you had to compromise on, or any selector you moved that I should re-test against a running PocketBase.
