# Modal Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal search overlay that opens from the nav Search icon, blurs the page, focuses an input, shows a Recent/Popular/Trending panel, and returns a working "coffee" result linking to `/beverages/coffee`.

**Architecture:** A self-contained `blocks/search/` module (a default-exported `openSearch(trigger)` controller + scoped CSS) builds a single overlay under `<body>` on first open and reuses it. The header lazily `import()`s the module on the first click of the existing Search icon. All panel/result data is hardcoded in the module for this step.

**Tech Stack:** Vanilla ES6 JS (no build, no deps), CSS3 with existing brand tokens, Adobe Edge Delivery Services (`loadCSS`, `createOptimizedPicture` from `scripts/aem.js`).

## Global Constraints

- No build step, no transpiling, no new npm dependencies. Vanilla ES6+ only.
- Always include `.js` extensions in imports; Unix (LF) line endings.
- CSS scoped to the block: every selector under `.search-overlay` / `.search-*`. No bare selectors; avoid `-container`/`-wrapper` suffixes.
- Mobile-first CSS; `min-width` media queries at 600px/900px/1200px only.
- Do NOT modify `scripts/aem.js`.
- Commit no new image/binary assets — thumbnails reference existing served media (`/media_<hash>.jpg`).
- Verification per task: `npm run lint` must pass, plus the browser checks listed. Dev server: `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` at `http://localhost:3000`.
- Reference: spec at `docs/superpowers/specs/2026-08-10-modal-search-design.md`.

---

## File Structure

- **Create** `blocks/search/search.js` — the search controller: hardcoded data, overlay builder, open/close, focus trap, query rendering. Default export `openSearch(trigger)`.
- **Create** `blocks/search/search.css` — all overlay/modal/panel/results styles + transitions + reduced-motion.
- **Modify** `blocks/header/header.js` — wire the existing Search tool icon to lazily import and open the modal.

---

## Task 1: Search module shell — overlay opens/closes accessibly from the nav

**Files:**
- Create: `blocks/search/search.js`
- Create: `blocks/search/search.css`
- Modify: `blocks/header/header.js` (nav-tools decoration loop, around `header.js:179-189`)

**Interfaces:**
- Consumes: `loadCSS` from `scripts/aem.js`.
- Produces: `blocks/search/search.js` default export `openSearch(trigger: Element) : void` — builds the overlay once (lazily), reveals it, focuses the input, and restores focus to `trigger` on close. Internal (not exported) but relied on by later tasks: module-scoped `overlay`, `input`, `defaultPanel`, `resultsPanel` elements, and a `render(query: string)` function (added in Task 3; a stub in Task 1).

- [ ] **Step 1: Create `blocks/search/search.js` with the controller shell**

```js
import { loadCSS } from '../../scripts/aem.js';

const SEARCH_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2" stroke-linecap="round"></path></svg>';

let overlay;
let modal;
let input;
let defaultPanel;
let resultsPanel;
let lastFocused;

// Placeholder render; real logic added in Task 3.
function render() {
  if (!input) return;
  const hasQuery = input.value.trim().length > 0;
  defaultPanel.hidden = hasQuery;
  resultsPanel.hidden = !hasQuery;
}

function getFocusable() {
  return [...modal.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hidden && el.offsetParent !== null);
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = getFocusable();
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    // eslint-disable-next-line no-use-before-define
    close();
  } else {
    trapFocus(e);
  }
}

function close() {
  if (!overlay || !overlay.classList.contains('is-open')) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
  const restore = lastFocused;
  const onEnd = () => {
    overlay.hidden = true;
    overlay.removeEventListener('transitionend', onEnd);
  };
  overlay.addEventListener('transitionend', onEnd);
  // Fallback if transitions are disabled (reduced motion / no transition).
  if (getComputedStyle(overlay).transitionDuration === '0s') onEnd();
  if (restore && typeof restore.focus === 'function') restore.focus();
}

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-label="Site search">
      <div class="search-bar">
        <span class="search-bar-icon">${SEARCH_ICON}</span>
        <input class="search-input" type="search" autocomplete="off"
          placeholder="Search products, guides, cafés…"
          aria-label="Search products, guides, cafés">
        <button class="search-esc" type="button" aria-label="Close search">ESC</button>
      </div>
      <div class="search-body">
        <div class="search-default"></div>
        <div class="search-results" hidden></div>
      </div>
    </div>`;

  modal = overlay.querySelector('.search-modal');
  input = overlay.querySelector('.search-input');
  defaultPanel = overlay.querySelector('.search-default');
  resultsPanel = overlay.querySelector('.search-results');

  input.addEventListener('input', render);
  overlay.querySelector('.search-esc').addEventListener('click', close);
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) close();
  });

  document.body.append(overlay);
}

