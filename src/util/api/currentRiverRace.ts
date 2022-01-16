import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { CurrentRiverRace } from "apiroyale";
import { APIEmbedField } from "discord-api-types/v9";
import {
	Constants as DiscordConstants,
	MessageActionRow,
	MessageSelectMenu,
} from "discord.js";
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
export const currentRiverRace = async (
	client: ClientRoyale,
	tag: string,
	{ ephemeral, lng }: { lng?: string; ephemeral?: boolean }
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
				training,
			})
		)
		.setColor(
			training
				? DiscordConstants.Colors.GREEN
				: DiscordConstants.Colors.DARK_PURPLE
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

	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.addOptions(
				...participants
					.first(25)
					.map<{ description: string; label: string; value: string }>(
						(participant, i) => ({
							...translate("commands.clan.currentRiverRace.menu.options", {
								lng,

								participant,
								rank: i + 1,
							}),
							value: participant.tag,
						})
					)
			)
			.setPlaceholder(
				translate("commands.clan.currentRiverRace.menu.placeholder", { lng })
			)
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
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
		)
	);

	return {
		embeds: [embed],
		components: [row1, row2],
		ephemeral,
	};
};
