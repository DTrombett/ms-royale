import { SlashCommandBuilder } from "@discordjs/builders";
import type { Player } from "apiroyale";
import type {
	ApplicationCommandOptionChoice,
	AutocompleteInteraction,
} from "discord.js";
import type CustomClient from "../CustomClient";
import type { CommandOptions } from "../util";
import { MatchLevel, matchStrings, normalizeTag, playerInfo } from "../util";

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
	const value = option.value as string;
	const matches: Record<Player["tag"], MatchLevel> = {};
	const { players } = client;

	if (value.length) {
		players.sweep(
			(c) =>
				(matches[c.tag] =
					matchStrings(normalizeTag(c.tag), value, true) ||
					matchStrings(c.name, value)) === MatchLevel.None
		);
		players.sort((a, b) => matches[b.tag] - matches[a.tag] || 0);
	}
	interaction
		.respond(
			players.first(25).map((c) => ({
				name: `${c.name} (${c.tag})`,
				value: c.tag,
			}))
		)
		.catch(console.error);
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
		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				await playerInfo(
					this.client,
					interaction,
					interaction.options.getString(InfoOptions.Tag, true)
				);
				break;
			default:
				await interaction.reply("Comando non riconosciuto!");
				break;
		}
	},
	autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (option.name as AutoCompletableInfoOptions) {
			case AutoCompletableInfoOptions.Tag:
				autocompletePlayerTag(this.client, option, interaction);
				break;
			default:
				break;
		}
	},
};
