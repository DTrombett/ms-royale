import type { TOptionsBase } from "i18next";
import { t } from "i18next";
import type { TranslationKeys, TranslationResult } from ".";

/**
 * Get a translated string for a key using i18next.
 * @param options - Options for the translation
 * @returns The translation result
 */
export const translate = <K extends TranslationKeys>(
	key: K,
	options: Omit<TOptionsBase, "returnObjects"> &
		Record<string, unknown> & {
			lng: string | undefined;
		}
): TranslationResult<K> => t(key, options);

export default translate;
