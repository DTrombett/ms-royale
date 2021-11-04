import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../types";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("clan")
		.setDescription("Get the info about a clan")
		.addStringOption((input) =>
			input
				.setRequired(true)
				.setName("tag")
				.setDescription(
					"The tag of the clan. This is case insensitive and the # is optional"
				)
		),
	run(interaction) {
		let tag = interaction.options.getString("tag", true).toUpperCase();

		if (!tag.startsWith("#")) tag = `#${tag}`;
		this.client.clans
			.fetch(tag)
			.then((clan) =>
				interaction.reply(`${clan.name} (${clan.tag}) - ${clan.description}`)
			)
			.catch((error: Error) => interaction.reply(error.message));
	},
};
