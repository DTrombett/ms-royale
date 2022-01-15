import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { UpcomingChestManager } from "apiroyale";
import { Constants as DiscordConstants, MessageActionRow } from "discord.js";
import Constants from "../Constants";
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
			CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!(chests instanceof UpcomingChestManager)) return chests;
	const embed = new Embed()
		.setTitle(translate("commands.player.upcomingChests.title", { lng }))
		.setColor(DiscordConstants.Colors.BLURPLE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(chests.first()!.lastUpdate)
		.setURL(Constants.playerLink(tag))
		.setDescription(Constants.playerUpcomingChests(chests));

	const row1 = new MessageActionRow().addComponents(
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
