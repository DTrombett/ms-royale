import { SlashCommandBuilder } from "@discordjs/builders";
import type { APITag } from "apiroyale";
import type { Snowflake } from "discord-api-types/v9";
import Constants, {
	autocompletePlayerTag,
	CommandOptions,
	CustomClient,
	getInteractionLocale,
	importJson,
	playerInfo,
	playerUpcomingChests,
	translate,
} from "../util";

enum SubCommands {
	Info = "info",
	UpcomingChests = "bauli",
}
enum InfoOptions {
	Tag = "tag",
}
enum UpcomingChestsOptions {
	Tag = "tag",
}
enum AutoCompletableInfoOptions {
	Tag = "tag",
}
enum AutoCompletableUpcomingChestsOptions {
	Tag = "tag",
}

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
						.setAutocomplete(true)
				)
		)
		.addSubcommand((upcomingChests) =>
			upcomingChests
				.setName(SubCommands.UpcomingChests)
				.setDescription(
					"Mostra i prossimi bauli di un giocatore, tramite il suo tag"
				)
				.addStringOption((tag) =>
					tag
						.setName(UpcomingChestsOptions.Tag)
						.setDescription(
							"Il tag del giocatore. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
						)
						.setAutocomplete(true)
				)
		),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				const tag =
					interaction.options.getString(InfoOptions.Tag) ??
					(
						await importJson("players").catch(
							() => ({} as Record<Snowflake, APITag>)
						)
					)[interaction.user.id];

				if (tag == null) {
					await interaction.reply({
						content: translate("commands.player.info.noTag", { lng }),
						ephemeral: true,
					});
					break;
				}

				// Display the player info
				await interaction.deferReply();
				await interaction.editReply({
					...(await playerInfo(this.client, tag, { lng })),
				});
				break;
			case SubCommands.UpcomingChests:
				const tag2 =
					interaction.options.getString(UpcomingChestsOptions.Tag) ??
					(
						await importJson("players").catch(
							() => ({} as Record<Snowflake, APITag>)
						)
					)[interaction.user.id];

				if (tag2 == null) {
					await interaction.reply({
						content: translate("commands.player.info.noTag", { lng }),
						ephemeral: true,
					});
					break;
				}

				// Display the player's upcoming chests
				await interaction.deferReply();
				await interaction.editReply({
					...(await playerUpcomingChests(this.client, tag2, { lng })),
				});
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
				await interaction.reply({
					content: translate("common.invalidCommand", { lng }),
				});
				break;
		}
		return undefined;
	},
	async autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (
			option.name as
				| AutoCompletableInfoOptions
				| AutoCompletableUpcomingChestsOptions
		) {
			case AutoCompletableInfoOptions.Tag:
				// Autocomplete the player tag
				await autocompletePlayerTag(this.client, option, interaction);
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
