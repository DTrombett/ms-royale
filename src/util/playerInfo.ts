import { bold, Embed, hyperlink } from "@discordjs/builders";
import type ClientRoyale from "apiroyale";
import { ClanMemberRole } from "apiroyale";
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
import Constants, { ButtonActions, time } from "./Constants";
import { buildCustomButtonId } from "./customId";
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
		.catch((error: Error) => {
			console.error(error);
			return interaction.reply({ content: error.message, ephemeral: true });
		})
		.catch(console.error);

	if (!player) return undefined;
	const deck = player.deck.map(
		(card) => `${bold(card.name)} (Liv. ${bold(card.displayLevel.toString())})`
	);
	const embed = new Embed()
		.setTitle(`${player.name} (${player.tag})`)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter({ text: "Ultimo aggiornamento" })
		.setTimestamp(player.lastUpdate)
		.setURL(`https://royaleapi.com/player/${player.tag.slice(1)}`)
		.addField({
			name: "Livello",
			value: `${CustomEmojis.kingLevel} ${bold(
				player.kingLevel.toString()
			)} (${bold(player.expPoints.toString())} exp)`,
			inline: true,
		})
		.addField({
			name: "Trofei",
			value: `${Emojis.Trophy} ${player.trophies}`,
			inline: true,
		})
		.addField({
			name: "Punti stella",
			value: `${Emojis.Star} ${player.starPoints}`,
			inline: true,
		})
		.addField({
			name: "Clan",
			value: `${CustomEmojis.clanInvite} ${
				player.clan
					? `${hyperlink(
							player.clan.name,
							`https://royaleapi.com/clan/${player.clan.tag.slice(1)}`
					  )} (${player.clan.tag}) - ${ClanMemberRole[player.role]}`
					: "Nessuno"
			}`,
		})
		.addField({
			name: "Mazzo battaglia",
			value: `${deck.slice(0, 4).join(", ")}\n${deck
				.slice(4)
				.join(", ")} - ${hyperlink(
				"Copia",
				`https://link.clashroyale.com/deck/it?deck=${player.deck
					.map((card) => card.id)
					.join(";")}&id=${player.id.slice(1)}`
			)} ${CustomEmojis.copyDeck}`,
		});
	if (player.leagueStatistics)
		embed
			.addField({
				name: "Trofei massimi in questa stagione",
				value: `${Emojis.Trophy} ${player.leagueStatistics.currentSeason.bestTrophies}`,
				inline: true,
			})
			.addField({
				name: "Stagione precedente",
				value: `${Emojis.Trophy} ${player.leagueStatistics.previousSeason.bestTrophies}`,
				inline: true,
			})
			.addField({
				name: "Stagione migliore",
				value: `${Emojis.Trophy} ${player.leagueStatistics.bestSeason.trophies}`,
				inline: true,
			});
	embed
		.addField({
			name: "Emblemi",
			value: `${player.badges
				.map(
					(badge) =>
						`${bold(badge.name)}${
							badge.isMultipleLevels()
								? ` (Liv. ${badge.level}/${badge.levels})`
								: ""
						}`
				)
				.join(", ")}`,
		})
		.addField({
			name: "Vittorie",
			value: `${CustomEmojis.win} ${
				player.wins
			} (${player.winPercentage.toFixed(1)}%)`,
			inline: true,
		})
		.addField({
			name: "Vittorie con tre corone",
			value: `${CustomEmojis.win}${CustomEmojis.win}${CustomEmojis.win} ${
				player.threeCrownWins
			} (${player.threeCrownWinPercentage.toFixed(1)}%)`,
			inline: true,
		})
		.addField({
			name: "Sconfitte",
			value: `${CustomEmojis.lose} ${
				player.losses
			} (${player.lossPercentage.toFixed(1)}%)`,
			inline: true,
		})
		.addField({
			name: "Totale partite",
			value: `${player.battleCount}`,
			inline: true,
		})
		.addField({
			name: "Record di trofei",
			value: `${Emojis.Trophy} ${player.bestTrophies}`,
			inline: true,
		})
		.addField({
			name: "Carte trovate",
			value: `${CustomEmojis.cards} ${player.cards.size}`,
			inline: true,
		})
		.addField({
			name: "Donazioni in questa settimana",
			value: `${CustomEmojis.donations} ${player.donationsPerWeek}`,
			inline: true,
		})
		.addField({
			name: "Donazioni ricevute questa settimana",
			value: `${CustomEmojis.donations} ${player.donationsReceivedPerWeek}`,
			inline: true,
		})
		.addField({
			name: "Totale donazioni",
			value: `${CustomEmojis.donations} ${player.totalDonations}`,
			inline: true,
		})
		.addField({
			name: "Carta preferita attuale",
			value: `${player.favouriteCard.name} (Liv. ${player.favouriteCard.displayLevel})`,
			inline: true,
		})
		.addField({
			name: "Veterano delle guerre tra clan",
			value: `${bold("Vittorie giorno della guerra")}: ${
				player.oldWarDayWins
			} - ${bold("Carte del clan ottenute")}: ${player.oldClanCardsCollected}`,
		})
		.addField({
			name: "Statistiche sfida",
			value: `${bold("Record vittorie")}: ${player.maxWinsInChallenge}\n${bold(
				"Carte vinte"
			)}: ${player.cardsWonInChallenges}`,
			inline: true,
		})
		.addField({
			name: "Statistiche del torneo",
			value: `${bold("Tornei giocati")}: ${
				player.tournamentBattleCount
			}\n${bold("Vittorie nel torneo")}: ${player.tournamentCardsWon}`,
			inline: true,
		})
		.addField({
			name: "Obiettivi",
			value: `${player.achievements
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
				.join("\n")}`,
		});

	const row1 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				player.clan
					? buildCustomButtonId(ButtonActions.ClanInfo, player.clan.tag)
					: ""
			)
			.setDisabled(player.clan === undefined)
			.setEmoji(Emojis.CrossedSwords)
			.setLabel("Info clan")
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
