import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { createActionId } from "../customId";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import validateTag from "../validateTag";

/**
 * Displays information about the current river race of a clan.
 * @param client - The client
 * @param tag - The tag of the clan
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const currentRiverRace: APIMethod<string> = async (
	client,
	tag,
	{ ephemeral, lng }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: translate("common.invalidTag", { lng }),
			ephemeral: true,
		};

	const race = await client.currentRiverRaces
		.fetch(tag)
		.catch((error: Error) => {
			void CustomClient.printToStderr(error);
			return { content: error.message, ephemeral: true };
		});

	if (!("clan" in race)) return race;
	const training = race.periodType === "training";
	const weekDay = (race.periodIndex + 1) % 7;
	const week = Math.ceil(race.periodIndex / 7);

	return {
		embeds: [
			{
				title: translate("commands.clan.currentRiverRace.title", {
					lng,
					week,
					day: weekDay ? (training ? weekDay : weekDay - 3) : 4,
					training,
				}),
				color: training ? Colors.Green : Colors.DarkPurple,
				footer: { text: translate("common.footer", { lng }) },
				timestamp: new Date(
					client.currentRiverRaces.maxAges[tag]!
				).toISOString(),
				thumbnail: {
					url: Constants.clanBadgeUrl(race.clan.badgeId),
				},
				url: Constants.clanLink(tag),
				description: race.clans
					.map((standing) =>
						translate("commands.clan.currentRiverRace.description", {
							lng,
							standing,
							participants: (race.periodLogs.length
								? standing.participants.filter((p) => p.fame)
								: standing.participants
							).length,
							context: training.toString(),
						})
					)
					.join("\n"),
				fields: race.periodLogs
					.filter((period) => Math.ceil(period.periodIndex / 7) === week)
					.map(
						(period) => (
							translate("commands.clan.currentRiverRace.field", {
								lng,
								day: period.periodIndex % 7,
							}),
							{
								name: translate("commands.clan.currentRiverRace.field.name", {
									lng,
									period,
									p: period,
								}),
								value: period.items
									.map((standing) =>
										translate("commands.clan.currentRiverRace.field.value", {
											lng,
											standing,
											clanName: race.clans.find(
												(clan) => clan.tag === standing.clan.tag
											)!.name,
										})
									)
									.join("\n"),
							}
						)
					),
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: race.clan.participants
							.filter((p) => p.decksUsed)
							.slice(0, 25)
							.map((participant, i) => ({
								...translate("commands.clan.currentRiverRace.menu.options", {
									lng,
									participant,
									rank: i + 1,
								}),
								value: participant.tag,
							})),
						placeholder: translate(
							"commands.clan.currentRiverRace.menu.placeholder",
							{ lng }
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
							label: translate("commands.clan.buttons.clanInfo.label", {
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
		],
		ephemeral,
	};
};
