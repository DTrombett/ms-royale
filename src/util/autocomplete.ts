import type { Clan, Player } from "apiroyale";
import type {
	ApplicationCommandOptionChoice,
	AutocompleteInteraction,
} from "discord.js";
import type CustomClient from "./CustomClient";
import { getInteractionLocale } from "./locales";
import matchStrings from "./matchStrings";
import normalizeTag from "./normalizeTag";
import translate from "./translate";
import { MatchLevel } from "./types";

/**
 * Autocomplete a clan tag.
 * @param client - The client to use
 * @param option - The option provided by the user
 * @param interaction - The interaction to use
 */
export const autocompleteClanTag = (
	client: CustomClient,
	option: ApplicationCommandOptionChoice,
	interaction: AutocompleteInteraction
) => {
	const lng = getInteractionLocale(interaction);
	const value = option.value as string;
	/**
	 * A record of clan tags with their respective match level with the value provided
	 */
	const matches: Record<Clan["tag"], MatchLevel> = {};
	/**
	 * A collection of all cached clans
	 */
	const clans = client.allClans;

	// If a value was provided, search for clans with a tag or a name that contains the value
	if (value.length) {
		// Remove any clan that doesn't match the value
		clans.sweep(
			(c) =>
				(matches[c.tag] =
					matchStrings(normalizeTag(c.tag), value, true) ||
					matchStrings(c.name, value)) === MatchLevel.None
		);
		// Sort the clans by their match level
		clans.sort((a, b) => matches[b.tag] - matches[a.tag] || 0);
	}
	return interaction.respond(
		// Take the first 25 clans as only 25 options are allowed
		clans.first(25).map((structure) => ({
			name: translate("common.tagPreview", { lng, structure }),
			value: structure.tag,
		}))
	);
};

/**
 * Autocomplete a player tag.
 * @param client - The client to use
 * @param option - The option provided by the user
 * @param interaction - The interaction to use
 */
export const autocompletePlayerTag = (
	client: CustomClient,
	option: ApplicationCommandOptionChoice,
	interaction: AutocompleteInteraction
) => {
	const lng = getInteractionLocale(interaction);
	const value = option.value as string;
	/**
	 * A record of player tags with their respective match level with the value provided
	 */
	const matches: Record<Player["tag"], MatchLevel> = {};
	/**
	 * A collection of all cached players
	 */
	const players = client.allPlayers;

	// If a value was provided, search for players with a tag or a name that contains the value
	if (value.length) {
		// Remove any player that doesn't match the value
		players.sweep(
			(c) =>
				(matches[c.tag] =
					matchStrings(normalizeTag(c.tag), value, true) ||
					matchStrings(c.name, value)) === MatchLevel.None
		);
		// Sort the players by their match level
		players.sort((a, b) => matches[b.tag] - matches[a.tag] || 0);
	}
	return interaction.respond(
		// Take the first 25 players as only 25 options are allowed
		players.first(25).map((structure) => ({
			name: translate("common.tagPreview", { lng, structure }),
			value: structure.tag,
		}))
	);
};
