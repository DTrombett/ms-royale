import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow } from "discord.js";
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

		if (!validateTag(tag))
			return interaction.reply(translate("common.invalidTag", { lng }));
		try {
			await Promise.all([
				this.client.players.fetch(normalizeTag(tag)),
				writeJson("players", {
					...(await importJson("players").catch(() => ({}))),
					[interaction.user.id]: tag,
				}),
			]);
		} catch (error: unknown) {
			return interaction.reply({
				content:
					error instanceof Error
						? error.message
						: translate("common.unknownError", { lng }),
				ephemeral: true,
			});
		}

		return interaction.reply({
			content: translate("commands.save.content", { lng }),
			components: [
				new MessageActionRow().addComponents(
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
	autocomplete(interaction) {
		const option = interaction.options.getFocused(true);

		switch (option.name as AutoCompletableOptions) {
			case AutoCompletableOptions.Tag:
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
