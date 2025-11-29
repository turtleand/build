import Fuse from 'fuse.js';

type SearchDoc = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  href: string;
  dateLabel: string;
};

type SearchConfig = {
  countResults?: string;
  defaultCount?: string;
  readMoreLabel?: string;
  tagsLabel?: string;
};

const DATA_ID = 'home-search-data';
const CONFIG_ID = 'home-search-config';

const replaceCount = (template: string | undefined, count: number) =>
  (template || '').replace('{count}', String(count));

const setupSearch = () => {
  const dataEl = document.getElementById(DATA_ID);
  const configEl = document.getElementById(CONFIG_ID);

  if (!dataEl || !configEl) {
    console.warn('Search payload missing.');
    return;
  }

  const docs: SearchDoc[] = JSON.parse(dataEl.textContent || '[]');
  const config: SearchConfig = JSON.parse(configEl.textContent || '{}');

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

  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const clearBtn = document.querySelector<HTMLButtonElement>('[data-search-clear]');
  const resultsGrid = document.querySelector<HTMLElement>('[data-search-grid]');
  const emptyState = document.querySelector<HTMLElement>('[data-search-empty]');
  const countLabel = document.querySelector<HTMLElement>('[data-search-count]');
  const templateNodes = document.querySelectorAll<HTMLTemplateElement>('[data-card-template]');

  if (!input || !clearBtn || !resultsGrid || !emptyState || !countLabel) {
    console.warn('Search UI missing required elements.');
    return;
  }

  const templateMap = new Map<string, HTMLTemplateElement>();
  templateNodes.forEach((tpl) => {
    const slug = tpl.dataset.slug;
    if (slug) templateMap.set(slug, tpl);
  });

  const buildCardNode = (doc: SearchDoc) => {
    const template = templateMap.get(doc.id);
    if (template) {
      const fragment = template.content.cloneNode(true) as DocumentFragment;
      const element = fragment.firstElementChild;
      if (element) return element as HTMLElement;
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

  const renderMatches = (matches: SearchDoc[]) => {
    const nodes = matches
      .map((match) => buildCardNode(match))
      .filter((node): node is HTMLElement => Boolean(node));
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
