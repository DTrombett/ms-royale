import type { AutocompleteInteraction } from "discord.js";
import type { APILocation } from "royale-api-types";
import type { ReplyableInteraction } from ".";
import { LocaleCodes } from "./types";

/**
 * Checks if a location has a valid Discord locale correspondence.
 * @param location - A Clash Royale location
 */
export const isSupportedLocation = (
	location: APILocation
): location is APILocation & {
	countryCode: keyof typeof LocaleCodes;
	isCountry: true;
} =>
	location.isCountry &&
	Object.keys(LocaleCodes).includes(location.countryCode!);

/**
 * Get the locale for a discord interaction, or the default locale if it's not supported.
 * @param _interaction - The interaction to get the locale for
 * @returns The Clash Royale locale for the interaction
 */
export const getInteractionLocale = (
	interaction: AutocompleteInteraction | ReplyableInteraction
): string => interaction.locale;

/**
 * Get the locale for a Location structure, or the default locale if it's not supported.
 * @param location - The location to get the locale for
 * @returns The Clash Royale locale for the location
 */
export const locationToLocale = (
	location: APILocation
): LocaleCodes | undefined =>
	isSupportedLocation(location) ? LocaleCodes[location.countryCode] : undefined;
