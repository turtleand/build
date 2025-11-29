import Fuse from 'fuse.js';

/**
 * @typedef {Object} SearchDoc
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 * @property {string} body
 * @property {string} href
 * @property {string} dateLabel
 */

/**
 * @typedef {Object} SearchConfig
 * @property {string} [countResults]
 * @property {string} [defaultCount]
 * @property {string} [readMoreLabel]
 * @property {string} [tagsLabel]
 */

const DATA_ID = 'home-search-data';
const CONFIG_ID = 'home-search-config';

/**
 * @param {string | undefined} template
 * @param {number} count
 */
const replaceCount = (template, count) =>
  (template || '').replace('{count}', String(count));

const setupSearch = () => {
  const dataEl = document.getElementById(DATA_ID);
  const configEl = document.getElementById(CONFIG_ID);

  if (!dataEl || !configEl) {
    console.warn('Search payload missing.');
    return;
  }

  /** @type {SearchDoc[]} */
  const docs = JSON.parse(dataEl.textContent || '[]');
  /** @type {SearchConfig} */
  const config = JSON.parse(configEl.textContent || '{}');

  const fuse =
    docs.length > 0
      ? new Fuse(docs, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.2 },
          { name: 'body', weight: 0.3 },
          { name: 'tags', weight: 0.1 },
        ],
        threshold: 0.3,
        ignoreLocation: false,
        minMatchCharLength: 4,
      })
      : null;

  /** @type {HTMLInputElement | null} */
  const input = document.querySelector('[data-search-input]');
  /** @type {HTMLButtonElement | null} */
  const clearBtn = document.querySelector('[data-search-clear]');
  /** @type {HTMLElement | null} */
  const resultsGrid = document.querySelector('[data-search-grid]');
  /** @type {HTMLElement | null} */
  const emptyState = document.querySelector('[data-search-empty]');
  /** @type {HTMLElement | null} */
  const countLabel = document.querySelector('[data-search-count]');
  /** @type {NodeListOf<HTMLTemplateElement>} */
  const templateNodes = document.querySelectorAll('[data-card-template]');

  if (!input || !clearBtn || !resultsGrid || !emptyState || !countLabel) {
    console.warn('Search UI missing required elements.');
    return;
  }

  /** @type {Map<string, HTMLTemplateElement>} */
  const templateMap = new Map();
  templateNodes.forEach((tpl) => {
    const slug = tpl.dataset.slug;
    if (slug) templateMap.set(slug, tpl);
  });

  /**
   * @param {SearchDoc} doc
   */
  const buildCardNode = (doc) => {
    const template = templateMap.get(doc.id);
    if (template) {
      const fragment = template.content.cloneNode(true);
      const element = fragment.firstElementChild;
      if (element) return /** @type {HTMLElement} */ (element);
    }

    // Fallback: basic card if template missing
    const fallback = document.createElement('article');
    fallback.className = 'post-card';
    fallback.innerHTML = `
      <a class="card-link" href="${doc.href}">
        <div class="post-top">
          <h3>${doc.title}</h3>
          <p class="post-date">${doc.dateLabel}</p>
        </div>
        <p class="post-description">${doc.description}</p>
      </a>
    `;
    return fallback;
  };

  const setDefaultState = () => {
    resultsGrid.innerHTML = '';
    resultsGrid.hidden = true;
    emptyState.hidden = true;
    countLabel.textContent = config.defaultCount || '';
    clearBtn.hidden = true;
  };

  /**
   * @param {SearchDoc[]} matches
   */
  const renderMatches = (matches) => {
    const nodes = matches
      .map((match) => buildCardNode(match))
      .filter((node) => Boolean(node));
    const hasMatches = matches.length > 0;
    if (hasMatches) {
      resultsGrid.replaceChildren(...nodes);
      resultsGrid.hidden = false;
      emptyState.hidden = true;
    } else {
      resultsGrid.innerHTML = '';
      resultsGrid.hidden = true;
      emptyState.hidden = false;
    }
    countLabel.textContent = replaceCount(config.countResults, matches.length);
    clearBtn.hidden = false;
  };

  const runSearch = () => {
    const query = input.value.trim();
    if (!fuse || query.length === 0) {
      setDefaultState();
      return;
    }

    const matches = fuse.search(query).map((item) => item.item);
    renderMatches(matches);
  };

  input.addEventListener('input', runSearch);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    input.focus();
    runSearch();
  });

  setDefaultState();
};

const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSearch, { once: true });
  } else {
    setupSearch();
  }
};

if (typeof window !== 'undefined') {
  init();
}