function open(trigger) {
  lastFocused = trigger || document.activeElement;
  if (overlay.hidden) {
    overlay.hidden = false;
    // Force reflow so the transition runs from the hidden state.
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
  }
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeydown);
  input.value = '';
  render();
  input.focus();
}

/**
 * Opens the modal search overlay, building it on first call.
 * @param {Element} trigger element to restore focus to on close
 */
export default function openSearch(trigger) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/search/search.css`);
  if (!overlay) buildOverlay();
  open(trigger);
}
```

- [ ] **Step 2: Create `blocks/search/search.css` (overlay, modal, bar, transitions, reduced motion)**

```css
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(1rem, 8vh, 6rem) var(--gutter) var(--gutter);
  background-color: oklch(22.2% 0.016 52deg / 45%);
  opacity: 0;
  transition: opacity var(--dur-1) var(--ease-quint), backdrop-filter var(--dur-1) var(--ease-quint);
}

.search-overlay.is-open {
  opacity: 1;
  backdrop-filter: blur(6px);
}

.search-modal {
  width: 100%;
  max-width: 760px;
  background-color: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform: translateY(16px) scale(0.98);
  opacity: 0;
  transition: transform var(--dur-2) var(--ease-expo), opacity var(--dur-1) var(--ease-quint);
}

.search-overlay.is-open .search-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--line);
}

.search-bar-icon {
  display: inline-flex;
  color: var(--ink-soft);
}

.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--fs-body-lg);
  color: var(--ink);
}

.search-input::placeholder { color: var(--ink-soft); }
.search-input:focus { outline: none; }
.search-input::-webkit-search-cancel-button { appearance: none; }

.search-esc {
  border: 1px solid var(--line);
  background: transparent;
  border-radius: var(--r-sm);
  padding: 0.25rem 0.5rem;
  font-family: var(--font-body);
  font-size: var(--fs-eyebrow);
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  cursor: pointer;
  transition: color var(--dur-1) var(--ease-quint), border-color var(--dur-1) var(--ease-quint);
}

.search-esc:hover { color: var(--ink); border-color: var(--ink-soft); }

.search-body { padding: var(--space-lg); max-height: min(60vh, 520px); overflow-y: auto; }

@media (prefers-reduced-motion: reduce) {
  .search-overlay,
  .search-modal {
    transition: none;
  }

  .search-overlay.is-open { backdrop-filter: blur(6px); }
  .search-modal { transform: none; }
}
```

- [ ] **Step 3: Wire the header Search icon to open the modal**

In `blocks/header/header.js`, inside the `navTools.querySelectorAll('a').forEach(...)` loop, after the existing `link.innerHTML = ...` line that sets the SVG icon, add a click handler only for the search key. Change the loop body tail from:

```js
      link.setAttribute('aria-label', label);
      link.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icon}</svg>`;
```

to:

```js
      link.setAttribute('aria-label', label);
      link.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icon}</svg>`;
      if (key === 'search') {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const { default: openSearch } = await import('../search/search.js');
          openSearch(link);
        });
      }
```

- [ ] **Step 4: Lint**

Run:
```bash
npm run lint
```
Expected: PASS (no errors). If `no-use-before-define` fires on `close`, confirm the eslint-disable comment is present; fix any real issues.

