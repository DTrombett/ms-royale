import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { Emojis } from "../types";
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

	if (!("tag" in player)) return player;

	return {
		embeds: [
			{
				author: {
					name: translate("commands.player.achievements.author", {
						lng,
						player,
					}),
					url: Constants.playerLink(tag),
				},
				title: translate("commands.player.achievements.title", {
					lng,
					count: player.achievements.length,
				}),
				color: Colors.Green,
				footer: { text: translate("common.footer", { lng }) },
				timestamp: new Date(client.players.maxAges[tag]!).toISOString(),
				url: Constants.playerLink(tag),
				description: player.achievements
					.map(
						(achievement) =>
							`• **${achievement.name}**: ${achievement.info}${
								achievement.stars
									? ` ${Emojis.Star.repeat(achievement.stars)}`
									: ""
							} - ${achievement.value}/${achievement.target}${
								achievement.value >= achievement.target
									? ""
									: ` (${(
											(achievement.value / achievement.target) *
											100
									  ).toFixed(Constants.percentageDigits)}%)`
							}`
					)
					.join("\n"),
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"pi",
						{
							label: translate("commands.player.buttons.playerInfo.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						"uc",
						{
							label: translate("commands.player.buttons.upcomingChests.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						"pb",
						{
							label: translate("commands.player.buttons.badges.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						"ci",
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
