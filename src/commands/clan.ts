import { SlashCommandBuilder } from "@discordjs/builders";
import type { SearchClanOptions } from "apiroyale";
import type { CommandOptions } from "../util";
import Constants, {
	autocompleteClanTag,
	autocompleteLocation,
	autocompleteSort,
	cast,
	clanInfo,
	clanMembers,
	currentRiverRace,
	CustomClient,
	getInteractionLocale,
	importJson,
	riverRaceLog,
	searchClan,
	SortMethod,
	translate,
} from "../util";

enum SubCommands {
	Search = "cerca",
	Info = "info",
	RiverRaceLog = "guerre-passate",
	CurrentRiverRace = "guerra",
	ClanMembers = "membri",
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
enum ClanMembersOptions {
	Tag = "tag",
	Sort = "ordine",
}
enum AutoCompletableOptions {
	Location = "posizione",
	Sort = "ordine",
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
						.setAutocomplete(true)
				)
		)
		.addSubcommand((clanMembersCmd) =>
			clanMembersCmd
				.setName(SubCommands.ClanMembers)
				.setDescription("Mostra i membri di un clan")
				.addStringOption((tag) =>
					tag
						.setName(ClanMembersOptions.Tag)
						.setDescription(
							"Il tag del clan. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setAutocomplete(true)
				)
				.addStringOption((sort) =>
					sort
						.setName(ClanMembersOptions.Sort)
						.setDescription("Come ordinare i membri. Default: rank")
						.setAutocomplete(true)
				)
		),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);
		let deferred = false,
			tag: string | null;

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				tag = interaction.options.getString(InfoOptions.Tag);

				if (tag == null) {
					const playerTag = await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined);

					if (playerTag !== undefined) {
						[tag] = await Promise.all([
							this.client.players
								.fetch(playerTag)
								.then((p) => p.clan?.tag ?? null)
								.catch(() => null),
							interaction.deferReply(),
						]);
						deferred = true;
					}
					if (tag == null) {
						await interaction[deferred ? "editReply" : "reply"]({
							content: translate("commands.clan.noTag", { lng }),
						});
						break;
					}
				}
				const [info] = await Promise.all([
					clanInfo(this.client, tag, { lng }),
					deferred || interaction.deferReply(),
				]);

				// Display the clan info
				await interaction.editReply(info);
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
						? Number(locationProvided) ||
						  this.client.locations.find(
								(l) => l.name.toLowerCase() === locationProvided
						  )?.id
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
				const [searchResults] = await Promise.all([
					searchClan(this.client, options, {
						lng,
						id: interaction.user.id,
					}),
					interaction.deferReply(),
				]);

				await interaction.editReply(searchResults);
				break;
			case SubCommands.RiverRaceLog:
				tag = interaction.options.getString(RiverRaceLogOptions.Tag);

				if (tag == null) {
					const playerTag = await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined);

					if (playerTag !== undefined) {
						[tag] = await Promise.all([
							this.client.players
								.fetch(playerTag)
								.then((p) => p.clan?.tag ?? null)
								.catch(() => null),
							interaction.deferReply(),
						]);
						deferred = true;
					}
					if (tag == null) {
						await interaction[deferred ? "editReply" : "reply"]({
							content: translate("commands.clan.noTag", { lng }),
						});
						break;
					}
				}
				const [log] = await Promise.all([
					riverRaceLog(this.client, tag, {
						id: interaction.user.id,
						lng,
					}),
					deferred || interaction.deferReply(),
				]);

				// Fetch the river race log for the clan and display it
				await interaction.editReply(log);
				break;
			case SubCommands.CurrentRiverRace:
				tag = interaction.options.getString(CurrentRiverRaceOptions.Tag);

				if (tag == null) {
					const playerTag = await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined);

					if (playerTag !== undefined) {
						[tag] = await Promise.all([
							this.client.players
								.fetch(playerTag)
								.then((p) => p.clan?.tag ?? null)
								.catch(() => null),
							interaction.deferReply(),
						]);
						deferred = true;
					}
					if (tag == null) {
						await interaction[deferred ? "editReply" : "reply"]({
							content: translate("commands.clan.noTag", { lng }),
						});
						break;
					}
				}
				const [race] = await Promise.all([
					currentRiverRace(this.client, tag, { lng }),
					deferred || interaction.deferReply(),
				]);

				// Fetch the current river race for the clan and display it
				await interaction.editReply(race);
				break;
			case SubCommands.ClanMembers:
				let sort =
					interaction.options.getString(ClanMembersOptions.Sort) ??
					SortMethod.Rank;

				if (!Object.values(SortMethod).includes(sort as SortMethod))
					if (Object.keys(SortMethod).includes(sort))
						sort = SortMethod[sort as keyof typeof SortMethod];
					else {
						await interaction.reply({
							content: translate("commands.clan.members.invalidSort", { lng }),
							ephemeral: true,
						});
						break;
					}

				cast<SortMethod>(sort);
				tag = interaction.options.getString(ClanMembersOptions.Tag);
				if (tag == null) {
					const playerTag = await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined);

					if (playerTag !== undefined) {
						[tag] = await Promise.all([
							this.client.players
								.fetch(playerTag)
								.then((p) => p.clan?.tag ?? null)
								.catch(() => null),
							interaction.deferReply(),
						]);
						deferred = true;
					}
					if (tag == null) {
						await interaction[deferred ? "editReply" : "reply"]({
							content: translate("commands.clan.noTag", { lng }),
						});
						break;
					}
				}
				const [members] = await Promise.all([
					clanMembers(this.client, tag, {
						lng,
						id: interaction.user.id,
						sort,
					}),
					deferred || interaction.deferReply(),
				]);

				// Fetch the clan members and display it
				await interaction.editReply(members);
				break;
			default:
				void CustomClient.printToStderr(
					new Error(
						Constants.optionNotRecognizedLog(
							interaction.options.getSubcommand()
						)
					),
					true
				);
				await interaction.reply(translate("common.invalidCommand", { lng }));
				break;
		}
	},
	async autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (option.name as AutoCompletableOptions) {
			case AutoCompletableOptions.Tag:
				// Autocomplete the clan tag
				await autocompleteClanTag(this.client, option, interaction);
				break;
			case AutoCompletableOptions.Sort:
				// Autocomplete the sort method
				await autocompleteSort(option, interaction);
				break;
			case AutoCompletableOptions.Location:
				// Autocomplete the location
				await autocompleteLocation(this.client, option, interaction);
				break;
			default:
				void CustomClient.printToStderr(
					new Error(Constants.optionNotRecognizedLog(option.name)),
					true
				);
				await interaction.respond([]);
				break;
		}
	},
};
