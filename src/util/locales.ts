import { Location, ValueOf } from "apiroyale";
import { LocaleConstants } from "./Constants";
import { ReplyableInteraction, SupportedLocales } from "./types";

/**
 * Check if a string is a supported locale.
 * @param locale - The locale to check
 */
export const isSupportedLocale = (
	locale?: string
): locale is SupportedLocales =>
	typeof locale === "string" && Object.keys(SupportedLocales).includes(locale);

/**
 * Convert a discord locale to a Clash Royale locale.
 * @param locale - The locale to get the name for
 * @returns The name of the locale, if it's supported
 */
export const localeToRoyaleLocale = (
	locale: string
): SupportedLocales | undefined => {
	const discordLocale = locale.split("-").at(-1)!.toUpperCase();

	return isSupportedLocale(discordLocale) ? discordLocale : undefined;
};

/**
 * Get the locale for a discord interaction, or the default locale if it's not supported.
 * @param _interaction - The interaction to get the locale for
 * @returns The Clash Royale locale for the interaction
 */
export const getInteractionLocale = (
	_interaction: ReplyableInteraction
): SupportedLocales =>
	// TODO: change this to `discordLocaleToRoyaleLocale(interaction.locale) ?? SupportedLocales.Default`
	SupportedLocales.Default;

/**
 * Get the locale for a Location structure, or the default locale if it's not supported.
 * @param location - The location to get the locale for
 * @returns The Clash Royale locale for the location
 */
export const locationToLocale = (location: Location): SupportedLocales =>
	isSupportedLocale(location.countryCode)
		? location.countryCode
		: SupportedLocales.Default;

/**
 * Get the constants for an element, or the default constants if it's not supported.
 * @param element - The element to get the constants for
 * @returns The constants for the element
 */
export const getLocaleConstants = (
	element: Location | ReplyableInteraction | string
): ValueOf<LocaleConstants> =>
	LocaleConstants[
		(element instanceof Location
			? locationToLocale(element)
			: typeof element === "string"
			? isSupportedLocale(element)
				? element
				: localeToRoyaleLocale(element)
			: getInteractionLocale(element)) ?? SupportedLocales.Default
	];
