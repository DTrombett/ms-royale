import { SlashCommandBuilder } from "@discordjs/builders";
import type { SearchClanOptions } from "apiroyale";
import Constants, {
	clanInfo,
	CommandOptions,
	currentRiverRace,
	CustomClient,
	getInteractionLocale,
	riverRaceLog,
	searchClan,
	translate,
	autocompleteClanTag,
} from "../util";

enum SubCommands {
	Search = "cerca",
	Info = "info",
	RiverRaceLog = "guerre-passate",
	CurrentRiverRace = "guerra",
}
enum SearchOptions {
	Name = "nome",
	Location = "posizione",
	MinMembers = "min-membri",
	MaxMembers = "max-membri",
	MinScore = "min-punteggio",
}
enum InfoOptions {
	Tag = "tag",
}
enum RiverRaceLogOptions {
	Tag = "tag",
}
enum CurrentRiverRaceOptions {
	Tag = "tag",
}
enum AutoCompletableInfoOptions {
	Tag = "tag",
}
enum AutoCompletableRiverRaceLogOptions {
	Tag = "tag",
}
enum AutoCompletableRiverRaceOptions {
	Tag = "tag",
}

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
		.addSubcommand((currentRiverRaceCmd) =>
			currentRiverRaceCmd
				.setName(SubCommands.CurrentRiverRace)
				.setDescription("Mostra la guerra in corso")
				.addStringOption((tag) =>
					tag
						.setName(CurrentRiverRaceOptions.Tag)
						.setDescription(
							"Il tag del clan. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setRequired(true)
						.setAutocomplete(true)
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
		const lng = getInteractionLocale(interaction);

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				// Display the clan info
				await interaction.reply(
					await clanInfo(
						this.client,
						interaction.options.getString(InfoOptions.Tag, true),
						{
							lng: getInteractionLocale(interaction),
						}
					)
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

				// Search the clans with the provided options and display them
				await interaction.reply({
					...(await searchClan(this.client, options, {
						lng,
						id: interaction.user.id,
					})),
				});
				break;
			case SubCommands.RiverRaceLog:
				// Fetch the river race log for the clan and display it
				await interaction.reply({
					...(await riverRaceLog(
						this.client,
						interaction.options.getString(RiverRaceLogOptions.Tag, true),
						{ id: interaction.user.id, lng }
					)),
				});
				break;
			case SubCommands.CurrentRiverRace:
				// Fetch the current river race for the clan and display it
				await interaction.reply({
					...(await currentRiverRace(
						this.client,
						interaction.options.getString(RiverRaceLogOptions.Tag, true),
						{ lng }
					)),
				});
				break;
			default:
				CustomClient.printToStderr(
					new Error(
						Constants.optionNotRecognizedLog(
							interaction.options.getSubcommand()
						)
					)
				);
				await interaction.reply(translate("common.invalidCommand", { lng }));
				break;
		}
	},
	autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (
			option.name as
				| AutoCompletableInfoOptions
				| AutoCompletableRiverRaceLogOptions
				| AutoCompletableRiverRaceOptions
		) {
			case AutoCompletableInfoOptions.Tag:
				// Autocomplete the clan tag
				autocompleteClanTag(this.client, option, interaction);
				break;
			default:
				CustomClient.printToStderr(
					new Error(Constants.optionNotRecognizedLog(option.name))
				);
				break;
		}
	},
};
