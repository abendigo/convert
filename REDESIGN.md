# Redesign decisions

Working notes from the redesign discussion, before implementation starts. Interactive
prototype: https://claude.ai/code/artifact/bd8066f9-adfe-4ccf-852b-742c56e802cf

## Philosophy

The app stays "as simple as possible" and mobile-first. Sparse is intentional, not a gap —
but the visual language gets a refresh (typography + motion), not more UI chrome. Where a
feature was tried and made the app feel less simple (see Favorites below), it was cut
rather than kept for the sake of the work already done.

Gestures are meant to teach themselves. No permanent on-screen instructions — a short,
animated hint (not persistent text) nudges first-time behavior, and it replays on every
load rather than only once, since there's no state to persist that decision anyway.

## Interaction model

- **Amount** (swipe/drag left-right, or arrow keys): ×10 per swipe right, ÷10 per swipe
  left, clamped **1 – 100,000**. At either limit, the gesture resists (a small damped
  nudge that springs back) instead of animating through to an unchanged value.
- **Base currency** (swipe/drag up-down, or arrow keys): rotates through the full
  currency list. For list `[A, B, C, D]` with `A` as base, swipe up → `[B, C, D, A]`
  (rotate left); swipe down is the reverse (rotate right).
- **Tap a table row**: jumps straight to that currency as the base (moves it to the
  front of the rotation) — a faster alternative to swiping through several currencies.
- The incoming value is always visible sliding in as the outgoing one slides out (a
  carousel, not a fade-through-blank) — drag distance is capped so a panel never
  overshoots past its resting position.
- `prefers-reduced-motion` is respected: swipes/taps commit instantly, no animation.

Implementation note (from a real bug hit while building the prototype): visual drag
direction and semantic action direction must be kept as separate values. On the y-axis
they're deliberately inverted (swipe up is visually negative but means "rotate left"),
and conflating the two broke the slide animation. Keep a `visualDir` (drives geometry:
translateX/Y, panel positions) and an `actionDir` (drives meaning: what actually changes)
as distinct values, converted between via one small function, not merged into one.

## Layout

- The amount/currency card and the footer are **pinned** — not `position: sticky`, just
  structurally outside the scrolling region — so only the currency table scrolls, in a
  bounded middle section. The table header stays sticky within that scroll region.
- Card shows the amount (large, tabular figures) and the currency identity as one line
  below it: `CODE · Full Name` (was two stacked lines — code and name being two separate
  lines read as redundant once combined felt natural).
- Table is 3 columns: **Currency | Buying power | Cost** — replaces the original app's
  two separate (and redundant) tables for the same information.
  - *Buying power* is a single bold figure — the question it answers ("100 CAD buys
    ___") is constant across every row, already established by the card above.
  - *Cost* is a bold figure **with a muted caption below stating what's being costed**
    (e.g. "for 100 USD") — this question *does* vary per row (different target currency
    each time), so it can't rely on a single shared header the way Buying power can.
  - Both columns' primary number sits on the same line/row-top, so they align — the
    caption is a trailing line under Cost, not a leading one above it.

## Currency scope

- 10 currencies for now: CAD, USD, GBP, THB, AUD, JPY, CHF, SGD, NZD, MXN.
- **No favorites/starring system.** It was prototyped (max-3 favorites, star toggle,
  swipe restricted to favorites, tap-to-promote with eviction) to solve two real
  problems — an unbounded currency list making the page scroll, and swiping through many
  currencies being slow — but it cost two new things: a second interaction paradigm
  (tap vs. swipe) and visible always-there UI chrome (the star), which worked against
  "as simple as possible" more than the problems it solved were worth. Cut in favor of:
  swipe rotates through the full list, tap-to-select-base is the fast path to any one of
  them directly. Revisit if the currency count grows enough that this stops feeling fast.
- No search/filter — not needed at this size; would be worth revisiting well before the
  list grows toward the full ISO currency catalog.

## Visual design

- Type: **IBM Plex Mono** for all figures (amount, rates, table numbers) — tabular
  figures keep digit-width consistent as the amount changes length, and the monospace
  "statement/ticker" feel suits a numbers-forward app. **IBM Plex Sans** for labels/UI
  text. Same type superfamily, designed together, not a default Inter/Space
  Grotesk pairing.
- One accent color: a cobalt blue, a nod to the EU/ECB blue rather than an arbitrary
  brand color.
- Dark mode follows system preference (`prefers-color-scheme`) — no manual toggle in the
  real app. (The theme toggle in the interactive prototype is preview-only tooling for
  reviewing both themes, not part of the actual design.)

## Explicitly out of scope

- **Settings gear** — deferred. Only one candidate setting has come up (curating the
  currency list) — not enough to justify a menu. Revisit once there are genuinely 2-3
  settings, and consider surfacing a single setting directly rather than behind a gear.
- **Help icon** — rejected. Undercuts the "gestures teach themselves" approach; if the
  hint animation isn't sufficient, the fix is a better hint, not an escape hatch next to
  it. Accessibility (screen reader / keyboard users) should be handled via proper
  `aria-label`s, not a visible help affordance.
- **Privacy / about pages** — not needed. Not distributed via Play Store (no store
  requirement), no accounts, no analytics (Taplytics was removed previously), no data
  collection beyond rates cached locally in IndexedDB on-device.

## Implementation stack

- **No framework.** Lit was a "wanted to learn it" choice in the original app, not a
  requirement, and nothing in the redesign (all gesture/animation logic) benefits from
  it — the working prototype is plain JS/CSS. Drop `lit-element`.
- **No Polymer toolchain.** Drop `polymer-cli`, `polyserve`, `polymer.json` — Polymer's
  been dead as a project for years, and it only existed to serve Lit.
- **No bundler required.** Static files, served as-is by Netlify. `netlify.toml`'s
  build (`npm run build` → `polymer build`) needs to change — likely no build command
  at all. Vite is a fine option later purely for local dev-server convenience, not
  required.
- **No `idb-keyval`.** Originally kept for local caching of rates/date, but it imports
  via a bare module specifier (`import ... from "idb-keyval"`), which only resolved
  because Polymer's old build step rewrote it — with no build step, the browser can't
  resolve it at all, and the whole module fails to load silently (this is what caused
  the "blank currency list" bug on first deploy: nothing in `app.js` ran). Caching two
  small values doesn't need a library — swapped for plain `localStorage`.
- **Keep** the service worker (PWA offline support) — though its
  `TrustedWebActivity`-specific framing is now stale since the app isn't targeting the
  Play Store.
- **Data source unchanged**: ECB reference-rates XML via the existing Cloudflare Worker
  proxy (`https://red-band-e7de.pokerdiary.workers.dev/`), which lives outside this repo.
- **No tests for now.** If added later: Playwright (not Cypress — preference for
  Microsoft's tooling), native `test()`/`expect()` syntax rather than a Gherkin/BDD
  layer (drops `cypress-cucumber-preprocessor` too). The one existing test
  (`TrustedWebActivity.feature`) is stale regardless, given no Play Store target.