- [ ] **Step 5: Browser verification**

Start the dev server if not running, open `http://localhost:3000/` (any page with the header). Verify:
- Clicking the Search icon opens a centered card; the page behind dims and blurs; the input is focused.
- The card animates in (rises/settles) rather than snapping.
- Pressing `ESC`, clicking the `ESC` chip, or clicking the dimmed area outside the card all close it.
- After closing, keyboard focus is back on the Search icon (press Tab — focus moves from the icon).
- While open, the page body does not scroll.
- Pressing Tab repeatedly keeps focus inside the card (input → ESC chip → input …).

- [ ] **Step 6: Commit**

```bash
git add blocks/search/search.js blocks/search/search.css blocks/header/header.js
git commit -m "feat(search): modal overlay opens from nav with accessible open/close"
```

---

## Task 2: Default panel — Recent, Popular, Trending (matches screenshot)

**Files:**
- Modify: `blocks/search/search.js` (add data + `renderDefault()`, call it from `buildOverlay`)
- Modify: `blocks/search/search.css` (panel styles)

**Interfaces:**
- Consumes: `defaultPanel` element and `input` from Task 1; `createOptimizedPicture` from `scripts/aem.js`.
- Produces: `renderDefault()` populating `defaultPanel`; chip buttons carry their text so Task 3 can read it. Trending rows are `<a class="search-trending-item">`.

- [ ] **Step 1: Add data + icons + `renderDefault()` to `search.js`**

Add `createOptimizedPicture` to the existing aem.js import:

```js
import { loadCSS, createOptimizedPicture } from '../../scripts/aem.js';
```

Add near the top (after `SEARCH_ICON`):

```js
const CLOCK_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 1.5" stroke-linecap="round"></path></svg>';

const RECENT = ['atelier mini', 'cold brew beans', 'nearest café'];
const POPULAR = ['bean subscription', 'flavour dna', 'espresso blend', 'gift sets'];
const TRENDING = [
  {
    name: 'The Atelier',
    price: '$2,199',
    href: '/machines/atelier',
    img: '/media_1a775c161149ea61e50ce787b6c0adb646148c6ca.jpg',
  },
  {
    name: 'Morning Blend coffee',
    price: 'from $10',
    href: '/beverages/coffee',
    img: '/media_126153dedaaab1e3fdd811716e201bae4bcfcf30f.jpg',
  },
];
```

Add these functions (above `buildOverlay`):

```js
function chip(text, withClock) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'search-chip';
  btn.dataset.query = text;
  btn.innerHTML = `${withClock ? `<span class="search-chip-icon">${CLOCK_ICON}</span>` : ''}<span>${text}</span>`;
  return btn;
}

function trendingItem(item) {
  const a = document.createElement('a');
  a.className = 'search-trending-item';
  a.href = item.href;
  const picture = createOptimizedPicture(item.img, item.name, false, [{ width: '160' }]);
  picture.classList.add('search-trending-thumb');
  const img = picture.querySelector('img');
  if (img) {
    img.width = 56;
    img.height = 56;
    img.addEventListener('error', () => { picture.classList.add('is-empty'); });
  }
  a.append(picture);
  a.insertAdjacentHTML('beforeend', `
    <span class="search-trending-name">${item.name}</span>
    <span class="search-trending-price">${item.price}</span>`);
  return a;
}

function group(title) {
  const section = document.createElement('section');
  section.className = 'search-group';
  section.innerHTML = `<p class="search-group-title">${title}</p>`;
  return section;
}

function renderDefault() {
  defaultPanel.textContent = '';

  const recent = group('Recent');
  const recentChips = document.createElement('div');
  recentChips.className = 'search-chips';
  RECENT.forEach((t) => recentChips.append(chip(t, true)));
  recent.append(recentChips);

  const popular = group('Popular searches');
  const popularChips = document.createElement('div');
  popularChips.className = 'search-chips';
  POPULAR.forEach((t) => popularChips.append(chip(t, false)));
  popular.append(popularChips);

  const trending = group('Trending now');
  const trendingList = document.createElement('div');
  trendingList.className = 'search-trending';
  TRENDING.forEach((item) => trendingList.append(trendingItem(item)));
  trending.append(trendingList);

  defaultPanel.append(recent, popular, trending);
}
```

