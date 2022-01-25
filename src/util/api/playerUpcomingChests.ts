import { bold, Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { UpcomingChestManager } from "apiroyale";
import { ActionRow, Constants as DiscordConstants } from "discord.js";
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
export const playerUpcomingChests = async (
	client: ClientRoyale,
	tag: string,
	{ ephemeral, lng }: { lng?: string; ephemeral?: boolean }
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
	const embed = new Embed()
		.setTitle(translate("commands.player.upcomingChests.title", { lng }))
		.setColor(DiscordConstants.Colors.BLURPLE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(chests.first()!.lastUpdate)
		.setURL(`https://royaleapi.com/player/${tag.slice(1)}`)
		.setDescription(
			chests
				.map(
					(c, i) =>
						`• ${bold(chestNames[c.name] || c.name)} (${Number(i) + 1})${
							i === "8" ? "\n" : ""
						}`
				)
				.join("\n")
		);

	const row1 = new ActionRow().addComponents(
		createActionButton(
			ButtonActions.PlayerInfo,
			{ label: translate("commands.player.buttons.playerInfo.label", { lng }) },
			tag
		)
	);

	return {
		embeds: [embed],
		components: [row1],
		ephemeral,
	};
};
