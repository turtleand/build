import en from '../content/i18n/en.json';
import es from '../content/i18n/es.json';

const dictionaries = { en, es } as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)[Locale];

export const SUPPORTED_LOCALES = Object.keys(dictionaries) as Locale[];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'lang';

export function isLocale(value: string | null | undefined): value is Locale {
	return Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));
}

export function getDictionary(locale: Locale): Dictionary {
	return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function otherLocale(locale: Locale): Locale {
	return locale === 'en' ? 'es' : 'en';
}

export function createTranslator(locale: Locale) {
	const dictionary = getDictionary(locale);
	const fallback = getDictionary(DEFAULT_LOCALE);

	return (key: string): string => {
		const value = key.split('.').reduce<unknown>((acc, segment) => {
			if (acc == null) return null;
			if (typeof acc === 'object' && !Array.isArray(acc)) {
				return (acc as Record<string, unknown>)[segment];
			}
			return null;
		}, dictionary);

		if (typeof value === 'string') return value;

		const fallbackValue = key.split('.').reduce<unknown>((acc, segment) => {
			if (acc == null) return null;
			if (typeof acc === 'object' && !Array.isArray(acc)) {
				return (acc as Record<string, unknown>)[segment];
			}
			return null;
		}, fallback);

		if (typeof fallbackValue === 'string') return fallbackValue;

		return key;
	};
}

export function formatDateForLocale(value: Date, locale: Locale) {
	const localeMap: Record<Locale, string> = {
		en: 'en-US',
		es: 'es-ES',
	};
	return new Intl.DateTimeFormat(localeMap[locale], { dateStyle: 'long' }).format(value);
}
