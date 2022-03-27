import { UpcomingChestManager } from "apiroyale";
import type { APIEmbed } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions } from "../types";
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

	const chests = await client
		.fetchPlayerUpcomingChests({ tag })
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!(chests instanceof UpcomingChestManager)) return chests;
	const chestNames = translate("chests", { lng });
	const embed: APIEmbed = {
		title: translate("commands.player.upcomingChests.title", { lng }),
		color: Colors.Blurple,
		footer: { text: translate("common.lastUpdated", { lng }) },
		timestamp: chests.first()!.lastUpdate.toISOString(),
		url: `https://royaleapi.com/player/${tag.slice(1)}`,
		description: chests
			.map(
				(c, i) =>
					`• **${chestNames[c.name] || c.name}** (${Number(i) + 1})${
						i === "8" ? "\n" : ""
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
				],
			},
		],
		ephemeral,
	};
};
