import { SlashCommandBuilder } from "@discordjs/builders";
import type { Clan, SearchClanOptions } from "apiroyale";
import type {
	ApplicationCommandOptionChoice,
	AutocompleteInteraction,
} from "discord.js";
import type CustomClient from "../CustomClient";
import type { CommandOptions } from "../util";
import Constants, {
	clanInfo,
	handleSearchResults,
	MatchLevel,
	matchStrings,
	normalizeTag,
	riverRaceLog,
} from "../util";

const enum SubCommands {
	Search = "cerca",
	Info = "info",
	RiverRaceLog = "guerre-passate",
}
const enum SearchOptions {
	Name = "nome",
	Location = "posizione",
	MinMembers = "min-membri",
	MaxMembers = "max-membri",
	MinScore = "min-punteggio",
}
const enum InfoOptions {
	Tag = "tag",
}
const enum RiverRaceLogOptions {
	Tag = "tag",
}
const enum AutoCompletableInfoOptions {
	Tag = "tag",
}
const enum AutoCompletableRiverRaceLogOptions {
	Tag = "tag",
}

const autocompleteClanTag = (
	client: CustomClient,
	option: ApplicationCommandOptionChoice,
	interaction: AutocompleteInteraction
) => {
	const value = option.value as string;
	/**
	 * A record of clan tags with their respective match level with the value provided
	 */
	const matches: Record<Clan["tag"], MatchLevel> = {};
	/**
	 * A collection of all cached clans
	 */
	const clans = client.clanPreviews.concat(
		client.clanResultPreviews,
		client.clans
	);

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
	interaction
		.respond(
			// Take the first 25 clans as only 25 options are allowed
			clans.first(25).map((c) => ({
				name: Constants.autocompleteClanOptionName(c),
				value: c.tag,
			}))
		)
		.catch(console.error);
};

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("clan")
		.setDescription("Scopri le informazioni riguardo un clan")
		.addSubcommand((info) =>
			info
				.setName(SubCommands.Info)
				.setDescription("Mostra le informazioni di un clan, tramite il suo tag")
				.addStringOption((tag) =>
					tag
						.setName(InfoOptions.Tag)
						.setDescription(
							"Il tag del clan. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand((search) =>
			search
				.setName(SubCommands.Search)
				.setDescription("Cerca un clan")
				.addStringOption((name) =>
					name
						.setName(SearchOptions.Name)
						.setDescription(
							"Il nome del clan. Deve essere lungo almeno 3 caratteri"
						)
				)
				.addStringOption((location) =>
					location
						.setName(SearchOptions.Location)
						.setDescription("La sede del clan. Puoi fornire il suo id o nome")
				)
				.addIntegerOption((minMembers) =>
					minMembers
						.setName(SearchOptions.MinMembers)
						.setDescription("Numero minimo di membri nel clan")
				)
				.addIntegerOption((maxMembers) =>
					maxMembers
						.setName(SearchOptions.MaxMembers)
						.setDescription("Numero massimo di membri nel clan")
				)
				.addIntegerOption((minScore) =>
					minScore
						.setName(SearchOptions.MinScore)
						.setDescription("Punti clan minimi")
				)
		)
		.addSubcommand((riverRaceLogCmd) =>
			riverRaceLogCmd
				.setName(SubCommands.RiverRaceLog)
				.setDescription("Mostra le guerre passate")
				.addStringOption((tag) =>
					tag
						.setName(RiverRaceLogOptions.Tag)
						.setDescription(
							"Il tag del clan. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setRequired(true)
						.setAutocomplete(true)
				)
		),
	async run(interaction) {
		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				// Display the clan info
				await clanInfo(
					this.client,
					interaction,
					interaction.options.getString(InfoOptions.Tag, true)
				);
				break;
			case SubCommands.Search:
				/**
				 * The location option provided
				 */
				const locationProvided = interaction.options
					.getString(SearchOptions.Location)
					?.toLowerCase();
				/**
				 * The resolved location id
				 */
				const location =
					locationProvided != null
						? this.client.locations.find(
								(l) =>
									l.id === locationProvided ||
									l.name.toLowerCase() === locationProvided
						  )?.id ??
						  (!Number.isNaN(Number(locationProvided))
								? (locationProvided as `${number}`)
								: undefined)
						: undefined;
				/**
				 * The max members option provided
				 */
				const maxMembers =
					interaction.options.getInteger(SearchOptions.MaxMembers) ?? undefined;
				/**
				 * The min members option provided
				 */
				const minMembers =
					interaction.options.getInteger(SearchOptions.MinMembers) ?? undefined;
				/**
				 * The min score option provided
				 */
				const minScore =
					interaction.options.getInteger(SearchOptions.MinScore) ?? undefined;
				/**
				 * The clan name option provided
				 */
				const name =
					interaction.options.getString(SearchOptions.Name) ?? undefined;
				/**
				 * The resolved search options
				 */
				const options: SearchClanOptions = {
					// This is 25 because the max number of options in a menu is 25
					limit: 25,
					location,
					maxMembers,
					minMembers,
					minScore,
					name,
				};

				// Search the clans with the provided options
				this.client.clans
					.search(options)
					.then((results) => {
						// Display a message if no results were found
						if (!results.size)
							return interaction.reply(Constants.noClanFound());
						// Display the results
						return interaction.reply({
							...handleSearchResults(results),
							content: Constants.clanSearchResultsContent(
								interaction.user.id,
								name,
								location,
								minMembers,
								maxMembers,
								minScore
							),
						});
					})
					.catch((error: Error) => {
						// Catch any errors
						console.error(error);
						// Display the error message
						return interaction.reply({
							content: error.message,
							ephemeral: true,
						});
					})
					.catch(console.error);
				break;
			case SubCommands.RiverRaceLog:
				/**
				 * The options for replying to the interaction
				 */
				const result = await riverRaceLog(
					this.client,
					interaction,
					interaction.options.getString(RiverRaceLogOptions.Tag, true)
				);

				// If there weren't any errors then display the results
				if (result) await interaction.reply(result);
				break;
			default:
				console.error(
					new Error(
						Constants.optionNotRecognizedLog(
							interaction.options.getSubcommand()
						)
					)
				);
				await interaction.reply(Constants.subCommandNotRecognized());
				break;
		}
	},
	autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (
			option.name as
				| AutoCompletableInfoOptions
				| AutoCompletableRiverRaceLogOptions
		) {
			case AutoCompletableInfoOptions.Tag:
				// Autocomplete the clan tag
				autocompleteClanTag(this.client, option, interaction);
				break;
			default:
				console.error(new Error(Constants.optionNotRecognizedLog(option.name)));
				break;
		}
	},
};
