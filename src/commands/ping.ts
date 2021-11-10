import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../types";

export const command: CommandOptions = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
	async run(interaction) {
		return interaction.reply(`Pong! (${this.client.discord.ws.ping}ms)`);
	},
};
