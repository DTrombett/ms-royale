import { Embed } from "@discordjs/builders";
import { Clan } from "apiroyale";
import type { APISelectMenuOption } from "discord-api-types/v9";
import { Constants as DiscordConstants, SelectMenuComponent } from "discord.js";
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
	const embed = new Embed()
		.setTitle(translate("commands.clan.info.title", { lng, clan, fallbackLng }))
		.setDescription(clan.description)
		.setColor(DiscordConstants.Colors.BLUE)
		.setFooter({ text: translate("common.lastUpdated", { lng, fallbackLng }) })
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(Constants.clanLink(tag));

	embed
		.addField({
			...translate("commands.clan.info.fields.warTrophies", {
				lng,
				warTrophies: clan.warTrophies,
				fallbackLng,
			}),
		})
		.addField({
			...translate("commands.clan.info.fields.location", {
				lng,
				location: clan.locationName,
				fallbackLng,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.requiredTrophies", {
				lng,
				requiredTrophies: clan.requiredTrophies,
				fallbackLng,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.weeklyDonations", {
				lng,
				weeklyDonations: clan.donationsPerWeek,
				fallbackLng,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.score", {
				lng,
				score: clan.score,
				fallbackLng,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.type", {
				lng,
				type: capitalize(clan.type),
				fallbackLng,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.clan.info.fields.memberCount", {
				lng,
				memberCount: clan.members.size,
				fallbackLng,
			}),
		});

	return {
		embeds: [embed],
		components: [
			{
				type: 1 /** ActionRow */,
				components: [
					new SelectMenuComponent({
						type: 3 /** SelectMenu */,
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
					}),
				],
			},
			{
				type: 1 /** ActionRow */,
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
