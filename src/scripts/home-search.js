/**
 * @typedef {Object} SearchDoc
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 * @property {string} searchText
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

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {HTMLElement} parent
 * @param {T} tag
 * @param {string} className
 * @returns {HTMLElementTagNameMap[T]}
 */
const appendElement = (parent, tag, className) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  parent.append(element);
  return element;
};

/**
 * @param {SearchDoc[]} docs
 * @param {string} query
 */
const searchDocs = (docs, query) => {
  const normalizedQuery = query.toLocaleLowerCase();
  return docs.filter((doc) =>
    [doc.title, doc.description, doc.searchText, ...doc.tags]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
};

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

  /** @type {HTMLInputElement | null} */
  const input = document.querySelector('[data-search-input]');
  /** @type {HTMLButtonElement | null} */
  const clearBtn = document.querySelector('[data-search-clear]');
  /** @type {HTMLElement | null} */
  const resultsGrid = document.querySelector('[data-search-grid]');
  /** @type {HTMLElement | null} */
  const defaultGrid = document.querySelector('[data-post-grid]');
  /** @type {HTMLElement | null} */
  const pagination = document.querySelector('[data-pagination]');
  /** @type {HTMLElement | null} */
  const emptyState = document.querySelector('[data-search-empty]');
  /** @type {HTMLElement | null} */
  const countLabel = document.querySelector('[data-search-count]');

  if (!input || !clearBtn || !resultsGrid || !emptyState || !countLabel) {
    console.warn('Search UI missing required elements.');
    return;
  }

  const cardTemplates = new Map(
    Array.from(document.querySelectorAll('template[data-search-card-template]')).map((template) => [
      template.dataset.searchCardTemplate,
      template,
    ]),
  );

  /**
   * @param {SearchDoc} doc
   */
  const buildCardNode = (doc) => {
    const template = cardTemplates.get(doc.id);
    const card = template?.content.firstElementChild?.cloneNode(true);
    if (card instanceof HTMLElement) return card;

    const article = document.createElement('article');
    article.className = 'post-card post-card--list';

    const content = appendElement(article, 'div', 'post-content');
    const top = appendElement(content, 'div', 'post-top');
    appendElement(top, 'h3', '').textContent = doc.title;
    appendElement(content, 'p', 'post-description').textContent = doc.description;

    return article;
  };

  const setDefaultState = () => {
    resultsGrid.replaceChildren();
    resultsGrid.hidden = true;
    emptyState.hidden = true;
    emptyState.removeAttribute('data-search-query');
    countLabel.textContent = '';
    countLabel.removeAttribute('data-search-query');
    countLabel.hidden = true;
    clearBtn.hidden = true;
    if (defaultGrid) {
      defaultGrid.hidden = false;
      defaultGrid.style.display = '';
    }
    if (pagination) {
      pagination.hidden = false;
      pagination.style.display = '';
    }
  };

  /**
   * @param {SearchDoc[]} matches
   */
  const renderMatches = (matches) => {
    const nodes = matches.map((match) => buildCardNode(match));
    const hasMatches = matches.length > 0;
    if (hasMatches) {
      resultsGrid.replaceChildren(...nodes);
      resultsGrid.hidden = false;
      emptyState.hidden = true;
    } else {
      resultsGrid.replaceChildren();
      resultsGrid.hidden = true;
      emptyState.hidden = false;
    }
    countLabel.textContent = replaceCount(config.countResults, matches.length);
    countLabel.dataset.searchQuery = input.value.trim();
    emptyState.dataset.searchQuery = input.value.trim();
    countLabel.hidden = false;
    clearBtn.hidden = false;
    if (defaultGrid) {
      defaultGrid.hidden = true;
      defaultGrid.style.display = 'none';
    }
    if (pagination) {
      pagination.hidden = true;
      pagination.style.display = 'none';
    }
  };

  const runSearch = () => {
    const query = input.value.trim();
    if (query.length === 0) {
      setDefaultState();
      return;
    }

    renderMatches(searchDocs(docs, query));
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
