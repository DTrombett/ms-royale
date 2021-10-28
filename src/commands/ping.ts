import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../types";

export const command: CommandOptions = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
	run(interaction) {
		return interaction.reply({ content: "Pong!" });
	},
};
