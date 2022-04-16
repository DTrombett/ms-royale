import { SlashCommandBuilder } from "@discordjs/builders";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import type { CommandOptions } from "../util";
import { Constants, Emojis, resolveEmojiIdentifier } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Aggiungi i comandi del bot nel tuo server!"),
	async run(interaction) {
		return interaction.reply({
			content:
				"Clicca il pulsante qui sotto per aggiungere i comandi del bot nel tuo server!",
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							emoji: resolveEmojiIdentifier(Emojis.Robot),
							label: "Aggiungi al server",
							style: ButtonStyle.Link,
							url: Constants.inviteUrl,
						},
					],
				},
			],
		});
	},
};
