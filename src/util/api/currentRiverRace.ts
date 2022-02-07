import { Embed, SelectMenuOption } from "@discordjs/builders";
import { CurrentRiverRace } from "apiroyale";
import type { APIEmbedField } from "discord-api-types/v9";
import { Colors, SelectMenuComponent } from "discord.js";
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
	const embed = new Embed()
		.setTitle(
			translate("commands.clan.currentRiverRace.title", {
				lng,
				race,
				day: training ? race.day : race.day - 3,
				training,
			})
		)
		.setColor(
			training
				? Colors.Green
				: Colors.DarkPurple
		)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(race.lastUpdate)
		.setThumbnail(race.clan.badgeUrl)
		.setURL(Constants.clanLink(tag))
		.setDescription(
			race.leaderboard
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
				.join("\n")
		)
		.addFields(
			...race.warDays
				.filter((period) => period.week === race.week)
				.map<APIEmbedField>((period) => ({
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
				}))
		);

	return {
		embeds: [embed],
		components: [
			{
				type: 1 /** ActionRow */,
				components: [
					new SelectMenuComponent({
						type: 3 /** SelectMenu */,
						options: participants.first(25).map(
							(participant, i) =>
								new SelectMenuOption({
									...translate("commands.clan.currentRiverRace.menu.options", {
										lng,
										participant,
										rank: i + 1,
									}),
									value: participant.tag,
								})
						),
						placeholder: translate(
							"commands.clan.currentRiverRace.menu.placeholder",
							{ lng }
						),
						custom_id: buildCustomMenuId(MenuActions.PlayerInfo),
					}),
				],
			},
			{
				type: 1 /** ActionRow */,
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
