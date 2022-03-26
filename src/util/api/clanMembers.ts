import {
	Embed,
	SelectMenuComponent,
	time,
	TimestampStyles,
} from "@discordjs/builders";
import { ClanMemberList } from "apiroyale";
import type {
	APIEmbedField,
	APISelectMenuOption,
	Snowflake,
} from "discord-api-types/v10";
import { Colors } from "discord.js";
import { cast, resolveEmojiIdentifier } from "..";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import type { APIMethod } from "../types";
import {
	ButtonActions,
	CustomEmojis,
	Emojis,
	MenuActions,
	SortMethod,
} from "../types";
import validateTag from "../validateTag";

const emojis: Record<SortMethod, CustomEmojis | Emojis> = {
	[SortMethod.DonationsPerWeek]: CustomEmojis.Donations,
	[SortMethod.DonationsReceivedPerWeek]: CustomEmojis.DonationsReceived,
	[SortMethod.LastSeen]: Emojis.Watch,
	[SortMethod.Name]: Emojis.Alphabet,
	[SortMethod.Rank]: Emojis.Trophy,
	[SortMethod.LastSeenDesc]: Emojis.Watch,
};

/**
 * Displays information about a clan's members.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const clanMembers: APIMethod<
	string,
	{ sort?: SortMethod; index?: number; id: Snowflake }
> = async (
	client,
	tag,
	{ ephemeral, lng, index = 0, sort = SortMethod.Rank, id }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const members = await client
		.fetchClanMembers({ tag })
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!(members instanceof ClanMemberList)) return members;
	members.sort((m1, m2) => {
		switch (sort) {
			case SortMethod.Rank:
				return m1.rank - m2.rank;
			case SortMethod.DonationsPerWeek:
				return m2.donationsPerWeek - m1.donationsPerWeek;
			case SortMethod.Name:
				return m1.name.localeCompare(m2.name);
			case SortMethod.DonationsReceivedPerWeek:
				return m2.donationsReceivedPerWeek - m1.donationsReceivedPerWeek;
			case SortMethod.LastSeen:
				return m2.lastSeen.getTime() - m1.lastSeen.getTime();
			case SortMethod.LastSeenDesc:
				return m1.lastSeen.getTime() - m2.lastSeen.getTime();
			default:
				return 0;
		}
	});
	const fields: APIEmbedField[] = [...members.values()]
		.filter((_, i) => i >= index * 10 && i < (index + 1) * 10)
		.map<APIEmbedField>((member, i) => {
			const { rankDifference } = member;

			return {
				name: `${i + 1 + 10 * index}) ${translate("common.tagPreview", {
					lng,
					structure: member,
				})}`,
				value: `${capitalize(member.role)} - ${CustomEmojis.Donations} ${
					member.donationsPerWeek
				} - ${Emojis.Trophy} ${member.trophies} (#${member.rank}${
					rankDifference
						? ` - ${Math.abs(rankDifference)}${
								Emojis[rankDifference > 0 ? "UpArrow" : "DownArrow"]
						  }`
						: ""
				})\n${Emojis.Watch} ${time(
					member.lastSeen,
					TimestampStyles.LongDateTime
				)} (${time(member.lastSeen, TimestampStyles.RelativeTime)})\n${
					CustomEmojis.DonationsReceived
				} ${member.donationsReceivedPerWeek} - ${CustomEmojis.KingLevel} ${
					member.kingLevel
				}`,
			};
		});
	const embed = new Embed()
		.setTitle(
			translate("commands.clan.members.title", { lng, size: members.size })
		)
		.setColor(Colors.Blurple)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(members.first()?.lastUpdate)
		.setURL(Constants.clanLink(tag))
		.addFields(...fields);
	const options: APISelectMenuOption[] = [];
	const translatedOptions = translate("commands.clan.members.menu.options", {
		lng,
	});

	for (const key in translatedOptions)
		if (Object.prototype.hasOwnProperty.call(translatedOptions, key)) {
			cast<keyof typeof translatedOptions>(key);
			const element = translatedOptions[key],
				emoji = emojis[key];

			if (emoji as string)
				options.push({
					...element,
					value: key,
					default: key === sort,
					emoji: resolveEmojiIdentifier(emoji),
				});
		}

	return {
		embeds: [embed],
		components: [
			{
				type: 1 /** ActionRow */,
				components: [
					new SelectMenuComponent({
						type: 3 /** SelectMenu */,
						options,
						placeholder: translate("commands.clan.members.menu.placeholder", {
							lng,
						}),
						custom_id: buildCustomMenuId(MenuActions.ClanMembers, tag, id),
					}),
				],
			},
			{
				type: 1 /** ActionRow */,
				components: [
					createActionButton(
						ButtonActions.ClanInfo,
						{
							label: translate("commands.clan.buttons.clanInfo.label", { lng }),
						},
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
					),
					createActionButton(
						ButtonActions.RiverRaceLog,
						{
							label: translate("commands.clan.buttons.riverRaceLog.label", {
								lng,
							}),
						},
						tag
					),
				],
			},
			{
				type: 1 /** ActionRow */,
				components: [
					createActionButton(
						ButtonActions.ClanMembers,
						{
							emoji: Emojis.BackArrow,
							label: translate("common.back", { lng }),
							disabled: index === 0,
						},
						tag,
						id,
						`${index - 1}`,
						sort
					),
					createActionButton(
						ButtonActions.ClanMembers,
						{
							emoji: Emojis.ForwardArrow,
							label: translate("common.next", { lng }),
							disabled: members.size <= (index + 1) * 10,
						},
						tag,
						id,
						`${index + 1}`,
						sort
					),
				],
			},
		],
		ephemeral,
	};
};
