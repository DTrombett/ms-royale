import { bold, Embed } from "@discordjs/builders";
import { Player } from "apiroyale";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions, Emojis } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a player's achievements.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerAchievements: APIMethod<string> = async (
	client,
	tag,
	{ ephemeral, lng }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const player = await client.players.fetch(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(player instanceof Player)) return player;
	const embed = new Embed()
		.setAuthor({
			name: translate("commands.player.achievements.author", { lng, player }),
			url: Constants.playerLink(tag),
		})
		.setTitle(translate("commands.player.achievements.title", { lng }))
		.setColor(Colors.Green)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerLink(tag))
		.setDescription(
			player.achievements
				.map(
					(achievement) =>
						`• ${bold(achievement.name)}: ${achievement.info}${
							achievement.level
								? ` ${Emojis.Star.repeat(achievement.level)}`
								: ""
						} - ${achievement.progress}/${achievement.target}${
							achievement.completed
								? ""
								: ` (${achievement.percentage.toFixed(
										Constants.percentageDigits()
								  )}%)`
						}`
				)
				.join("\n")
		);

	return {
		embeds: [embed],
		components: [
			{
				type: 1 /** ActionRow */,
				components: [
					createActionButton(
						ButtonActions.PlayerInfo,
						{
							label: translate("commands.player.buttons.playerInfo.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						ButtonActions.PlayerUpcomingChests,
						{
							label: translate("commands.player.buttons.upcomingChests.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						ButtonActions.ClanInfo,
						{
							label: translate("commands.clan.buttons.clanInfo.label", { lng }),
							disabled: player.clan === undefined,
						},
						player.clan?.tag ?? "#"
					),
				],
			},
		],
		ephemeral,
	};
};