In `buildOverlay()`, after the element references are assigned and before appending to body, call it:

```js
  renderDefault();
```

- [ ] **Step 2: Add panel styles to `search.css`**

```css
.search-group + .search-group { margin-top: var(--space-lg); }

.search-group-title {
  margin: 0 0 var(--space-sm);
  font-family: var(--font-body);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--ink-soft);
}

.search-chips { display: flex; flex-wrap: wrap; gap: var(--space-2xs); }

.search-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  color: var(--ink);
  cursor: pointer;
  transition: background-color var(--dur-1) var(--ease-quint), border-color var(--dur-1) var(--ease-quint);
}

.search-chip:hover { background-color: var(--paper-2); border-color: var(--ink-soft); }
.search-chip-icon { display: inline-flex; color: var(--ink-soft); }

.search-trending { display: flex; flex-direction: column; }

.search-trending-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: color var(--dur-1) var(--ease-quint);
}

.search-trending-item:first-child { border-top: 0; }
.search-trending-item:hover { color: var(--terracotta); }

.search-trending-thumb {
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  border-radius: var(--r-md);
  overflow: hidden;
  background-color: var(--paper-2);
}

.search-trending-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.search-trending-thumb.is-empty img { display: none; }

.search-trending-name {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--fs-body-lg);
  font-weight: 600;
}

.search-trending-price { font-family: var(--font-display); font-weight: 700; }
```

- [ ] **Step 3: Lint**

Run:
```bash
npm run lint
```
Expected: PASS.

- [ ] **Step 4: Browser verification**

Reload `http://localhost:3000/`, open search. Verify against the reference screenshot:
- "Recent" shows three pills with a clock icon: atelier mini, cold brew beans, nearest café.
- "Popular searches" shows four outline pills: bean subscription, flavour dna, espresso blend, gift sets.
- "Trending now" shows two rows: **The Atelier — $2,199** (with the Atelier machine thumbnail) and **Morning Blend coffee — from $10** (with a thumbnail). Both thumbnails load real images; if one 404s, the tile shows the paper-2 placeholder rather than a broken image.
- Rows are clickable links (hover turns terracotta).

- [ ] **Step 5: Commit**

```bash
git add blocks/search/search.js blocks/search/search.css
git commit -m "feat(search): default panel with recent, popular and trending"
```

---

## Task 3: Query behavior — "coffee" result, empty state, chip click

**Files:**
- Modify: `blocks/search/search.js` (replace the stub `render()`, add `renderResults()`, wire chip clicks)
- Modify: `blocks/search/search.css` (results + empty-state styles)

**Interfaces:**
- Consumes: `input`, `defaultPanel`, `resultsPanel` from Task 1; `search-chip` buttons (with `dataset.query`) from Task 2.
- Produces: final `render(query)` behavior. Result rows are `<a class="search-result">`.

- [ ] **Step 1: Add result data + `renderResults()`, replace the stub `render()`**

Add the matcher data near the other constants:

```js
const RESULTS = [
  {
    match: (q) => q.includes('coffee'),
    label: 'Coffee',
    sub: 'in Beverages',
    href: '/beverages/coffee',
  },
];
```

Add `renderResults()` (above `render`) and replace the placeholder `render()` from Task 1 with the real one:

```js
function resultRow({ label, sub, href }) {
  const a = document.createElement('a');
  a.className = 'search-result';
  a.href = href;
  a.innerHTML = `<span class="search-result-label">${label}</span><span class="search-result-sub">${sub}</span>`;
  return a;
}

function renderResults(query) {
  resultsPanel.textContent = '';
  const q = query.toLowerCase();
  const matches = RESULTS.filter((r) => r.match(q));
  if (matches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = `No results for “${query}”`;
    resultsPanel.append(empty);
    return;
  }
  matches.forEach((m) => resultsPanel.append(resultRow(m)));
}

function render() {
  const query = input.value.trim();
  const hasQuery = query.length > 0;
  defaultPanel.hidden = hasQuery;
  resultsPanel.hidden = !hasQuery;
  if (hasQuery) renderResults(query);
}
```

