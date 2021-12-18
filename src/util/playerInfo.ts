import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction,
} from "discord.js";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import Constants, { ButtonActions, TIME } from "./Constants";
import { buildCustomButtonId } from "./customId";
import normalizeTag from "./normalizeTag";
import { Emojis } from "./types";
import validateTag from "./validateTag";

export const playerInfo = async (
	client: ClientRoyale,
	interaction:
		| ButtonInteraction
		| CommandInteraction
		| ContextMenuInteraction
		| SelectMenuInteraction,
	tag: string,
	ephemeral?: boolean
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return interaction
			.reply({
				content: Constants.invalidTag(),
				ephemeral: true,
			})
			.catch(console.error);

	const player = await client.players
		.fetch(tag, {
			maxAge: TIME.millisecondsPerMinute * 5,
		})
		.catch((error: Error) => {
			console.error(error);
			return interaction.reply({ content: error.message, ephemeral: true });
		})
		.catch(console.error);

	if (!player) return undefined;
	const embed = new Embed()
		.setTitle(Constants.playerInfoTitle(player))
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter({ text: Constants.playerInfoFooter() })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerInfoUrl(player))
		.addField({
			name: Constants.playerInfoLevelFieldName(),
			value: Constants.playerInfoLevelFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoTrophiesFieldName(),
			value: Constants.playerInfoTrophiesFieldValue(player.trophies),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoStarPointsFieldName(),
			value: Constants.playerInfoStarPointsFieldValue(player.starPoints),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoClanFieldName(),
			value: Constants.playerInfoClanFieldValue(player),
		})
		.addField({
			name: Constants.playerInfoCurrentDeckFieldName(),
			value: Constants.playerInfoCurrentDeckFieldValue(player),
		});
	if (player.leagueStatistics)
		embed
			.addField({
				name: Constants.playerInfoCurrentBestTrophiesFieldName(),
				value: Constants.playerInfoCurrentBestTrophiesFieldValue(
					player.leagueStatistics
				),
				inline: true,
			})
			.addField({
				name: Constants.playerInfoPreviousBestTrophiesFieldName(),
				value: Constants.playerInfoPreviousBestTrophiesFieldValue(
					player.leagueStatistics
				),
				inline: true,
			})
			.addField({
				name: Constants.playerInfoBestSeasonFieldName(),
				value: Constants.playerInfoBestSeasonFieldValue(
					player.leagueStatistics
				),
				inline: true,
			});
	embed
		.addField({
			name: Constants.playerInfoBadgesFieldName(),
			value: Constants.playerInfoBadgesFieldValue(player.badges),
		})
		.addField({
			name: Constants.playerInfoWinsFieldName(),
			value: Constants.playerInfoWinsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoThreeCrownWinsFieldName(),
			value: Constants.playerInfoThreeCrownWinsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoLossesFieldName(),
			value: Constants.playerInfoLossesFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoTotalMatchesFieldName(),
			value: Constants.playerInfoTotalMatchesFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoTrophiesRecordFieldName(),
			value: Constants.playerInfoTrophiesRecordFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoCardCountFieldName(),
			value: Constants.playerInfoCardCountFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoWeekDonationsFieldName(),
			value: Constants.playerInfoWeekDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoWeekReceivedDonationsFieldName(),
			value: Constants.playerInfoWeekReceivedDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoTotalDonationsFieldName(),
			value: Constants.playerInfoTotalDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoFavoriteCardFieldName(),
			value: Constants.playerInfoFavoriteCardFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoOldWarStatsFieldName(),
			value: Constants.playerInfoOldWarStatsFieldValue(player),
		})
		.addField({
			name: Constants.playerInfoChallengeStatsFieldName(),
			value: Constants.playerInfoChallengeStatsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoTournamentStatsFieldName(),
			value: Constants.playerInfoTournamentStatsFieldValue(player),
			inline: true,
		})
		.addField({
			name: Constants.playerInfoAchievementsFieldName(),
			value: Constants.playerInfoAchievementsFieldValue(player),
		});

	const row1 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				player.clan
					? buildCustomButtonId(ButtonActions.ClanInfo, player.clan.tag)
					: "-"
			)
			.setDisabled(player.clan === undefined)
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(Constants.clanInfoLabel())
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return interaction
		.reply({
			embeds: [embed],
			components: [row1],
			ephemeral,
		})
		.catch(console.error);
};
