import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { FinishedRiverRaceManager, RiverRaceLogResults } from "apiroyale";
import type { APIEmbedField, Snowflake } from "discord-api-types/v9";
import {
	Constants as DiscordConstants,
	MessageActionRow,
	MessageSelectMenu,
} from "discord.js";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions, Emojis, MenuActions } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a river race log.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const riverRaceLog = async (
	client: ClientRoyale,
	tag: string,
	{
		ephemeral,
		lng,
		index,
		id,
	}: { lng?: string; ephemeral?: boolean; index?: number; id: Snowflake }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	let log:
		| FinishedRiverRaceManager
		| RiverRaceLogResults
		| { content: string; ephemeral: boolean }
		| undefined = client.allClans.get(tag)?.riverRaceLog;
	if (!log || log.size === 0)
		log = await client.fetchRiverRaceLog({ tag }).catch((error: Error) => {
			CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (
		!(log instanceof RiverRaceLogResults) &&
		!(log instanceof FinishedRiverRaceManager)
	)
		return log;
	const race = index !== undefined ? log.at(index) : log.first();
	const disabled = index === log.size - 1;

	if (race === undefined)
		return {
			content: translate("commands.clan.riverRaceLog.notFound", { lng }),
			ephemeral: true,
		};
	const { clan } = race.leaderboard.get(tag)!;
	const embed = new Embed()
		.setTitle(translate("commands.clan.riverRaceLog.title", { lng, race }))
		.setColor(DiscordConstants.Colors.BLURPLE)
		.setThumbnail(clan.badgeUrl)
		.setFooter({
			text: translate("commands.clan.riverRaceLog.footer", { lng }),
		})
		.setTimestamp(race.finishTime)
		.addFields(
			...race.leaderboard.map<APIEmbedField>((standing) =>
				translate("commands.clan.riverRaceLog.field", {
					lng,

					standing,
					finishedAt: standing.clan.finishedAt
						? Math.round(standing.clan.finishedAt.getTime() / 1000)
						: "",
					finished: (standing.clan.finishedAt !== null).toString(),
					participants: standing.clan.participants.filter(
						(p) => p.decksUsed > 0
					).size,
				})
			)
		);
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(MenuActions.PlayerInfo)
			.setPlaceholder(
				translate("commands.clan.riverRaceLog.menu.placeholder", { lng })
			)
			.addOptions(
				[...clan.participants.values()]
					.filter((p) => p.medals)
					.sort((a, b) => b.medals - a.medals)
					.slice(0, 25)
					.map((participant, i) => ({
						...translate("commands.clan.riverRaceLog.menu.options", {
							lng,

							participant,
							rank: i + 1,
						}),
						value: participant.tag,
					}))
			)
	);
	const row2 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.ClanInfo,
			{ label: translate("commands.clan.buttons.clanInfo.label", { lng }) },
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
	const row3 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.RiverRaceLog,
			{
				emoji: Emojis.BackArrow,
				label: translate("common.back", { lng }),
				disabled,
			},
			tag,
			`${index !== undefined ? index + 1 : 1}`,
			id
		),
		createActionButton(
			ButtonActions.RiverRaceLog,
			{
				emoji: Emojis.ForwardArrow,
				label: translate("common.next", { lng }),
				disabled: index === undefined || index === 0,
			},
			tag,
			`${index !== undefined ? index - 1 : 0}`,
			id
		)
	);

	return {
		embeds: [embed],
		components: [row1, row2, row3],
		ephemeral,
	};
};

export default riverRaceLog;
