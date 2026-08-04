import { createOptimizedPicture } from '../../scripts/aem.js';

const toKey = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Builds the category filter bar from the section's flattened filter paragraph.
 * The import collapses the pill labels into a single paragraph
 * ("All posts The Atelier Brewing Origins Café life Sustainability"); we split
 * it back into pills using the card categories as the vocabulary, then wire each
 * pill to show/hide cards by category. Returns the bar element (or null).
 * @param {Element} block the cards-article block
 * @param {string[]} categories distinct card categories, in document order
 * @param {NodeListOf<Element>} cards the article <li> cards
 */
function buildFilter(block, categories, cards) {
  const section = block.closest('.section');
  // The filter only exists on the blog listing, where the import flattens the
  // pill labels into a single paragraph ("All posts …") ahead of the grid. On
  // the article page's "More from the Journal" grid there is no such paragraph,
  // so we build no filter there.
  const flatFilter = section
    ? [...section.querySelectorAll('.default-content-wrapper > p')]
      .find((p) => /^all\b/i.test(p.textContent.trim()))
    : null;
  if (!flatFilter) return null;

  // Match the flattened text against known labels (card categories, longest
  // first) to recover the authored order incl. labels with no cards yet.
  let labels = categories.slice();
  {
    const vocab = [...categories].sort((a, b) => b.length - a.length);
    const startsWithKnown = (text) => vocab
      .find((c) => text.toLowerCase().startsWith(c.toLowerCase()));
    const nextKnownIndex = (text) => {
      const hits = vocab
        .map((c) => text.toLowerCase().indexOf(c.toLowerCase()))
        .filter((i) => i > 0);
      return hits.length ? Math.min(...hits) : text.length;
    };
    let rest = flatFilter.textContent.trim().replace(/^all\s+posts\s*/i, '');
    const ordered = [];
    while (rest.length) {
      const match = startsWithKnown(rest);
      if (match) {
        ordered.push(match);
        rest = rest.slice(match.length).trim();
      } else {
        // Unknown label (e.g. a category with no articles): take up to the next
        // known label so multi-word labels stay intact.
        const cut = nextKnownIndex(rest);
        ordered.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
    }
    if (ordered.length) labels = ordered;
  }

  const bar = document.createElement('div');
  bar.className = 'cards-article-filter';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter posts by category');

  const defs = [{ key: 'all', label: 'All posts' },
    ...labels.map((l) => ({ key: toKey(l), label: l }))];

  const apply = (key) => {
    cards.forEach((card) => {
      const show = key === 'all' || card.dataset.category === key;
      card.classList.toggle('is-filtered-out', !show);
    });
    bar.querySelectorAll('button').forEach((b) => {
      const active = b.dataset.key === key;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  defs.forEach((d) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cards-article-filter-tab';
    btn.dataset.key = d.key;
    btn.textContent = d.label;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => apply(d.key));
    bar.append(btn);
  });

  flatFilter.replaceWith(bar);
  apply('all');
  return bar;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  const categories = [];
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    let emptyImageCell = null;
    let headingText = '';
    [...li.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-article-card-image';
      } else if (!cell.children.length && !cell.textContent.trim()) {
        // empty authored image cell -- render a labelled image-slot placeholder
        cell.className = 'cards-article-card-image cards-article-card-image-empty';
        emptyImageCell = cell;
      } else {
        cell.className = 'cards-article-card-body';
        const paras = [...cell.querySelectorAll(':scope > p')];
        if (paras.length) {
          // first paragraph before the heading is the category label
          const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
          const [firstPara] = paras;
          let categoryPara = null;
          if (heading && heading.previousElementSibling === firstPara) {
            categoryPara = firstPara;
            categoryPara.className = 'cards-article-card-category';
            const label = categoryPara.textContent.trim();
            li.dataset.category = toKey(label);
            if (label && !categories.includes(label)) categories.push(label);
          }
          if (heading) headingText = heading.textContent.trim();
          // last paragraph is the date / read-time meta line — but only when it
          // is a genuine trailing paragraph, not the category label itself.
          const lastPara = paras[paras.length - 1];
          if (lastPara !== categoryPara) lastPara.classList.add('cards-article-card-meta');
        }
      }
    });
    // Fill an empty image cell with an icon + the card title, mirroring the
    // source's image-slot placeholder.
    if (emptyImageCell) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.classList.add('cards-article-card-image-icon');
      icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" fill="none" stroke="currentColor" stroke-width="1.5"/>';
      const label = document.createElement('span');
      label.className = 'cards-article-card-image-label';
      label.textContent = headingText;
      emptyImageCell.append(icon, label);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  buildFilter(block, categories, ul.querySelectorAll(':scope > li'));
}
