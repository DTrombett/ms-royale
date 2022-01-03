import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { CurrentRiverRace, RiverRacePeriodType } from "apiroyale";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { t } from "i18next";
import Constants from "../Constants";
import { buildCustomButtonId, buildCustomMenuId } from "../customId";
import normalizeTag from "../normalizeTag";
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
			content: t("commond.invalidTag", { lng }),
			ephemeral: true,
		};

	const race = await client.races.fetch(tag).catch((error: Error) => {
		console.error(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(race instanceof CurrentRiverRace)) return race;
	const training = race.type === RiverRacePeriodType.training;
	const participants = race.clan.participants
		.filter((p) => Boolean(p.decksUsed))
		.sort((a, b) =>
			race.warDays.size ? b.medals - a.medals : b.decksUsed - a.decksUsed
		);
	const embed = new Embed()
		.setTitle(
			t("commands.clan.currentRiverRace.title", {
				lng,
				week: Math.ceil(race.monthDay / 7),
				day: training ? race.weekDay : race.weekDay - 3,
				training,
			})
		)
		.setColor(
			training
				? DiscordCostants.Colors.GREEN
				: DiscordCostants.Colors.DARK_PURPLE
		)
		.setFooter({ text: t("common.lastUpdated", { lng }) })
		.setTimestamp(race.lastUpdate)
		.setThumbnail(race.clan.badgeUrl)
		.setURL(Constants.clanLink(race.clan))
		.setDescription(
			race.leaderboard
				.map((standing) =>
					t("commands.clan.currentRiverRace.description", {
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
		);

	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.addOptions(
				...participants
					.first(25)
					.map<{ description: string; label: string; value: string }>(
						(participant, i) => ({
							...t("commands.clan.currentRiverRace.menu.options", {
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
				t("commands.clan.currentRiverRace.menu.placeholder", { lng })
			)
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(
				t("commands.clan.currentRiverRace.buttons.clanInfo.label", { lng })
			)
			.setStyle(MessageButtonStyles.PRIMARY),
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.RiverRaceLog, tag))
			.setEmoji(Emojis.Log)
			.setLabel(
				t("commands.clan.currentRiverRace.buttons.riverRaceLog.label", { lng })
			)
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return {
		embeds: [embed],
		components: [row1, row2],
		ephemeral,
	};
};
