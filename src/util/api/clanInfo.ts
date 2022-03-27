import { Clan } from "apiroyale";
import type { APIEmbed, APISelectMenuOption } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton, {
	resolveEmojiIdentifier,
} from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
import { locationToLocale } from "../locales";
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
export const clanInfo: APIMethod<string> = async (
	client,
	tag,
	{ ephemeral, lng } = {}
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const clan = await client.clans.fetch(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(clan instanceof Clan)) return clan;
	const fallbackLng = locationToLocale(clan.location);
	const embed: APIEmbed = {
		title: translate("commands.clan.info.title", { lng, clan, fallbackLng }),
		description: clan.description,
		color: Colors.Blue,
		footer: { text: translate("common.lastUpdated", { lng, fallbackLng }) },
		timestamp: clan.lastUpdate.toISOString(),
		thumbnail: { url: clan.badgeUrl },
		url: Constants.clanLink(tag),
		fields: [
			{
				...translate("commands.clan.info.fields.warTrophies", {
					lng,
					warTrophies: clan.warTrophies,
					fallbackLng,
				}),
			},
			{
				...translate("commands.clan.info.fields.location", {
					lng,
					location: clan.locationName,
					fallbackLng,
				}),
				inline: true,
			},
			{
				...translate("commands.clan.info.fields.requiredTrophies", {
					lng,
					requiredTrophies: clan.requiredTrophies,
					fallbackLng,
				}),
				inline: true,
			},
			{
				...translate("commands.clan.info.fields.weeklyDonations", {
					lng,
					weeklyDonations: clan.donationsPerWeek,
					fallbackLng,
				}),
				inline: true,
			},
			{
				...translate("commands.clan.info.fields.score", {
					lng,
					score: clan.score,
					fallbackLng,
				}),
				inline: true,
			},
			{
				...translate("commands.clan.info.fields.type", {
					lng,
					type: capitalize(clan.type),
					fallbackLng,
				}),
				inline: true,
			},
			{
				...translate("commands.clan.info.fields.memberCount", {
					lng,
					memberCount: clan.members.size,
					fallbackLng,
				}),
			},
		],
	};

	return {
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: clan.members
							.first(25)
							.map<APISelectMenuOption>((member) => ({
								...translate("commands.clan.info.menu.options", {
									lng,
									member,
									role: capitalize(member.role),
									lastSeen: toLocaleString(member.lastSeen, lng),
									fallbackLng,
								}),
								value: member.tag,
								emoji: resolveEmojiIdentifier(CustomEmojis.User),
							})),
						placeholder: translate("commands.clan.info.menu.placeholder", {
							lng,
							fallbackLng,
						}),
						custom_id: buildCustomMenuId(MenuActions.PlayerInfo),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						ButtonActions.ClanMembers,
						{
							label: translate("commands.clan.buttons.clanMembers.label", {
								lng,
								fallbackLng,
							}),
						},
						tag
					),
					createActionButton(
						ButtonActions.CurrentRiverRace,
						{
							label: translate("commands.clan.buttons.currentRiverRace.label", {
								lng,
								fallbackLng,
							}),
						},
						tag
					),
					createActionButton(
						ButtonActions.RiverRaceLog,
						{
							label: translate("commands.clan.buttons.riverRaceLog.label", {
								lng,
								fallbackLng,
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
