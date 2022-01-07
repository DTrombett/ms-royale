import { t, TOptionsBase } from "i18next";
import type {
	IsTranslationObject,
	StringElement,
	TranslationKeys,
	TranslationResult,
} from ".";

/**
 * Sanitize a string to ne wrapped in JSON quotes.
 * @param element - The element to sanitize
 * @returns The sanitized element
 */
export const sanitizeElement = <T extends StringElement>(
	element: T
): StringElement => {
	if (typeof element === "string")
		return element
			.replaceAll('"', '\\"')
			.replaceAll("\n", "\\n")
			.replaceAll("\r", "\\r")
			.replaceAll("\t", "\\t")
			.replaceAll("\b", "\\b");
	return element.map(sanitizeElement);
};

/**
 * Get a translated string for a key using i18next.
 * @param options - Options for the translation
 * @returns The translation result
 */
export const translate = <K extends TranslationKeys>(
	key: K,
	options: Omit<TOptionsBase, "returnObjects"> &
		Record<string, unknown> &
		(IsTranslationObject<K> extends true
			? { returnObjects: true }
			: { returnObjects?: false })
): TranslationResult<K> => t(key, options);
