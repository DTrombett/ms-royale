import { SlashCommandBuilder } from "@discordjs/builders";
import type { SearchClanOptions } from "apiroyale";
import type { CommandOptions } from "../types";
import Constants, { clanInfo, handleSearchResults } from "../util";

const enum SubCommands {
	Search = "search",
	Info = "info",
}
const enum SearchOptions {
	Name = "name",
	Location = "location",
	MinMembers = "min-members",
	MaxMembers = "max-members",
	MinScore = "min-score",
}
const enum InfoOptions {
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
							"Il tag del clan. Non fa differenza tra maiuscole e minuscole ed è possibile omettere il simbolo #"
						)
						.setRequired(true)
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
		),
	run(interaction) {
		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Search:
				const location = interaction.options
					.getString(SearchOptions.Location)
					?.toLowerCase();
				const locationId =
					location != null
						? this.client.locations.find(
								(l) => l.id === location || l.name.toLowerCase() === location
						  )?.id ??
						  (!Number.isNaN(Number(location))
								? (location as `${number}`)
								: undefined)
						: undefined;
				const maxMembers =
					interaction.options.getInteger(SearchOptions.MaxMembers) ?? undefined;
				const minMembers =
					interaction.options.getInteger(SearchOptions.MinMembers) ?? undefined;
				const minScore =
					interaction.options.getInteger(SearchOptions.MinScore) ?? undefined;
				const name =
					interaction.options.getString(SearchOptions.Name) ?? undefined;
				const options: SearchClanOptions = {
					limit: 25,
					location: locationId,
					maxMembers,
					minMembers,
					minScore,
					name,
				};

				this.client.clans
					.search(options)
					.then((results) => {
						if (!results.size)
							return interaction.reply(Constants.noClanFound());
						return interaction.reply({
							...handleSearchResults(results),
							content: Constants.clanSearchResultsContent(
								name,
								locationId,
								minMembers,
								maxMembers,
								minScore
							),
						});
					})
					.catch((error: Error) => interaction.reply(error.message))
					.catch(console.error);
				break;
			case SubCommands.Info:
				void clanInfo(
					this.client,
					interaction,
					interaction.options.getString(InfoOptions.Tag, true)
				);
				break;
			default:
				break;
		}
	},
};
