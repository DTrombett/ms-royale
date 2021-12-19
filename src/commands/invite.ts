import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import type { CommandOptions } from "../util";
import { Constants, Emojis } from "../util";

// TODO: Remove this command once the "Add to server" button is fully released by Discord
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
						.setStyle(MessageButtonStyles.LINK)
						.setURL(Constants.inviteUrl())
				),
			],
		});
	},
};
