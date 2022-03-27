import { Player } from "apiroyale";
import type { APIEmbed } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
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
	const embed: APIEmbed = {
		author: {
			name: translate("commands.player.achievements.author", { lng, player }),
			url: Constants.playerLink(tag),
		},
		title: translate("commands.player.achievements.title", { lng }),
		color: Colors.Green,
		footer: { text: translate("common.lastUpdated", { lng }) },
		timestamp: player.lastUpdate.toISOString(),
		url: Constants.playerLink(tag),
		description: player.achievements
			.map(
				(achievement) =>
					`• **${achievement.name}**: ${achievement.info}${
						achievement.level ? ` ${Emojis.Star.repeat(achievement.level)}` : ""
					} - ${achievement.progress}/${achievement.target}${
						achievement.completed
							? ""
							: ` (${achievement.percentage.toFixed(
									Constants.percentageDigits()
							  )}%)`
					}`
			)
			.join("\n"),
	};

	return {
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
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
