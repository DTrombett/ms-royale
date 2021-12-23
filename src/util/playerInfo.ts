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
import Constants, { TIME } from "./Constants";
import { buildCustomButtonId } from "./customId";
import { getLocaleConstants } from "./locales";
import normalizeTag from "./normalizeTag";
import { ButtonActions, Emojis } from "./types";
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
	const constants = getLocaleConstants(interaction);

	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return interaction
			.reply({
				content: constants.INVALID_TAG,
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
		.setFooter({ text: constants.LAST_UPDATED })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerInfoUrl(player))
		.addField({
			name: constants.PLAYER_INFO_LEVEL,
			value: Constants.playerInfoLevelFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_TROPHIES,
			value: Constants.playerInfoTrophiesFieldValue(player.trophies),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_STAR_POINTS,
			value: Constants.playerInfoStarPointsFieldValue(player.starPoints),
			inline: true,
		})
		.addField({
			name: constants.CLAN,
			value: Constants.playerInfoClanFieldValue(player),
		})
		.addField({
			name: constants.PLAYER_INFO_CURRENT_DECK,
			value: Constants.playerInfoCurrentDeckFieldValue(player),
		});
	if (player.leagueStatistics)
		embed
			.addField({
				name: constants.PLAYER_INFO_LEAGUE_STATISTICS_CURRENT_SEASON_BEST_TROPHIES,
				value: Constants.playerInfoCurrentBestTrophiesFieldValue(
					player.leagueStatistics
				),
				inline: true,
			})
			.addField({
				name: constants.PLAYER_INFO_LEAGUE_STATISTICS_PREVIOUS_SEASON_BEST_TROPHIES,
				value: Constants.playerInfoPreviousBestTrophiesFieldValue(
					player.leagueStatistics
				),
				inline: true,
			})
			.addField({
				name: constants.PLAYER_INFO_LEAGUE_STATISTICS_BEST_SEASON_TROPHIES,
				value: Constants.playerInfoBestSeasonFieldValue(
					player.leagueStatistics
				),
				inline: true,
			});
	embed
		.addField({
			name: constants.PLAYER_INFO_BADGES,
			value: Constants.playerInfoBadgesFieldValue(player.badges),
		})
		.addField({
			name: constants.PLAYER_INFO_WINS,
			value: Constants.playerInfoWinsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_THREE_CROWN_WINS,
			value: Constants.playerInfoThreeCrownWinsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_LOSSES,
			value: Constants.playerInfoLossesFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_TOTAL_MATCHES,
			value: Constants.playerInfoTotalMatchesFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_BEST_TROPHIES,
			value: Constants.playerInfoTrophiesRecordFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_CARD_COUNT,
			value: Constants.playerInfoCardCountFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_WEEKLY_DONATIONS,
			value: Constants.playerInfoWeekDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_WEEKLY_RECEIVED_DONATIONS,
			value: Constants.playerInfoWeekReceivedDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_TOTAL_DONATIONS,
			value: Constants.playerInfoTotalDonationsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_FAVORITE_CARD,
			value: Constants.playerInfoFavoriteCardFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_OLD_WAR_STATISTICS,
			value: Constants.playerInfoOldWarStatsFieldValue(player),
		})
		.addField({
			name: constants.PLAYER_INFO_CHALLENGE_STATISTICS,
			value: Constants.playerInfoChallengeStatsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_TOURNAMENT_STATISTICS,
			value: Constants.playerInfoTournamentStatsFieldValue(player),
			inline: true,
		})
		.addField({
			name: constants.PLAYER_INFO_ACHIEVEMENTS,
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
			.setLabel(constants.CLAN)
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
