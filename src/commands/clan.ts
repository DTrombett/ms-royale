import { SlashCommandBuilder } from "@discordjs/builders";
import type { APITag } from "../ClientRoyale";
import type { CommandOptions } from "../types";
import { cast } from "../util";

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
		cast<APITag>(tag);
		this.client.clans
			.fetch(tag)
			.then((clan) =>
				interaction.reply({
					embeds: [clan.embed],
				})
			)
			.catch((error: Error) => interaction.reply(error.message));
	},
};