- [ ] **Step 2: Wire chip clicks (fill input + re-render)**

In `buildOverlay()`, after the existing `input.addEventListener('input', render);` line, add delegated chip handling on the default panel:

```js
  defaultPanel.addEventListener('click', (e) => {
    const c = e.target.closest('.search-chip');
    if (!c) return;
    input.value = c.dataset.query;
    render();
    input.focus();
  });
```

- [ ] **Step 3: Add results + empty-state styles to `search.css`**

```css
.search-result {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: color var(--dur-1) var(--ease-quint);
}

.search-result:first-child { border-top: 0; }
.search-result:hover { color: var(--terracotta); }

.search-result-label {
  font-family: var(--font-display);
  font-size: var(--fs-body-lg);
  font-weight: 600;
}

.search-result-sub { color: var(--ink-soft); font-size: var(--fs-sm); }

.search-empty { margin: 0; padding: var(--space-md) 0; color: var(--ink-soft); }

.search-results { animation: search-fade var(--dur-1) var(--ease-quint); }

@keyframes search-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .search-results { animation: none; }
}
```

- [ ] **Step 4: Lint**

Run:
```bash
npm run lint
```
Expected: PASS.

- [ ] **Step 5: Browser verification (full feature)**

Reload `http://localhost:3000/`, open search:
- Type `coffee` → the default panel is replaced by one result: **Coffee — in Beverages**; its `href` is `/beverages/coffee` (hover status bar or inspect). Clicking it navigates there.
- Type `COFFEE beans` (mixed case, extra word) → the coffee result still appears (contains-match, case-insensitive).
- Type `espresso` → shows "No results for "espresso"".
- Clear the input → the Recent/Popular/Trending panel returns.
- Click the "cold brew beans" Recent chip → input fills with "cold brew beans" and results update (empty state), input stays focused.
- Re-confirm ESC / backdrop / ESC-chip close still work and focus returns to the Search icon.
- Toggle OS "reduce motion" and confirm the modal still opens/closes and swaps panels without animation.

- [ ] **Step 6: Commit**

```bash
git add blocks/search/search.js blocks/search/search.css
git commit -m "feat(search): coffee query result, empty state and chip-to-input"
```

---

## Self-Review

**Spec coverage:**
- New `blocks/search/` module + header wiring → Task 1. ✓
- Overlay under `<body>`, blur/dim, focus, scroll lock, ESC/backdrop close, focus trap, focus restore → Task 1. ✓
- Default panel (Recent/Popular/Trending) hardcoded, thumbnails from existing media with placeholder fallback → Task 2. ✓
- "coffee" contains-match result → `/beverages/coffee`, empty input restores panel, other queries → empty state, chip fills input → Task 3. ✓
- SPA-like transitions + `prefers-reduced-motion` → Task 1 (overlay/modal) + Task 3 (results fade), reduced-motion blocks in both. ✓
- A11y (dialog roles, aria-labels, real buttons/links) → Tasks 1–3. ✓
- Lint clean + browser verification + no new assets → every task's verify + Global Constraints. ✓

**Placeholder scan:** No TBD/TODO; all code blocks are complete. The Task 1 `render()` is an intentional, working stub explicitly replaced in Task 3 (noted in both places).

**Type consistency:** `openSearch(trigger)`, `render()`, `renderDefault()`, `renderResults(query)`, `buildOverlay()`, `open()`, `close()` names consistent across tasks. Class names (`.search-overlay`, `.search-modal`, `.search-input`, `.search-default`, `.search-results`, `.search-chip` + `dataset.query`, `.search-trending-item`, `.search-result`) match between JS creation and CSS. `createOptimizedPicture(src, alt, eager, breakpoints)` matches `scripts/aem.js`.
