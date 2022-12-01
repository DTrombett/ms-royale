import type { Snowflake } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import { convertDate, transformDate } from "../APIDate";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { createActionId } from "../customId";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { Emojis } from "../types";
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
		after?: string;
		before?: string;
		id: Snowflake;
	}
> = async (client, tag, { ephemeral, lng, after, before, id }) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const log = await client.riverRaceLogs
		.fetch(tag, { after, before, limit: 1 })
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!("items" in log)) return log;
	const [race] = log.items;

	if (!log.items.length)
		return {
			content: translate("commands.clan.riverRaceLog.notFound", { lng }),
			ephemeral: true,
		};
	const { clan } = race.standings.find(
		(standing) => standing.clan.tag === tag
	)!;

	return {
		embeds: [
			{
				title: translate("commands.clan.riverRaceLog.title", {
					lng,
					seasonId: race.seasonId,
					weekNumber: race.sectionIndex + 1,
				}),
				color: Colors.Blurple,
				thumbnail: { url: Constants.clanBadgeUrl(clan.badgeId) },
				footer: {
					text: translate("commands.clan.riverRaceLog.footer", { lng }),
				},
				timestamp: transformDate(race.createdDate),
				fields: race.standings.map((standing, i) => {
					const finishTime =
						standing.clan.finishTime !== undefined
							? convertDate(standing.clan.finishTime)
							: undefined;
					return translate("commands.clan.riverRaceLog.field", {
						lng,
						rank: standing.rank,
						name: standing.clan.name,
						tag: standing.clan.tag,
						points: standing.clan.fame,
						trophyChange: standing.trophyChange,
						pointsToOvertake:
							race.standings[i - 1]?.clan.fame - standing.clan.fame,
						score: standing.clan.clanScore,
						finishedAt: finishTime
							? Math.round(finishTime.getTime() / 1000)
							: "",
						finished: finishTime !== undefined,
						participants: standing.clan.participants.filter((p) => p.decksUsed)
							.length,
					});
				}),
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: clan.participants
							.filter((p) => p.fame)
							.sort((a, b) => b.fame - a.fame)
							.slice(0, 25)
							.map((participant, i) => ({
								...translate("commands.clan.riverRaceLog.menu.options", {
									lng,
									medals: participant.fame,
									boatAttacks: participant.boatAttacks,
									decksUsed: participant.decksUsed,
									name: participant.name,
									tag: participant.tag,
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
						custom_id: createActionId("player"),
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
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"rl",
						{
							emoji: Emojis.BackArrow,
							label: translate("common.back", { lng }),
							disabled: after === undefined,
						},
						tag,
						id,
						after,
						before
					),
					createActionButton(
						"rl",
						{
							emoji: Emojis.ForwardArrow,
							label: translate("common.next", { lng }),
							disabled: before === undefined,
						},
						tag,
						id,
						after,
						before
					),
				],
			},
		],
		ephemeral,
	};
};

export default riverRaceLog;
