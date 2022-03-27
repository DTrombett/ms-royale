import { FinishedRiverRaceManager, RiverRaceLogResults } from "apiroyale";
import type { APIEmbed, Snowflake } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
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
export const riverRaceLog: APIMethod<
	string,
	{
		index?: number;
		id: Snowflake;
	}
> = async (client, tag, { ephemeral, lng, index, id }) => {
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
			void CustomClient.printToStderr(error);
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
	const embed: APIEmbed = {
		title: translate("commands.clan.riverRaceLog.title", { lng, race }),
		color: Colors.Blurple,
		thumbnail: { url: clan.badgeUrl },
		footer: {
			text: translate("commands.clan.riverRaceLog.footer", { lng }),
		},
		timestamp: race.finishTime.toISOString(),
		fields: race.leaderboard.map((standing) =>
			translate("commands.clan.riverRaceLog.field", {
				lng,
				standing,
				finishedAt: standing.clan.finishedAt
					? Math.round(standing.clan.finishedAt.getTime() / 1000)
					: "",
				finished: (standing.clan.finishedAt !== null).toString(),
				participants: standing.clan.participants.filter((p) => p.decksUsed > 0)
					.size,
			})
		),
	};

	return {
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: clan.participants
							.filter((p) => Boolean(p.medals))
							.sort((a, b) => b.medals - a.medals)
							.first(25)
							.map((participant, i) => ({
								...translate("commands.clan.riverRaceLog.menu.options", {
									lng,
									participant,
									rank: i + 1,
								}),
								value: participant.tag,
							})),
						placeholder: translate(
							"commands.clan.riverRaceLog.menu.placeholder",
							{
								lng,
							}
						),
						custom_id: buildCustomMenuId(MenuActions.PlayerInfo),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
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
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
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
					),
				],
			},
		],
		ephemeral,
	};
};

export default riverRaceLog;
