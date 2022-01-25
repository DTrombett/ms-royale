import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRow } from "discord.js";
import {
	autocompletePlayerTag,
	ButtonActions,
	CommandOptions,
	Constants,
	createActionButton,
	CustomClient,
	getInteractionLocale,
	importJson,
	normalizeTag,
	translate,
	validateTag,
	writeJson,
} from "../util";

enum Options {
	Tag = "tag",
}
enum AutoCompletableOptions {
	Tag = "tag",
}

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("save")
		.setDescription("Salva il tuo tag giocatore!")
		.addStringOption((tag) =>
			tag
				.setName(Options.Tag)
				.setDescription(
					"Il tag da salvare. Non fa differenza tra maiuscole e minuscole ed è possibile omettere l'hashtag"
				)
				.setRequired(true)
				.setAutocomplete(true)
		),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);
		const tag = normalizeTag(interaction.options.getString(Options.Tag, true));

		if (!validateTag(tag)) {
			await interaction.reply({
				content: translate("common.invalidTag", { lng }),
				ephemeral: true,
			});
			return;
		}
		await interaction.deferReply();
		try {
			await Promise.all([
				this.client.players.fetch(normalizeTag(tag)),
				writeJson("players", {
					...(await importJson("players").catch(() => ({}))),
					[interaction.user.id]: tag,
				}),
			]);
		} catch (error: unknown) {
			await interaction.editReply({
				content:
					error instanceof Error
						? error.message
						: translate("common.unknownError", { lng }),
			});
			return;
		}

		await interaction.editReply({
			content: translate("commands.save.content", { lng }),
			components: [
				new ActionRow().addComponents(
					createActionButton(
						ButtonActions.PlayerInfo,
						{
							label: translate("commands.player.buttons.playerInfo.label", {
								lng,
							}),
						},
						tag
					)
				),
			],
		});
	},
	async autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (option.name as AutoCompletableOptions) {
			case AutoCompletableOptions.Tag:
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
