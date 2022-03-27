import { CurrentRiverRace } from "apiroyale";
import type { APIEmbed } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions, MenuActions } from "../types";
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

	const race = await client.races.fetch(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(race instanceof CurrentRiverRace)) return race;
	const training = race.type.toLowerCase() === "training";
	const participants = race.clan.participants.filter((p) =>
		Boolean(p.decksUsed)
	);
	const embed: APIEmbed = {
		title: translate("commands.clan.currentRiverRace.title", {
			lng,
			race,
			day: training ? race.day : race.day - 3,
			training,
		}),
		color: training ? Colors.Green : Colors.DarkPurple,
		footer: { text: translate("common.lastUpdated", { lng }) },
		timestamp: race.lastUpdate.toISOString(),
		thumbnail: { url: race.clan.badgeUrl },
		url: Constants.clanLink(tag),
		description: race.leaderboard
			.map((standing) =>
				translate("commands.clan.currentRiverRace.description", {
					lng,
					standing,
					participants: (race.warDays.size
						? standing.participants.filter((p) => Boolean(p.medals))
						: standing.participants
					).size,
					context: training.toString(),
				})
			)
			.join("\n"),
		fields: race.warDays
			.filter((period) => period.week === race.week)
			.map((period) => ({
				name: translate("commands.clan.currentRiverRace.field.name", {
					lng,
					period,
					p: period,
				}),
				value: period.leaderboard
					.map((standing) =>
						translate("commands.clan.currentRiverRace.field.value", {
							lng,
							standing,
							clanName: race.leaderboard.get(standing.clanTag)!.name,
						})
					)
					.join("\n"),
			})),
	};

	return {
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: participants.first(25).map((participant, i) => ({
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
							label: translate("commands.clan.buttons.clanInfo.label", {
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
		],
		ephemeral,
	};
};
