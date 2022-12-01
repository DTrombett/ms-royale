import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import validateTag from "../validateTag";

/**
 * Displays information about a player's badges.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerBadges: APIMethod<string> = async (
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
					name: translate("commands.player.badges.author", {
						lng,
						player,
					}),
					url: Constants.playerLink(tag),
				},
				title: translate("commands.player.badges.title", {
					lng,
					count: player.badges.length,
				}),
				color: Colors.Green,
				footer: { text: translate("common.footer", { lng }) },
				timestamp: new Date(client.players.maxAges[tag]!).toISOString(),
				url: Constants.playerLink(tag),
				description: Array(Math.ceil(player.badges.length / 4))
					.fill(undefined)
					.map((_, index) => index * 4)
					.map((begin) => player.badges.slice(begin, begin + 4))
					.map((badges, i) =>
						i < 15
							? badges
									.map(
										(badge) =>
											`**${badge.name}** (Lvl. ${badge.level}/${
												badge.maxLevel
											} - ${badge.progress}/${badge.target}${
												badge.level === badge.maxLevel
													? ""
													: ` - (${(
															(badge.progress / badge.target) *
															100
													  ).toFixed(Constants.percentageDigits)}%)`
											})`
									)
									.join(", ")
							: undefined
					)
					.slice(0, 15)
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
