import { Embed } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { Player } from "apiroyale";
import { Constants as DiscordConstants, MessageActionRow } from "discord.js";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions } from "../types";
import validateTag from "../validateTag";

const digits = Constants.percentageDigits();
/**
 * Displays information about a player.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerInfo = async (
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

	const player = await client.players.fetch(tag).catch((error: Error) => {
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(player instanceof Player)) return player;
	const embed = new Embed()
		.setTitle(translate("commands.player.info.title", { lng, player }))
		.setColor(DiscordConstants.Colors.BLUE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerLink(player))
		.addField({
			...translate("commands.player.info.fields.level", {
				lng,
				returnObjects: true,
				player,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.trophies", {
				lng,
				returnObjects: true,
				trophies: player.trophies,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.starPoints", {
				lng,
				returnObjects: true,
				starPoints: player.starPoints,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.clan", {
				lng,
				returnObjects: true,
				clan: player.clan,
				clanLink: player.clan && Constants.clanLink(player.clan),
				role: player.role,
				context: typeof player.clan,
			}),
		})
		.addField({
			...translate("commands.player.info.fields.deck", {
				lng,
				returnObjects: true,
			}),
			value: Constants.playerInfoCurrentDeckFieldValue(player),
		});
	if (player.leagueStatistics)
		embed
			.addField({
				...translate(
					"commands.player.info.fields.leagueStatistics.currentSeason",
					{
						lng,
						returnObjects: true,
						bestTrophies: player.leagueStatistics.currentSeason.bestTrophies,
					}
				),
				inline: true,
			})
			.addField({
				...translate(
					"commands.player.info.fields.leagueStatistics.previousSeason",
					{
						lng,
						returnObjects: true,
						bestTrophies: player.leagueStatistics.previousSeason.bestTrophies,
					}
				),
				inline: true,
			})
			.addField({
				...translate(
					"commands.player.info.fields.leagueStatistics.bestSeason",
					{
						lng,
						returnObjects: true,
						trophies: player.leagueStatistics.bestSeason.trophies,
					}
				),
				inline: true,
			});
	embed
		.addField({
			...translate("commands.player.info.fields.badges", {
				lng,
				returnObjects: true,
			}),
			value: Constants.playerInfoBadgesFieldValue(player.badges),
		})
		.addField({
			...translate("commands.player.info.fields.wins", {
				lng,
				returnObjects: true,
				wins: player.wins,
				winRatio: player.winPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.threeCrownWins", {
				lng,
				returnObjects: true,
				threeCrownWins: player.threeCrownWins,
				threeCrownWinRatio: player.threeCrownWinPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.losses", {
				lng,
				returnObjects: true,
				losses: player.losses,
				lossesPercent: player.lossPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.battleCount", {
				lng,
				returnObjects: true,
				battleCount: player.battleCount,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.bestTrophies", {
				lng,
				returnObjects: true,
				bestTrophies: player.bestTrophies,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.cardCount", {
				lng,
				returnObjects: true,
				cardCount: player.cards.size,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.weeklyDonations", {
				lng,
				returnObjects: true,
				weeklyDonations: player.donationsPerWeek,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.weeklyDonationsReceived", {
				lng,
				returnObjects: true,
				weeklyDonationsReceived: player.donationsReceivedPerWeek,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.totalDonations", {
				lng,
				returnObjects: true,
				totalDonations: player.totalDonations,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.currentFavouriteCard", {
				lng,
				returnObjects: true,
				favouriteCard: player.favouriteCard,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.clanWarsVeteran", {
				lng,
				returnObjects: true,
				player,
			}),
		})
		.addField({
			...translate("commands.player.info.fields.challengeStatistics", {
				lng,
				returnObjects: true,
				player,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.tournamentStatistics", {
				lng,
				returnObjects: true,
				player,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.achievements", {
				lng,
				returnObjects: true,
			}),
			value: Constants.playerInfoAchievementsFieldValue(player),
		});

	const row1 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.ClanInfo,
			{ label: translate("commands.clan.buttons.clanInfo.label", { lng }) },
			player.clan?.tag ?? "#"
		)
	);

	return {
		embeds: [embed],
		components: [row1],
		ephemeral,
	};
};
