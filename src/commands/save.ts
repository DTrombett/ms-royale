import { SlashCommandBuilder } from "@discordjs/builders";
import { ComponentType } from "discord-api-types/v10";
import type { CommandOptions } from "../util";
import {
	autocompletePlayerTag,
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
		const [player] = await Promise.all([
			this.client.players.fetch(normalizeTag(tag)).catch((err: Error) => err),
			interaction.deferReply(),
		]);

		if (player instanceof Error)
			await interaction.reply({
				content: player.message,
				ephemeral: true,
			});
		await importJson("players")
			.catch(() => ({}))
			.then((json) =>
				writeJson("players", {
					...json,
					[interaction.user.id]: tag,
				})
			)
			.then(() =>
				interaction.editReply({
					content: translate("commands.save.content", { lng, player }),
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								createActionButton(
									Actions.PlayerInfo,
									{
										label: translate(
											"commands.player.buttons.playerInfo.label",
											{
												lng,
											}
										),
									},
									tag
								),
							],
						},
					],
				})
			)
			.catch((error: unknown) =>
				interaction.editReply({
					content:
						error instanceof Error
							? error.message
							: translate("common.unknownError", { lng }),
				})
			);
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
