import { Embed, hyperlink } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { Player } from "apiroyale";
import { Constants as DiscordConstants, MessageActionRow } from "discord.js";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import normalizeTag from "../normalizeTag";
import translate from "../translate";
import { ButtonActions, CustomEmojis } from "../types";
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
	const deck = player.deck.map((card) =>
		translate("commands.player.info.fields.deck.cardDescription", {
			lng,
			card,
		})
	);
	const embed = new Embed()
		.setTitle(translate("commands.player.info.title", { lng, player }))
		.setColor(DiscordConstants.Colors.BLUE)
		.setFooter({ text: translate("common.lastUpdated", { lng }) })
		.setTimestamp(player.lastUpdate)
		.setURL(Constants.playerLink(tag))
		.addField({
			...translate("commands.player.info.fields.level", {
				lng,

				player,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.trophies", {
				lng,

				trophies: player.trophies,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.starPoints", {
				lng,

				starPoints: player.starPoints,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.clan", {
				lng,

				clan: player.clan,
				clanLink: player.clan && Constants.clanLink(tag),
				role: player.role,
				context: typeof player.clan,
			}),
		})
		.addField({
			...translate("commands.player.info.fields.deck", {
				lng,
			}),
			value: `${deck.slice(0, 4).join(", ")}\n${deck
				.slice(4)
				.join(", ")} - ${hyperlink(
				translate("commands.player.info.fields.deck.copy", { lng }),
				`https://link.clashroyale.com/deck/it?deck=${player.deck
					.map((card) => card.id)
					.join(";")}&id=${player.id.slice(1)}`
			)} ${CustomEmojis.copyDeck}`,
		});
	if (player.leagueStatistics)
		embed
			.addField({
				...translate(
					"commands.player.info.fields.leagueStatistics.currentSeason",
					{
						lng,

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

						trophies: player.leagueStatistics.bestSeason.trophies,
					}
				),
				inline: true,
			});
	embed
		.addField({
			...translate("commands.player.info.fields.badges", {
				lng,
			}),
			value: Constants.playerInfoBadgesFieldValue(player.badges),
		})
		.addField({
			...translate("commands.player.info.fields.wins", {
				lng,

				wins: player.wins,
				winRatio: player.winPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.threeCrownWins", {
				lng,

				threeCrownWins: player.threeCrownWins,
				threeCrownWinRatio: player.threeCrownWinPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.losses", {
				lng,

				losses: player.losses,
				lossesPercent: player.lossPercentage.toFixed(digits),
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.battleCount", {
				lng,

				battleCount: player.battleCount,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.bestTrophies", {
				lng,

				bestTrophies: player.bestTrophies,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.cardCount", {
				lng,

				cardCount: player.cards.size,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.weeklyDonations", {
				lng,

				weeklyDonations: player.donationsPerWeek,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.weeklyDonationsReceived", {
				lng,

				weeklyDonationsReceived: player.donationsReceivedPerWeek,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.totalDonations", {
				lng,

				totalDonations: player.totalDonations,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.currentFavouriteCard", {
				lng,

				favouriteCard: player.favouriteCard,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.clanWarsVeteran", {
				lng,

				player,
			}),
		})
		.addField({
			...translate("commands.player.info.fields.challengeStatistics", {
				lng,

				player,
			}),
			inline: true,
		})
		.addField({
			...translate("commands.player.info.fields.tournamentStatistics", {
				lng,

				player,
			}),
			inline: true,
		});

	const row1 = new MessageActionRow().addComponents(
		createActionButton(
			ButtonActions.PlayerAchievements,
			{
				label: translate("commands.player.buttons.achievements.label", { lng }),
			},
			tag
		),
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
