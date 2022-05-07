import type { APISelectMenuOption } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import { transformDate } from "../APIDate";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton, {
	resolveEmojiIdentifier,
} from "../createActionButton";
import CustomClient from "../CustomClient";
import { createActionId } from "../customId";
import { locationToLocale } from "../locales";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { CustomEmojis } from "../types";
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

	if (!("tag" in clan)) return clan;
	const fallbackLng = locationToLocale(clan.location);

	return {
		embeds: [
			{
				title: translate("commands.clan.info.title", {
					lng,
					clan,
					fallbackLng,
				}),
				description: clan.description,
				color: Colors.Blue,
				footer: { text: translate("common.footer", { lng, fallbackLng }) },
				timestamp: new Date(client.clans.maxAges[tag]!).toISOString(),
				thumbnail: {
					url: Constants.clanBadgeUrl(clan.badgeId),
				},
				url: Constants.clanLink(tag),
				fields: [
					{
						...translate("commands.clan.info.fields.warTrophies", {
							lng,
							warTrophies: clan.clanWarTrophies,
							fallbackLng,
						}),
					},
					{
						...translate("commands.clan.info.fields.location", {
							lng,
							location: clan.location.name,
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
							score: clan.clanScore,
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
							memberCount: clan.members,
							fallbackLng,
						}),
					},
				],
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: clan.memberList
							.slice(0, 25)
							.map<APISelectMenuOption>((member) => ({
								...translate("commands.clan.info.menu.options", {
									lng,
									member,
									role: capitalize(member.role),
									lastSeen: transformDate(member.lastSeen),
									fallbackLng,
								}),
								value: member.tag,
								emoji: resolveEmojiIdentifier(CustomEmojis.User),
							})),
						placeholder: translate("commands.clan.info.menu.placeholder", {
							lng,
							fallbackLng,
						}),
						custom_id: createActionId("player"),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"cm",
						{
							label: translate("commands.clan.buttons.clanMembers.label", {
								lng,
								fallbackLng,
							}),
						},
						tag
					),
					createActionButton(
						"cr",
						{
							label: translate("commands.clan.buttons.currentRiverRace.label", {
								lng,
								fallbackLng,
							}),
						},
						tag
					),
					createActionButton(
						"rl",
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
