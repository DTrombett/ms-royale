import { bold, hyperlink } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { ClanMemberRole } from "apiroyale";
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction,
} from "discord.js";
import { Constants as DiscordCostants, MessageEmbed } from "discord.js";
import Constants, { time } from "./Constants";
import normalizeTag from "./normalizeTag";
import { CustomEmojis, Emojis } from "./types";
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
			maxAge: time.millisecondsPerMinute * 5,
		})
		.catch((error: Error) => interaction.reply(error.message))
		.catch(console.error);

	if (!player) return undefined;
	const deck = player.deck.map(
		(card) => `${bold(card.name)} (Liv. ${bold(card.displayLevel.toString())})`
	);
	const embed = new MessageEmbed()
		.setTitle(player.name)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter("Ultimo aggiornamento")
		.setTimestamp(player.lastUpdate)
		.setURL(`https://royaleapi.com/player/${player.tag.slice(1)}`)
		.addField("Tag del giocatore", player.tag)
		.addField(
			"Livello",
			`${CustomEmojis.kingLevel} ${bold(player.kingLevel.toString())} (${bold(
				player.expPoints.toString()
			)} exp)`,
			true
		)
		.addField("Trofei", `${Emojis.Trophy} ${player.trophies}`, true)
		.addField("Punti stella", `${Emojis.Star} ${player.starPoints}`, true)
		.addField(
			"Clan",
			`${CustomEmojis.clanInvite} ${
				player.clan
					? `${hyperlink(
							player.clan.name,
							`https://royaleapi.com/clan/${player.clan.tag.slice(1)}`
					  )} (${player.clan.tag}) - ${ClanMemberRole[player.role]}`
					: "Nessuno"
			}`
		)
		.addField(
			"Mazzo battaglia",
			`${deck.slice(0, 4).join(", ")}\n${deck
				.slice(4)
				.join(", ")} - ${hyperlink(
				"Copia",
				`https://link.clashroyale.com/deck/it?deck=${player.deck
					.map((card) => card.id)
					.join(";")}&id=${player.id.slice(1)}`
			)} ${CustomEmojis.copyDeck}`
		);
	if (player.leagueStatistics)
		embed
			.addField(
				"Trofei massimi in questa stagione",
				`${Emojis.Trophy} ${player.leagueStatistics.currentSeason.bestTrophies}`,
				true
			)
			.addField(
				"Stagione precedente",
				`${Emojis.Trophy} ${player.leagueStatistics.previousSeason.bestTrophies}`,
				true
			)
			.addField(
				"Stagione migliore",
				`${Emojis.Trophy} ${player.leagueStatistics.bestSeason.trophies}`,
				true
			);
	embed
		.addField(
			"Emblemi",
			`${player.badges
				.map(
					(badge) =>
						`• ${bold(badge.name)}: ${
							badge.isMultipleLevels()
								? `${badge.progress}/${
										badge.target
								  } (${badge.percentage!.toFixed(1)}%) (Liv. ${badge.level}/${
										badge.levels
								  })`
								: badge.progress
						}`
				)
				.join("\n")}`
		)
		.addField(
			"Vittorie",
			`${CustomEmojis.win} ${player.wins} (${player.winPercentage.toFixed(
				1
			)}%)`,
			true
		)
		.addField(
			"Vittorie con tre corone",
			`${CustomEmojis.win}${CustomEmojis.win}${CustomEmojis.win} ${
				player.threeCrownWins
			} (${player.threeCrownWinPercentage.toFixed(1)}%)`,
			true
		)
		.addField(
			"Sconfitte",
			`${CustomEmojis.lose} ${player.losses} (${player.lossPercentage.toFixed(
				1
			)}%)`,
			true
		)
		.addField(
			"Pareggi",
			`${player.draws} (${player.drawPercentage.toFixed(1)}%)`,
			true
		)
		.addField("Totale partite", `${player.battleCount}`, true)
		.addField(
			"Record di trofei",
			`${Emojis.Trophy} ${player.bestTrophies}`,
			true
		)
		.addField(
			"Carte trovate",
			`${CustomEmojis.cards} ${player.cards.size}`,
			true
		)
		.addField(
			"Donazioni in questa settimana",
			`${CustomEmojis.donations} ${player.donationsPerWeek}`,
			true
		)
		.addField(
			"Donazioni ricevute questa settimana",
			`${CustomEmojis.donations} ${player.donationsReceivedPerWeek}`,
			true
		)
		.addField(
			"Totale donazioni",
			`${CustomEmojis.donations} ${player.totalDonations}`,
			true
		)
		.addField(
			"Carta preferita attuale",
			`${player.favouriteCard.name} (Liv. ${player.favouriteCard.displayLevel})`,
			true
		)
		.addField(
			"Veterano delle guerre tra clan",
			`${bold("Vittorie giorno della guerra")}: ${
				player.oldWarDayWins
			} - ${bold("Carte del clan ottenute")}: ${player.oldClanCardsCollected}`
		)
		.addField(
			"Statistiche sfida",
			`${bold("Record vittorie")}: ${player.maxWinsInChallenge}\n${bold(
				"Carte vinte"
			)}: ${player.cardsWonInChallenges}`,
			true
		)
		.addField(
			"Statistiche del torneo",
			`${bold("Tornei giocati")}: ${player.tournamentBattleCount}\n${bold(
				"Vittorie nel torneo"
			)}: ${player.tournamentCardsWon}`,
			true
		)
		.addField(
			"Obiettivi",
			`${player.achievements
				.map(
					(achievement) =>
						`• ${bold(achievement.name)}: ${achievement.info}${
							achievement.level
								? ` ${Emojis.Star.repeat(achievement.level)}`
								: ""
						} - ${achievement.progress}/${achievement.target}${
							achievement.completed
								? ""
								: ` (${achievement.percentage.toFixed(1)}%)`
						}`
				)
				.join("\n")}`
		);

	return interaction
		.reply({
			embeds: [embed],
			ephemeral,
		})
		.catch(console.error);
};
