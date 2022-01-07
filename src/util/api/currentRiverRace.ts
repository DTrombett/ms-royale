import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { CurrentRiverRace, RiverRacePeriodType } from "apiroyale";
import { APIEmbedField } from "discord-api-types/v9";
import {
	Constants as DiscordConstants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from "discord.js";
import Constants from "../Constants";
import CustomClient from "../CustomClient";
import { buildCustomButtonId, buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
import { translate } from "../translate";
import { ButtonActions, Emojis, MenuActions } from "../types";
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
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(race instanceof CurrentRiverRace)) return race;
	const training = race.type === RiverRacePeriodType.training;
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
		.setURL(Constants.clanLink(race.clan))
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
			...race.warDays.map<APIEmbedField>((period) => ({
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
								returnObjects: true,
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
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(
				translate("commands.clan.currentRiverRace.buttons.clanInfo.label", {
					lng,
				})
			)
			.setStyle(DiscordConstants.MessageButtonStyles.PRIMARY),
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.RiverRaceLog, tag))
			.setEmoji(Emojis.Log)
			.setLabel(
				translate("commands.clan.currentRiverRace.buttons.riverRaceLog.label", {
					lng,
				})
			)
			.setStyle(DiscordConstants.MessageButtonStyles.PRIMARY)
	);

	return {
		embeds: [embed],
		components: [row1, row2],
		ephemeral,
	};
};
