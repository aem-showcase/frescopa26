# Modal Search — Design

**Date:** 2026-08-10
**Status:** Approved design, pending implementation plan

## Goal

Add a modal search experience that opens when the user clicks the Search icon in
the top nav. It focuses an input, blurs/dims the page behind it, shows a default
panel (Recent / Popular / Trending) matching the reference screenshot, and — for
this step of the build — returns a working result for the query "coffee" that
links to `/beverages/coffee`. Motion should feel like a single-page app: smooth,
settled transitions rather than an abrupt show/hide.

Vanilla HTML/CSS/JS only, no dependencies, no build step, per project conventions.

## Scope (this step)

In scope:
- New self-contained `blocks/search/` module (`search.js` + `search.css`).
- Header wires the existing Search icon to open the modal.
- Full default panel from the screenshot: Recent chips, Popular Searches chips,
  Trending Now product rows — all from **hardcoded** data in `search.js`.
- Live query handling: typing "coffee" shows one result linking to
  `/beverages/coffee`. Empty input restores the default panel. Any other
  non-empty query shows a friendly "no results" state.
- SPA-like transitions with `prefers-reduced-motion` support.
- Full keyboard/accessibility support (dialog semantics, focus trap, ESC, focus
  restore).

Out of scope (future steps):
- Real search backend / index, query suggestions API, analytics.
- Authoring the panel data as EDS block content (it is hardcoded for now).
- Keyboard arrow-key navigation *between* result rows (ESC + tab order only for now).

## Architecture

### Files
- `blocks/search/search.js` — builds and controls the overlay; exports an
  `openSearch()` controller (lazily builds the DOM on first open).
- `blocks/search/search.css` — all modal styles, scoped under `.search-overlay`.

### Wiring from the header
`blocks/header/header.js` already decorates the Search tool link in `.nav-tools`
into an SVG icon button (`header.js:179`). We enhance that specific link:
- Add a click handler that calls `preventDefault()` and dynamically
  `import('../search/search.js')` then opens the modal. This keeps search code
  out of the eager path (loaded on first interaction).
- Progressive enhancement: the element stays a real `<a>` (with an accessible
  label); if JS never loads, clicking it is a harmless navigation, not a dead
  control. We set `href="#search"` semantics via the existing link.

The overlay DOM is appended to `document.body` (not inside the header block) so
the backdrop can cover the whole viewport and focus trapping is self-contained.

### Controller shape (search.js)
- Singleton: build the overlay once on first open, reuse thereafter.
- `open()`: append/reveal overlay, lock body scroll, focus input, remember the
  trigger element to restore focus on close.
- `close()`: reverse transitions, unlock scroll, restore focus to trigger.
- `render(query)`: decides default panel vs results vs empty state.
- Event listeners: input, keydown (ESC), backdrop click, result/chip clicks.

## DOM structure

```
.search-overlay                      role="presentation", covers viewport
  .search-modal                      role="dialog" aria-modal="true"
                                     aria-label="Site search"
    .search-bar
      <svg magnifier icon>
      <input type="search"           aria-label="Search products, guides, cafés"
             placeholder="Search products, guides, cafés…">
      <kbd class="search-esc">ESC</kbd>   (click also closes)
    .search-body
      .search-default                (shown when input empty)
        section Recent   → .search-group-title + .search-chips (clock-icon pills)
        section Popular  → .search-group-title + .search-chips (outline pills)
        section Trending → .search-group-title + .search-trending (product rows)
      .search-results                (shown when query present; hidden otherwise)
        (result rows OR .search-empty)
```

### Hardcoded data (in search.js)
- `recent`: `["atelier mini", "cold brew beans", "nearest café"]` (clock icon).
- `popular`: `["bean subscription", "flavour dna", "espresso blend", "gift sets"]`.
- `trending`: array of `{ name, price, href, img }`:
  - `The Atelier` — `$2,199` — `/machines/atelier` — Atelier machine image
    (`/media_1a775c161149ea61e50ce787b6c0adb646148c6ca.jpg`).
  - `Morning Blend coffee` — `from $10` — `/beverages/coffee` — a beverages image.
- `results` matcher: `query.toLowerCase().includes('coffee')` →
  `[{ label: 'Coffee', sub: 'in Beverages', href: '/beverages/coffee' }]`.

### Thumbnails
Each trending product renders a `<picture>` with a webp `source` and an optimized
`<img>` (small width, e.g. `?width=160&format=…&optimize=medium`, `loading="lazy"`,
fixed dimensions to avoid layout shift). Media is served from root
(`/media_<hash>.ext`) so paths are stable regardless of the current page. An
`onerror` handler swaps in a CSS placeholder tile so a missing/renamed asset never
shows a broken image.

## Behavior

- **Open:** click Search icon → overlay fades in, modal rises+scales into place,
  input autofocuses, body scroll locks.
- **Typing:**
  - empty → show `.search-default`, hide `.search-results`.
  - contains "coffee" → hide default, show one result linking to `/beverages/coffee`.
  - other non-empty → show `.search-empty` ("No results for '…'").
- **Chips:** clicking a Recent/Popular chip fills the input with its text and
  re-runs `render()` (so "espresso blend" etc. currently land on the empty state,
  "cold brew beans" would too — only "coffee" resolves this step).
- **Close on:** ESC key, click on backdrop (outside the modal card), or activating
  a result link (navigation). Focus returns to the Search icon.

## Transitions (SPA-like feel)

Using existing brand tokens (`--dur-1/2`, `--ease-quint`, `--ease-expo`,
`--shadow-lg`, `--paper`, `--line`, radii):
- Overlay: `opacity` + `backdrop-filter: blur(…)` transition in over `--dur-1`.
- Modal card: `opacity` + `transform: translateY(…) scale(…)` easing with
  `--ease-expo` so it settles rather than pops.
- Default↔results swap: quick opacity cross-fade.
- A `.is-open` class on the overlay drives the transition (toggled after append /
  before removal, with `transitionend` to fully remove/hide).
- Everything wrapped so that `@media (prefers-reduced-motion: reduce)` removes
  transforms/blur transitions and just toggles visibility.

## Accessibility

- `role="dialog"`, `aria-modal="true"`, labelled via the modal (`aria-label`) and
  the input has its own `aria-label`.
- Autofocus input on open; **focus trap**: Tab/Shift+Tab cycle within the modal.
- **Restore focus** to the triggering Search icon on close.
- ESC closes (and the visible `ESC` chip is clickable for pointer users).
- Body scroll locked while open (`overflow: hidden` on `body`, restored on close).
- Chips and the ESC affordance are real `<button>`s; results are real `<a>`s.
- Icons are `aria-hidden`; interactive elements have discernible text/labels.

## CSS conventions

- All selectors scoped under `.search-overlay` / `.search-*` (no bare
  `.chips`/`.results`). Avoid `-container`/`-wrapper` suffixes.
- Mobile-first; the modal is near-full-width with side gutters on small screens
  and a fixed max-width centered card on ≥600px, matching the screenshot.

## Testing / verification

- Local: `npm run lint` clean (JS + CSS).
- Manual in browser at `http://localhost:3000` against a page that shows the
  header:
  - Click Search → modal opens, input focused, background blurred.
  - Type "coffee" → result appears linking to `/beverages/coffee`.
  - Clear input → default panel returns.
  - ESC / backdrop click closes and returns focus to the icon.
  - Tab stays trapped inside the modal.
  - `prefers-reduced-motion` disables motion.
- Verify no new binary/image assets are committed (thumbnails reference existing
  served media).
