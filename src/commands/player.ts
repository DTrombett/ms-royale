import { SlashCommandBuilder } from "@discordjs/builders";
import Constants, {
	autocompletePlayerTag,
	CommandOptions,
	CustomClient,
	getInteractionLocale,
	importJson,
	playerInfo,
	translate,
} from "../util";

enum SubCommands {
	Info = "info",
}
enum InfoOptions {
	Tag = "tag",
}
enum AutoCompletableInfoOptions {
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
		),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);

		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				const tag =
					interaction.options.getString(InfoOptions.Tag) ??
					(await importJson("players"))[interaction.user.id];

				if (tag == null)
					return interaction.reply({
						content: translate("commands.player.info.noTag", { lng }),
						ephemeral: true,
					});

				// Display the player info
				await interaction.reply({
					...(await playerInfo(this.client, tag, { lng })),
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
					content: translate("common.invalidCommand", { lng }),
				});
				break;
		}
		return undefined;
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
