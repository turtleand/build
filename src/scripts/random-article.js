/**
 * @typedef {Object} RandomResponse
 * @property {string} href
 * @property {string} [slug]
 */

const MODAL_SELECTOR = '[data-random-modal]';
const MODAL_VISIBLE_CLASS = 'random-article-modal--visible';
const BODY_LOCK_CLASS = 'random-article-modal-open';
const TRIGGER_SELECTOR = '[data-random-article-trigger]';
const DEFAULT_ENDPOINT = '/random-post.json';

const prefersReducedMotion = () =>
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const getLocale = () => {
	const langAttr = document.documentElement?.getAttribute('lang') || 'en';
	return langAttr.toLowerCase().startsWith('es') ? 'es' : 'en';
};

const buildEndpoint = () => {
	const endpoint = document.body?.dataset.siteBase?.trim() || '';
	const normalized = endpoint && endpoint !== '/'
		? `${endpoint.replace(/\/+$/, '')}${DEFAULT_ENDPOINT}`
		: DEFAULT_ENDPOINT;
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const fetchRandomHref = async () => {
	const locale = getLocale();
	const path = buildEndpoint();
	const url = new URL(path, window.location.origin);
	url.searchParams.set('locale', locale);

	const response = await fetch(url.toString(), {
		headers: { Accept: 'application/json' },
		cache: 'no-store',
		credentials: 'same-origin',
	});

	if (!response.ok) {
		throw new Error(`Random article request failed: ${response.status}`);
	}

	/** @type {Partial<RandomResponse>} */
	const payload = await response.json();
	if (!payload?.href) {
		throw new Error('Random article payload missing href');
	}

	return payload.href;
};

/**
 * @param {HTMLElement | null} modal
 */
const showModal = (modal) => {
	if (!modal) return;
	modal.hidden = false;
	// Force reflow so transition plays even when toggled quickly
	void modal.offsetWidth;
	modal.classList.add(MODAL_VISIBLE_CLASS);
	document.body?.classList.add(BODY_LOCK_CLASS);
};

/**
 * @param {HTMLElement | null} modal
 */
const hideModal = (modal) => {
	if (!modal) return;
	modal.classList.remove(MODAL_VISIBLE_CLASS);
	document.body?.classList.remove(BODY_LOCK_CLASS);
	if (prefersReducedMotion()) {
		modal.hidden = true;
		return;
	}
	setTimeout(() => {
		if (!modal.classList.contains(MODAL_VISIBLE_CLASS)) {
			modal.hidden = true;
		}
	}, 220);
};

/**
 * @param {MouseEvent} event
 */
const shouldBypass = (event) =>
	event.defaultPrevented ||
	event.button !== 0 ||
	event.metaKey ||
	event.ctrlKey ||
	event.altKey ||
	event.shiftKey;

const attachHandler = () => {
	/** @type {HTMLAnchorElement | null} */
	const trigger = document.querySelector(TRIGGER_SELECTOR);
	if (!trigger || trigger.dataset.randomBound === 'true') return;
	/** @type {HTMLElement | null} */
	const modal = document.querySelector(MODAL_SELECTOR);
	trigger.dataset.randomBound = 'true';
	let pendingNavigation = false;

	/**
	 * @param {string} href
	 */
	const navigateToHref = (href) => {
		if (prefersReducedMotion()) {
			window.location.assign(href);
		} else {
			setTimeout(() => {
				window.location.assign(href);
			}, 800);
		}
	};

	trigger.addEventListener('click', async (event) => {
		if (shouldBypass(event)) return;
		event.preventDefault();
		if (pendingNavigation) return;
		pendingNavigation = true;
		showModal(modal);
		try {
			const href = await fetchRandomHref();
			navigateToHref(href);
		} catch (error) {
			console.warn(error);
			hideModal(modal);
			pendingNavigation = false;
			window.location.assign(trigger.href);
		}
	});
};

const init = () => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attachHandler, { once: true });
	} else {
		attachHandler();
	}
};

if (typeof window !== 'undefined') {
	init();
}
