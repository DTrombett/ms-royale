import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { Player } from "apiroyale";
import { Constants as DiscordConstants, MessageActionRow } from "discord.js";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a player's achievements.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerAchievements = async (
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

	const player = await client.players.fetch(tag).catch((error: Error) => {
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(player instanceof Player)) return player;
	const embed = new Embed()
		.setAuthor({
			name: translate("commands.player.achievements.author", { lng, player }),
			url: Constants.playerLink(player),
		})
		.setTitle(translate("commands.player.achievements.title", { lng }))
		.setColor(DiscordConstants.Colors.GREEN)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerLink(player))
		.setDescription(Constants.playerAchievements(player));

	const row1 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.PlayerInfo,
			{ label: translate("commands.player.buttons.playerInfo.label", { lng }) },
			tag
		),
		createActionButton(
			ButtonActions.ClanInfo,
			{ label: translate("commands.clan.buttons.clanInfo.label", { lng }) },
			player.clan?.tag ?? "#"
		)
	);

	return {
		embeds: [embed],
		components: [row1],
		ephemeral,
	};
};
