import { SlashCommandBuilder } from "@discordjs/builders";
import {
	Constants as DiscordConstants,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import type { CommandOptions } from "../util";
import { Constants, Emojis } from "../util";

const inviteUrl = Constants.inviteUrl();

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Aggiungi i comandi del bot nel tuo server!"),
	async run(interaction) {
		return interaction.reply({
			content:
				"Clicca il pulsante qui sotto per aggiungere i comandi del bot nel tuo server!",
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setEmoji(Emojis.Robot)
						.setLabel("Aggiungi al server")
						.setStyle(DiscordConstants.MessageButtonStyles.LINK)
						.setURL(inviteUrl)
				),
			],
		});
	},
};
