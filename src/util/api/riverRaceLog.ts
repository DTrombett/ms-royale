import type { APIEmbed, Snowflake } from "discord-api-types/v10";
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
// TODO: Use cursors
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

	const log = await client.riverRaceLogs.fetch(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!("items" in log)) return log;
	const race = log.items.at(index ?? 0);
	const disabled = index === log.items.length - 1;

	if (race === undefined)
		return {
			content: translate("commands.clan.riverRaceLog.notFound", { lng }),
			ephemeral: true,
		};
	const { clan } = race.standings.find(
		(standing) => standing.clan.tag === tag
	)!;
	const embed: APIEmbed = {
		title: translate("commands.clan.riverRaceLog.title", { lng, race }),
		color: Colors.Blurple,
		thumbnail: { url: Constants.clanBadgeUrl(clan.badgeId) },
		footer: {
			text: translate("commands.clan.riverRaceLog.footer", { lng }),
		},
		timestamp: transformDate(race.createdDate),
		fields: race.standings.map((standing) => {
			const finishTime =
				standing.clan.finishTime !== undefined
					? convertDate(standing.clan.finishTime)
					: undefined;
			return translate("commands.clan.riverRaceLog.field", {
				lng,
				standing,
				finishedAt: finishTime ? Math.round(finishTime.getTime() / 1000) : "",
				finished: finishTime !== undefined,
				participants: standing.clan.participants.filter((p) => p.decksUsed)
					.length,
			});
		}),
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
							.filter((p) => p.fame)
							.sort((a, b) => b.fame - a.fame)
							.slice(0, 25)
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
							disabled,
						},
						tag,
						`${index !== undefined ? index + 1 : 1}`,
						id
					),
					createActionButton(
						"rl",
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
