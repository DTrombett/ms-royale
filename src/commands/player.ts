import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { playerInfo } from "../util";

const enum SubCommands {
	Info = "info",
}
const enum InfoOptions {
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
						.setRequired(true)
				)
		),
	async run(interaction) {
		switch (interaction.options.getSubcommand() as SubCommands) {
			case SubCommands.Info:
				await playerInfo(
					this.client,
					interaction,
					interaction.options.getString(InfoOptions.Tag, true)
				);
				break;
			default:
				await interaction.reply("Comando non riconosciuto!");
				break;
		}
	},
};
