import { SlashCommandBuilder } from "@discordjs/builders";
import type { Player } from "apiroyale";
import type {
	ApplicationCommandOptionChoice,
	AutocompleteInteraction,
} from "discord.js";
import { t } from "i18next";
import Constants, {
	CommandOptions,
	CustomClient,
	getInteractionLocale,
	MatchLevel,
	matchStrings,
	normalizeTag,
	playerInfo,
} from "../util";

const enum SubCommands {
	Info = "info",
}
const enum InfoOptions {
	Tag = "tag",
}
const enum AutoCompletableInfoOptions {
	Tag = "tag",
}

const autocompletePlayerTag = (
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
	const { players } = client;

	// If a value was provided, search for players with a tag or a name that contains the value
	if (value.length) {
		// Remove any clan that doesn't match the value
		players.sweep(
			(c) =>
				(matches[c.tag] =
					matchStrings(normalizeTag(c.tag), value, true) ||
					matchStrings(c.name, value)) === MatchLevel.None
		);
		// Sort the players by their match level
		players.sort((a, b) => matches[b.tag] - matches[a.tag] || 0);
	}
	interaction
		.respond(
			// Take the first 25 clans as only 25 options are allowed
			players.first(25).map((structure) => ({
				name: t("common.tagPreview", { lng, structure }),
				value: structure.tag,
			}))
		)
		.catch(CustomClient.printToStderr);
};

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("player")
		.setDescription("Scopri le informazioni riguardo un giocatore")
		.addSubcommand((info) =>
			info
				.setName(SubCommands.Info)
				.setDescription(
					"Mostra le informazioni di un giocatore, tramite il suo tag"
				)
				.addStringOption((tag) =>
					tag
						.setName(InfoOptions.Tag)
						.setDescription(
							"Il tag del giocatore. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setRequired(true)
						.setAutocomplete(true)
				)
		),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				// Display the player info
				await interaction.reply({
					...(await playerInfo(
						this.client,
						interaction.options.getString(InfoOptions.Tag, true),
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
				await interaction.reply({
					content: t("common.invalidCommand", { lng }),
				});
				break;
		}
	},
	autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (option.name as AutoCompletableInfoOptions) {
			case AutoCompletableInfoOptions.Tag:
				// Autocomplete the player tag
				autocompletePlayerTag(this.client, option, interaction);
				break;
			default:
				CustomClient.printToStderr(
					new Error(Constants.optionNotRecognizedLog(option.name))
				);
				break;
		}
	},
};
