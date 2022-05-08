import type {
	ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
} from "discord.js";
import type { APIClan, APIPlayer } from "royale-api-types";
import { SortMethod } from ".";
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
	option: ApplicationCommandOptionChoiceData,
	interaction: AutocompleteInteraction
) => {
	const lng = getInteractionLocale(interaction);
	const value = option.value as string;
	/**
	 * A record of clan tags with their respective match level with the value provided
	 */
	const matches: Record<APIClan["tag"], MatchLevel> = {};

	return interaction.respond(
		// Take the first 25 clans as only 25 options are allowed
		(value.length
			? client.clans
					.clone()
					.filter(
						(c) =>
							(matches[c.tag] =
								matchStrings(normalizeTag(c.tag), value, true) ||
								matchStrings(c.name, value)) !== MatchLevel.None
					)
					.sort((a, b) => matches[b.tag] - matches[a.tag] || 0)
			: client.clans
		)
			.first(25)
			.map((structure) => ({
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
	option: ApplicationCommandOptionChoiceData,
	interaction: AutocompleteInteraction
) => {
	const lng = getInteractionLocale(interaction);
	const value = option.value as string;
	/**
	 * A record of player tags with their respective match level with the value provided
	 */
	const matches: Record<APIPlayer["tag"], MatchLevel> = {};

	return interaction.respond(
		// Take the first 25 players as only 25 options are allowed
		(value.length
			? client.players
					.clone()
					.filter(
						(p) =>
							(matches[p.tag] =
								matchStrings(normalizeTag(p.tag), value, true) ||
								matchStrings(p.name, value)) !== MatchLevel.None
					)
					.sort((a, b) => matches[b.tag] - matches[a.tag] || 0)
			: client.players
		)
			.first(25)
			.map((structure) => ({
				name: translate("common.tagPreview", { lng, structure }),
				value: structure.tag,
			}))
	);
};

/**
 * Autocomplete a sort option.
 * @param option - The option provided by the user
 * @param interaction - The interaction to use
 */
export const autocompleteSort = (
	option: ApplicationCommandOptionChoiceData,
	interaction: AutocompleteInteraction
) => {
	const lng = getInteractionLocale(interaction);
	const value = option.value.toString().toLowerCase();

	return interaction.respond(
		Object.values(SortMethod)
			.map((sort) => ({
				name: translate(`commands.clan.members.menu.options.${sort}.label`, {
					lng,
				}),
				value: sort,
			}))
			.filter(({ name }) => name.toLowerCase().includes(value))
	);
};
