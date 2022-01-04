import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { FinishedRiverRaceManager, RiverRaceLogResults } from "apiroyale";
import type { APIEmbedField, Snowflake } from "discord-api-types/v9";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { t } from "i18next";
import CustomClient from "../CustomClient";
import { buildCustomButtonId } from "../customId";
import normalizeTag from "../normalizeTag";
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
			content: t("common.invalidTag", { lng }),
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
	const last = index === log.size - 1;

	if (race === undefined)
		return {
			content: t("commands.clan.riverRaceLog.notFound", { lng }),
			ephemeral: true,
		};
	const { clan } = race.leaderboard.get(tag)!;
	const embed = new Embed()
		.setTitle(t("commands.clan.riverRaceLog.title", { lng, race }))
		.setColor(DiscordCostants.Colors.BLURPLE)
		.setThumbnail(clan.badgeUrl)
		.setFooter({
			text: t("commands.clan.riverRaceLog.footer", { lng }),
		})
		.setTimestamp(race.finishTime)
		.addFields(
			...race.leaderboard.map<APIEmbedField>((standing) =>
				t("commands.clan.riverRaceLog.field", {
					lng,
					returnObjects: true,
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
			.setPlaceholder(t("commands.clan.riverRaceLog.menu.placeholder", { lng }))
			.addOptions(
				[...clan.participants.values()]
					.filter((p) => p.medals)
					.sort((a, b) => b.medals - a.medals)
					.slice(0, 25)
					.map((participant, i) => ({
						...t("commands.clan.riverRaceLog.menu.options", {
							lng,
							returnObjects: true,
							participant,
							rank: i + 1,
						}),
						value: participant.tag,
					}))
			)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(t("commands.clan.riverRaceLog.buttons.clanInfo.label", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
	);
	const row3 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					`${index !== undefined ? index + 1 : 1}`,
					id
				)
			)
			.setEmoji(Emojis.BackArrow)
			.setLabel(t("common.back", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(last),
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					`${index !== undefined ? index - 1 : 0}`,
					id
				)
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(t("common.next", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(index === undefined || index === 0)
	);

	return {
		embeds: [embed],
		components: [row1, row2, row3],
		ephemeral,
	};
};

export default riverRaceLog;
