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
- Dark mode currently follows system preference (`prefers-color-scheme`) only. A manual
  override is planned as part of Settings (below) — this hadn't actually been decided
  when an earlier version of this doc claimed it had; correcting the record.

## Settings

A settings gear is now justified — three genuine, independent preferences have come up,
past the "2-3 real settings" threshold that was blocking it:

- **Theme**: Light / Dark / Use device setting — three-way, device as the default.
- **Language**: "Use device language" as the default/top option, explicit list below —
  same auto-with-override shape as theme, for consistency between the two.
  - Translation surface is smaller than it looks: currency full names ("Canadian
    Dollar") and number/currency formatting can lean on the browser's own
    `Intl.DisplayNames` and locale-aware `toLocaleString` instead of a hand-maintained
    dictionary per language. What actually needs hand translation is a short, fixed
    list of UI strings ("Buying power", "Cost", "for", the footer's ECB attribution
    sentence, a couple of `aria-label`s) — a plain JS object per locale, no i18n
    library needed.
- **Select currencies**: replaces the rejected favorites system (see Currency scope)
  with a better home for the same underlying need. Because curation now lives in an
  infrequently-opened settings screen instead of always-visible table chrome, the
  problems that killed favorites don't apply here — no need for a max-count cap or an
  eviction rule; whatever's checked in settings directly *is* the rotation list swipe
  and tap already operate on, no separate favorites-vs-catalog split.

Not designed yet: how the settings screen is presented (likely a simple overlay, no
router/framework needed) and where the gear icon lives visually.

**Possible future settings, not committed — noted so "settings" doesn't quietly become
a junk drawer later.** Raised while brainstorming, no design work done:
- Default starting amount (currently always opens at 100)
- A rate margin/fee percentage on top of the raw ECB rate, to match what a user's own
  bank/exchange actually charges
- A rounding preference coarser than the currency's own convention (`Intl` already
  handles per-currency decimals correctly, e.g. no cents shown for JPY)
- Haptic feedback on the swipe gesture, where supported

Two ideas that came up in the same conversation but are **features, not settings** —
they change what the app *does*, not how it behaves, so they don't belong in this
screen even if built: rate history/trend, and sharing a conversion (see below).

## Sharing

Explored as a possible growth lever, with expectations kept honest: this isn't a
Wordle-style vanity share (nobody shares a currency conversion as an achievement) — the
realistic trigger is someone mid-decision wanting to send an actual number to whoever
they're deciding with. Built accordingly:

- **What's shared**: each currency's name in the table is a real `<a>` link to that
  specific base→target conversion, not a custom gesture. Long-press on it gets the
  native OS share sheet **for free** — no gesture-detection code, no taught hint needed,
  because it's just how browsers already treat any link. A normal tap still selects that
  row as base as before (`preventDefault`'d so it doesn't navigate); long-press bypasses
  our JS entirely at the OS level, so both behaviors coexist on the same element.
- **Values are static, not live**: the actual computed value is baked into the URL
  itself (`?amount=100&from=CAD&to=USD&value=73.47&date=2026-09-13`), not just the
  inputs to a recalculation. Whoever opens the link — a day or a year later — sees
  exactly what was shared. The alternative (recalculating live on open) risks the
  number in the link preview/text not matching what's on the page, which breaks trust
  fast.
- **Date format is `y/m/d`, deliberately not a locale format.** A shared link leaves
  its original context — `03/04/2026` means different dates in the US vs. nearly
  everywhere else, but year-first is unambiguous to everyone even if it's nobody's
  native format.
- **The landing page for a shared link is a distinct snapshot view**, not the live
  interactive tool: the frozen pair, clearly dated "as of", with an explicit "See live
  rates" handoff into the real app. Keeps the frozen fact honest (never mistaken for
  current) while still funneling into actual product usage.
- **Link previews (what shows in iMessage/WhatsApp/Slack before anyone clicks) are not
  solved by the above alone.** Those clients read static `<meta>` tags from the raw
  HTML response without running JavaScript, so a purely static/client-side page can't
  show the actual shared numbers in the preview card — it would show the same generic
  card for every link. That needs a small serverless function to read the URL's query
  params server-side and write real `<meta>` tags per request (title showing the actual
  numbers; static app icon as the image — decided against a fully rendered image card
  for now, that's more machinery than the value clearly earns yet). **Not yet built** —
  natural fit for a small Cloudflare Worker/Pages Function, which ties back into the
  hosting-consolidation option raised earlier (the ECB proxy already lives on
  Cloudflare).

## Explicitly out of scope

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
