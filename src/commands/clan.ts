import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../types";
import { time, validateTag } from "../util";

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
		if (!validateTag(tag))
			return interaction.reply({
				content:
					"Hai inserito un tag non valido!\nI caratteri validi nei tag sono: 0, 2, 8, 9, P, Y, L, Q, G, R, J, C, U, V",
				ephemeral: true,
			});
		this.client.clans
			.fetch(tag, { maxAge: time.millisecondsPerMinute * 5 })
			.then((clan) =>
				interaction.reply({
					embeds: [clan.embed],
				})
			)
			.catch((error: Error) => interaction.reply(error.message));
		return undefined;
	},
};
