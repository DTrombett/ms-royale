import { Player } from "apiroyale";
import type { APIEmbed } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Colors } from "discord.js";
import type { APIMethod } from "..";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { CustomEmojis } from "../types";
import validateTag from "../validateTag";

/**
 * Displays information about a player.
 * @param client - The client
 * @param tag - The tag of the player
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const playerInfo: APIMethod<string> = async (
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

	const player = await client.players.fetch(tag).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(player instanceof Player)) return player;
	const deck = player.deck.map((card) =>
		translate("commands.player.info.fields.deck.cardDescription", {
			lng,
			card,
		})
	);
	const embed: APIEmbed = {
		title: translate("commands.player.info.title", { lng, player }),
		color: Colors.Blue,
		footer: { text: translate("common.lastUpdated", { lng }) },
		timestamp: player.lastUpdate.toISOString(),
		url: Constants.playerLink(tag),
		fields: [
			{
				...translate("commands.player.info.fields.level", {
					lng,
					player,
				}),
				inline: true,
			},
			{
				...translate("commands.player.info.fields.trophies", {
					lng,
					trophies: player.trophies,
				}),
				inline: true,
			},
			{
				...translate("commands.player.info.fields.starPoints", {
					lng,
					starPoints: player.starPoints,
				}),
				inline: true,
			},
			{
				...translate("commands.player.info.fields.clan", {
					lng,
					clan: player.clan,
					clanLink: player.clan && Constants.clanLink(tag),
					role: player.role,
					context: typeof player.clan,
				}),
			},
			{
				...translate("commands.player.info.fields.deck", {
					lng,
				}),
				value: deck.length
					? `${deck.slice(0, 4).join(", ")}\n${deck.slice(4).join(", ")}${
							deck.length === 8
								? ` - [${translate("commands.player.info.fields.deck.copy", {
										lng,
								  })}](https://link.clashroyale.com/deck/it?deck=${player.deck
										.map((card) => card.id)
										.join(";")}&id=${player.id.slice(1)}) ${
										CustomEmojis.CopyDeck
								  }`
								: ""
					  }`
					: translate("commands.player.info.fields.deck.empty", { lng }),
			},
		],
	};

	if (player.leagueStatistics)
		embed.fields!.push(
			{
				...translate(
					"commands.player.info.fields.leagueStatistics.currentSeason",
					{
						lng,
						bestTrophies: player.leagueStatistics.currentSeason.bestTrophies,
					}
				),
				inline: true,
			},
			{
				...translate(
					"commands.player.info.fields.leagueStatistics.previousSeason",
					{
						lng,
						bestTrophies: player.leagueStatistics.previousSeason.bestTrophies,
					}
				),
				inline: true,
			},
			{
				...translate(
					"commands.player.info.fields.leagueStatistics.bestSeason",
					{
						lng,
						trophies: player.leagueStatistics.bestSeason.trophies,
					}
				),
				inline: true,
			}
		);
	embed.fields!.push(
		{
			...translate("commands.player.info.fields.wins", {
				lng,
				wins: player.wins,
				winRatio: player.winPercentage.toFixed(Constants.percentageDigits),
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.threeCrownWins", {
				lng,
				threeCrownWins: player.threeCrownWins,
				threeCrownWinRatio: player.threeCrownWinPercentage.toFixed(
					Constants.percentageDigits
				),
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.losses", {
				lng,
				losses: player.losses,
				lossesPercent: player.lossPercentage.toFixed(
					Constants.percentageDigits
				),
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.battleCount", {
				lng,
				battleCount: player.battleCount,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.bestTrophies", {
				lng,
				bestTrophies: player.bestTrophies,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.cardCount", {
				lng,
				cardCount: player.cards.size,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.weeklyDonations", {
				lng,
				weeklyDonations: player.donationsPerWeek,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.weeklyDonationsReceived", {
				lng,
				weeklyDonationsReceived: player.donationsReceivedPerWeek,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.totalDonations", {
				lng,
				totalDonations: player.totalDonations,
			}),
			inline: true,
		}
	);
	if (player.favouriteCard !== undefined)
		embed.fields!.push({
			...translate("commands.player.info.fields.currentFavouriteCard", {
				lng,
				favouriteCard: player.favouriteCard,
			}),
			inline: true,
		});
	embed.fields!.push(
		{
			...translate("commands.player.info.fields.clanWarsVeteran", {
				lng,
				player,
			}),
		},
		{
			...translate("commands.player.info.fields.challengeStatistics", {
				lng,
				player,
			}),
			inline: true,
		},
		{
			...translate("commands.player.info.fields.tournamentStatistics", {
				lng,
				player,
			}),
			inline: true,
		}
	);

	return {
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						Actions.PlayerAchievements,
						{
							label: translate("commands.player.buttons.achievements.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						Actions.PlayerUpcomingChests,
						{
							label: translate("commands.player.buttons.upcomingChests.label", {
								lng,
							}),
						},
						tag
					),
					createActionButton(
						Actions.ClanInfo,
						{
							label: translate("commands.clan.buttons.clanInfo.label", { lng }),
							disabled: player.clan === undefined,
						},
						player.clan?.tag ?? "#"
					),
				],
			},
		],
		ephemeral,
	};
};
