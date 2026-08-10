import { loadCSS, createOptimizedPicture } from '../../scripts/aem.js';

const SEARCH_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2" stroke-linecap="round"></path></svg>';
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

let overlay;
let modal;
let input;
let defaultPanel;
let resultsPanel;
let lastFocused;
let hideTimer;

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
  // transitionend is unreliable (doesn't fire when throttled/backgrounded) and,
  // since it bubbles, fires on whichever transition ends first rather than the
  // longest one — so teardown relies solely on a timeout covering --dur-2
  // (the longest transition, 0.6s), with margin.
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    overlay.hidden = true;
  }, 650);
  if (restore && typeof restore.focus === 'function') restore.focus();
}

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

  renderDefault();

  input.addEventListener('input', render);
  overlay.querySelector('.search-esc').addEventListener('click', close);
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) close();
  });

  document.body.append(overlay);
}

function open(trigger) {
  lastFocused = trigger || document.activeElement;
  // Cancel a pending hide from a prior close() so a rapid re-open doesn't get
  // hidden out from under the user.
  clearTimeout(hideTimer);
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
