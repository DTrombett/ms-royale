import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions, getInteractionLocale, translate } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);

		return interaction.reply({
			content: translate("commands.ping.content", {
				lng,
				ws: interaction.client.ws.ping,
			}),
		});
	},
};
