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
 * Displays information about a player's upcoming chests.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerUpcomingChests: APIMethod<string> = async (
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

	const chests = await client.upcomingChests
		.fetch(tag)
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if ("content" in chests) return chests;
	const chestNames: Record<string, string | undefined> = translate("chests", {
		lng,
	});

	return {
		embeds: [
			{
				title: translate("commands.player.upcomingChests.title", { lng }),
				color: Colors.Blurple,
				footer: { text: translate("common.footer", { lng }) },
				timestamp: new Date(client.upcomingChests.maxAges[tag]!).toISOString(),
				url: Constants.playerLink(tag),
				description: chests
					.map(
						(c) =>
							`• **${chestNames[c.name] ?? c.name}** (${Number(c.index) + 1})${
								c.index === 8 ? "\n" : ""
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
				],
			},
		],
		ephemeral,
	};
};
