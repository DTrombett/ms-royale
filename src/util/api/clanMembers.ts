import { TimestampStyles } from "@discordjs/builders";
import type {
	APIEmbedField,
	APISelectMenuOption,
	Snowflake,
} from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import { cast, resolveEmojiIdentifier } from "..";
import { convertDate } from "../APIDate";
import capitalize from "../capitalize";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { createActionId } from "../customId";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { CustomEmojis, Emojis, SortMethod } from "../types";
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

	const members = await client.clans.fetchMembers(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!("items" in members)) return members;
	members.items.sort((m1, m2) => {
		switch (sort) {
			case SortMethod.Rank:
				return m1.clanRank - m2.clanRank;
			case SortMethod.DonationsPerWeek:
				return m2.donations - m1.donations;
			case SortMethod.Name:
				return m1.name.localeCompare(m2.name);
			case SortMethod.DonationsReceivedPerWeek:
				return m2.donationsReceived - m1.donationsReceived;
			case SortMethod.LastSeen:
				return (
					convertDate(m2.lastSeen).getTime() -
					convertDate(m1.lastSeen).getTime()
				);
			case SortMethod.LastSeenDesc:
				return (
					convertDate(m1.lastSeen).getTime() -
					convertDate(m2.lastSeen).getTime()
				);
			default:
				return 0;
		}
	});
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
		embeds: [
			{
				title: translate("commands.clan.members.title", {
					lng,
					size: members.items.length,
				}),
				color: Colors.Blurple,
				footer: { text: translate("common.footer", { lng }) },
				timestamp: new Date(
					client.players.maxAges[members.items[0].tag]!
				).toISOString(),
				url: Constants.clanLink(tag),
				fields: members.items
					.slice(index * 10, index * 10 + 10)
					.map<APIEmbedField>((member, i) => {
						const rankDifference = member.clanRank - member.previousClanRank;

						return {
							name: `${i + 1 + 10 * index}) ${translate("common.tagPreview", {
								lng,
								tag: member.tag,
								name: member.name,
							})}`,
							value: `${capitalize(member.role)} - ${CustomEmojis.Donations} ${
								member.donations
							} - ${Emojis.Trophy} ${member.trophies} (#${member.clanRank}${
								rankDifference
									? ` - ${Math.abs(rankDifference)}${
											Emojis[rankDifference > 0 ? "UpArrow" : "DownArrow"]
									  }`
									: ""
							})\n${Emojis.Watch} <t:${
								convertDate(member.lastSeen).getTime() / 1000
							}:${TimestampStyles.LongDateTime}> (<t:${
								convertDate(member.lastSeen).getTime() / 1000
							}:${TimestampStyles.RelativeTime}>)\n${
								CustomEmojis.DonationsReceived
							} ${member.donationsReceived} - ${CustomEmojis.KingLevel} ${
								member.expLevel
							}`,
						};
					}),
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options,
						placeholder: translate("commands.clan.members.menu.placeholder", {
							lng,
						}),
						custom_id: createActionId("members", tag, id),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"ci",
						{
							label: translate("commands.clan.buttons.clanInfo.label", { lng }),
						},
						tag
					),
					createActionButton(
						"cr",
						{
							label: translate("commands.clan.buttons.currentRiverRace.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						"rl",
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
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"cm",
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
						"cm",
						{
							emoji: Emojis.ForwardArrow,
							label: translate("common.next", { lng }),
							disabled: members.items.length <= (index + 1) * 10,
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
