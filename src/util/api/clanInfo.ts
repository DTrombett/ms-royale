import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { Clan } from "apiroyale";
import {
	Constants as DiscordConstants,
	MessageActionRow,
	MessageSelectMenu,
} from "discord.js";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
import toLocaleString from "../toLocaleString";
import translate from "../translate";
import { ButtonActions, CustomEmojis, MenuActions } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a clan.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const clanInfo = async (
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

	const clan = await client.clans.fetch(tag).catch((error: Error) => {
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(clan instanceof Clan)) return clan;
	const embed = new Embed()
		.setTitle(translate("commands.clan.info.title", { lng, clan }))
		.setDescription(clan.description)
		.setColor(DiscordConstants.Colors.BLUE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(Constants.clanLink(clan));

	embed
		.addField({
			...translate("commands.clan.info.fields.warTrophies", {
				lng,
				returnObjects: true,
				warTrophies: clan.warTrophies,
			}),
		})
		.addField({
			...translate("commands.clan.info.fields.location", {
				lng,
				returnObjects: true,
				location: clan.locationName,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.requiredTrophies", {
				lng,
				returnObjects: true,
				requiredTrophies: clan.requiredTrophies,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.weeklyDonations", {
				lng,
				returnObjects: true,
				weeklyDonations: clan.donationsPerWeek,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.score", {
				lng,
				returnObjects: true,
				score: clan.score,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.type", {
				lng,
				returnObjects: true,
				type: capitalize(clan.type),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.memberCount", {
				lng,
				returnObjects: true,
				memberCount: clan.members.size,
			}),
		});

	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.addOptions(
				clan.members.first(25).map((member) => ({
					...translate("commands.clan.info.menu.options", {
						lng,
						returnObjects: true,
						member,
						role: capitalize(member.role),
						lastSeen: toLocaleString(member.lastSeen, lng),
					}),
					emoji: CustomEmojis.user,
					value: member.tag,
				}))
			)
			.setPlaceholder(translate("commands.clan.info.menu.placeholder", { lng }))
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.RiverRaceLog,
			{ label: translate("commands.clan.buttons.riverRaceLog.label", { lng }) },
			tag
		),
		createActionButton(
			ButtonActions.CurrentRiverRace,
			{
				label: translate("commands.clan.buttons.currentRiverRace.label", {
					lng,
				}),
			},
			tag
		)
	);

	return {
		embeds: [embed],
		components: [row1, row2],
		ephemeral,
	};
};