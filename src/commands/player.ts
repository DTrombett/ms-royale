import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import Constants, {
	autocompletePlayerTag,
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
		let options, tag: string | undefined;

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				tag =
					interaction.options.getString(InfoOptions.Tag) ??
					(await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined));

				if (tag === undefined) {
					await interaction.reply({
						content: translate("commands.player.info.noTag", { lng }),
						ephemeral: true,
					});
					break;
				}
				// Display the player info
				[options] = await Promise.all([
					playerInfo(this.client, tag, { lng }),
					interaction.deferReply(),
				]);

				await interaction.editReply(options);
				break;
			case SubCommands.UpcomingChests:
				tag =
					interaction.options.getString(InfoOptions.Tag) ??
					(await importJson("players")
						.then((json) => json[interaction.user.id])
						.catch(() => undefined));

				if (tag == null) {
					await interaction.reply({
						content: translate("commands.player.info.noTag", { lng }),
						ephemeral: true,
					});
					break;
				}
				// Display the player's upcoming chests
				[options] = await Promise.all([
					playerUpcomingChests(this.client, tag, { lng }),
					interaction.deferReply(),
				]);

				await interaction.editReply(options);
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
