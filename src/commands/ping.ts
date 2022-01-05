import { SlashCommandBuilder } from "@discordjs/builders";
import { t } from "i18next";
import { CommandOptions, getInteractionLocale } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
	async run(interaction) {
		const lng = getInteractionLocale(interaction);

		return interaction.reply({
			content: t("commands.ping.content", {
				lng,
				ws: interaction.client.ws.ping,
			}),
		});
	},
};
