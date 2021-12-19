import { bold, hyperlink, time, TimestampStyles } from "@discordjs/builders";
import Collection from "@discordjs/collection";
import type {
	APILeagueStatistics,
	APITag,
	Clan,
	ClanMember,
	ClanPreview,
	ClanResultPreview,
	FinishedRiverRace,
	Location,
	Player,
	PlayerBadge,
	PlayerBadgeManager,
	PlayerCard,
	RiverRaceParticipant,
	RiverRaceWeekStanding,
} from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import { OAuth2Scopes } from "discord-api-types/v9";
import type { Snowflake } from "discord.js";
import { Util } from "discord.js";
import capitalize from "./capitalize";
import { CustomEmojis, Emojis } from "./types";

/**
 * Constants about time
 */
export const TIME = {
	/**
	 * The number of milliseconds in a day
	 */
	millisecondsPerDay: 86400000,

	/**
	 * The number of milliseconds in an hour
	 */
	millisecondsPerHour: 3600000,

	/**
	 * The number of milliseconds in a minute
	 */
	millisecondsPerMinute: 60000,

	/**
	 * The number of milliseconds in a second
	 */
	millisecondsPerSecond: 1000,

	/**
	 * The number of seconds in a minute
	 */
	secondsPerMinute: 60,

	/**
	 * The number of seconds in a millisecond
	 */
	secondsPerMillisecond: 1 / 1000,

	/**
	 * The number of minutes in an hour
	 */
	minutesPerHour: 60,

	/**
	 * The number of minutes in a second
	 */
	minutesPerSecond: 1 / 60,

	/**
	 * The number of minutes in a millisecond
	 */
	minutesPerMillisecond: 1 / 60000,

	/**
	 * The number of hours in a day
	 */
	hoursPerDay: 24,

	/**
	 * The number of hours in a second
	 */
	hoursPerSecond: 1 / 24,

	/**
	 * The number of hours in a millisecond
	 */
	hoursPerMillisecond: 1 / 3600000,

	/**
	 * The number of days in a week
	 */
	daysPerWeek: 7,

	/**
	 * The number of days in a month
	 */
	daysPerMonth: 30,

	/**
	 * The number of days in a year
	 */
	daysPerYear: 365,

	/**
	 * The number of days in a decade
	 */
	daysPerDecade: 365 * 10,

	/**
	 * The number of days in a century
	 */
	daysPerCentury: 365 * 100,
} as const;

export const Constants = {
	/**
	 * The label used for the online event of the client.
	 */
	clientOnlineLabel: () => "Client online" as const,

	/**
	 * The tag of the main clan.
	 */
	mainClanTag: () => "#L2Y2L2PC" as const,

	/**
	 * The embed title shown when the clan is updated.
	 */
	clanUpdatedEmbedTitle: () => "Clan aggiornato!" as const,

	/**
	 * The link of RoyaleAPI for a clan.
	 * @param clanTag - The tag of the clan
	 */
	clanLink: (clanTag: APITag) =>
		`https://royaleapi.com/clan/${clanTag.slice(1)}` as const,

	/**
	 * The embed field name shown when the clan name is updated.
	 */
	clanNameUpdatedFieldName: () => "Nome" as const,

	/**
	 * The embed field value shown when the clan name is updated.
	 * @param oldClanName - The old clan name
	 * @param newClanName - The new clan name
	 */
	clanNameUpdatedFieldValue: (
		oldClanName: Clan["name"],
		newClanName: Clan["name"]
	) =>
		`${bold(Util.escapeMarkdown(oldClanName))} => ${bold(
			Util.escapeMarkdown(newClanName)
		)}` as const,

	/**
	 * The embed field name shown when the clan description is updated.
	 */
	clanDescriptionUpdatedFieldName: () => "Descrizione" as const,

	/**
	 * The embed field value shown when the clan description is updated.
	 * @param oldClanDescription - The old clan description
	 * @param newClanDescription - The new clan description
	 */
	clanDescriptionUpdatedFieldValue: (
		oldClanDescription: string,
		newClanDescription: string
	) =>
		`${bold("Prima")}: ${Util.escapeMarkdown(oldClanDescription)}\n${bold(
			"Dopo"
		)}: ${Util.escapeMarkdown(newClanDescription)}` as const,

	/**
	 * The embed field name shown when the clan badge id is updated.
	 */
	clanBadgeIdUpdatedFieldName: () => "Badge" as const,

	/**
	 * The embed field value shown when the clan badge id is updated.
	 * @param oldClanBadgeId - The old clan badge id
	 * @param newClanBadgeId - The new clan badge id
	 */
	clanBadgeIdUpdatedFieldValue: (
		oldClanBadgeId: number,
		newClanBadgeId: number
	) =>
		`${bold(Util.escapeMarkdown(oldClanBadgeId.toString()))} => ${bold(
			Util.escapeMarkdown(newClanBadgeId.toString())
		)}` as const,

	/**
	 * The embed field name shown when the clan location is updated.
	 */
	clanLocationUpdatedFieldName: () => "Posizione" as const,

	/**
	 * The embed field value shown when the clan location is updated.
	 * @param oldClanLocation - The old clan location
	 * @param newClanLocation - The new clan location
	 */
	clanLocationUpdatedFieldValue: (
		oldClanLocation: string,
		newClanLocation: string
	) =>
		`${bold(Util.escapeMarkdown(oldClanLocation))} => ${bold(
			Util.escapeMarkdown(newClanLocation)
		)}` as const,

	/**
	 * The embed field name shown when the clan required trophies are updated.
	 */
	clanRequiredTrophiesUpdatedFieldName: () => "Trofei richiesti" as const,

	/**
	 * The embed field value shown when the clan required trophies are updated.
	 * @param oldClanRequiredTrophies - The old clan required trophies
	 * @param newClanRequiredTrophies - The new clan required trophies
	 */
	clanRequiredTrophiesUpdatedFieldValue: (
		oldClanRequiredTrophies: number,
		newClanRequiredTrophies: number
	) =>
		`🏆 ${oldClanRequiredTrophies} => 🏆 ${newClanRequiredTrophies}` as const,

	/**
	 * The embed field name shown when the clan type is updated.
	 */
	clanTypeUpdatedFieldName: () => "Tipo" as const,

	/**
	 * The embed field value shown when the clan type is updated.
	 * @param oldClanType - The old clan type
	 * @param newClanType - The new clan type
	 */
	clanTypeUpdatedFieldValue: (oldClanType: ClanType, newClanType: ClanType) =>
		`${ClanType[oldClanType]} => ${ClanType[newClanType]}` as const,

	/**
	 * The embed field name shown when a clan member left.
	 */
	clanMemberLeftFieldName: () => `Un membro è uscito` as const,

	/**
	 * The embed field value shown when a clan member left.
	 * @param member - The member that left
	 */
	clanMemberLeftFieldValue: (member: ClanMember) =>
		`#${member.rank} ${bold(Util.escapeMarkdown(member.name))} (${
			member.tag
		}) - 🏆 ${member.trophies}` as const,

	/**
	 * The embed field name shown when a clan member joined.
	 */
	clanMemberJoinedFieldName: () => `Un membro è entrato` as const,

	/**
	 * The embed field value shown when a clan member joined.
	 * @param member - The member that joined
	 */
	clanMemberJoinedFieldValue: (member: ClanMember) =>
		`#${member.rank} ${bold(Util.escapeMarkdown(member.name))} (${
			member.tag
		}) - 🏆 ${member.trophies}` as const,

	/**
	 * Number of milliseconds before fetching the main clan again.
	 */
	mainClanFetchInterval: () => TIME.millisecondsPerMinute * 2,

	/**
	 * The name of the folder with commands.
	 */
	commandsFolderName: () => "commands" as const,

	/**
	 * The name of the folder with events.
	 */
	eventsFolderName: () => "events" as const,

	/**
	 * A zero-width space.
	 */
	zeroWidthSpace: () => "\u200b" as const,

	/**
	 * No clan was found.
	 */
	noClanFound: () =>
		"Non ho trovato nessun clan con queste caratteristiche!" as const,

	/**
	 * Description with information about a clan.
	 * @param clan - The clan
	 */
	clanInfo: (clan: ClanResultPreview) =>
		`${Emojis.People}${clan.memberCount}/50 - ${Emojis.Score}${clan.score} - ${Emojis.MoneyWithWings}${clan.donationsPerWeek} - ${Emojis.Trophy}${clan.requiredTrophies} - ${Emojis.Location}${clan.location.name}` as const,

	/**
	 * The placeholder for the clan info menu.
	 */
	clanInfoPlaceholder: () => "Scegli un clan..." as const,

	/**
	 * The label for the back button.
	 */
	backButtonLabel: () => "Precedente" as const,

	/**
	 * The label for the after button.
	 */
	afterButtonLabel: () => "Successivo" as const,

	/**
	 * The content of the message with the clan search results.
	 */
	clanSearchResultsContent: (
		user: Snowflake,
		name?: string,
		locationId?: number | `${number}`,
		minMembers?: number,
		maxMembers?: number,
		minScore?: number
	) =>
		`Risultati per la seguente ricerca richiesta da <@${user}>:\n\n${bold(
			"Nome"
		)}: ${name != null ? Util.escapeMarkdown(name) : "-"}\n${bold(
			"Id posizione"
		)}: ${locationId ?? "-"}\n${bold("Minimo membri")}: ${
			minMembers ?? "-"
		}\n${bold("Massimo membri")}: ${maxMembers ?? "-"}\n${bold(
			"Punteggio minimo"
		)}: ${minScore ?? "-"}` as const,

	/**
	 * Invalid tag provided.
	 */
	invalidTag: () =>
		"Hai inserito un tag non valido!\nI caratteri validi nei tag sono: 0, 2, 8, 9, P, Y, L, Q, G, R, J, C, U, V" as const,

	/**
	 * Bot owners.
	 */
	owners: () => ["597505862449496065", "584465680506814465"],

	/**
	 * The displayed name of an autocomplete clan option.
	 * @param clan - The clan
	 */
	autocompleteClanOptionName: (clan: ClanPreview) =>
		`${clan.name} (${clan.tag})` as const,

	/**
	 * The displayed name of an autocomplete player option.
	 * @param player - The player
	 */
	autocompletePlayerOptionName: (player: Player) =>
		`${player.name} (${player.tag})` as const,

	/**
	 * The message to display when a subcommand is not recognized.
	 */
	subCommandNotRecognized: () => "Comando non riconosciuto!" as const,

	/**
	 * The message to log when a command is not recognized.
	 * @param command - The command
	 */
	optionNotRecognizedLog: (command: string) =>
		`Option not recognized: ${command}` as const,

	/**
	 * The title of the clan info embed.
	 * @param clan - The clan
	 */
	clanInfoEmbedTitle: (clan: ClanPreview) =>
		`${clan.name} (${clan.tag})` as const,

	/**
	 * The footer of the clan info embed.
	 */
	clanInfoFooter: () => "Ultimo aggiornamento" as const,

	/**
	 * The url of the clan info embed.
	 * @param clan - The clan
	 */
	clanInfoUrl: (clan: ClanPreview) =>
		`https://royaleapi.com/clan/${clan.tag.slice(1)}` as const,

	/**
	 * The clan info embed field name for war trophies.
	 */
	clanInfoWarTrophiesFieldName: () => "Trofei guerra tra clan" as const,

	/**
	 * The clan info embed field value for war trophies.
	 * @param warTrophies - The war trophies
	 */
	clanInfoWarTrophiesFieldValue: (warTrophies: number) =>
		`${CustomEmojis.warTrophy} ${warTrophies}` as const,

	/**
	 * The clan info embed field name for the location.
	 */
	clanInfoLocationFieldName: () => "Posizione" as const,

	/**
	 * The clan info embed field value for the location.
	 * @param location - The location
	 */
	clanInfoLocationFieldValue: (location: Location) =>
		`${Emojis.Location} ${location.name}` as const,

	/**
	 * The clan info embed field name for the clan's required trophies.
	 */
	clanInfoRequiredTrophiesFieldName: () => "Trofei richiesti" as const,

	/**
	 * The clan info embed field value for the clan's required trophies.
	 * @param requiredTrophies - The clan's required trophies
	 */
	clanInfoRequiredTrophiesFieldValue: (requiredTrophies: number) =>
		`${Emojis.Trophy} ${requiredTrophies}` as const,

	/**
	 * The clan info embed field name for the clan's donations per week.
	 */
	clanInfoDonationsPerWeekFieldName: () => "Donazioni settimanali" as const,

	/**
	 * The clan info embed field value for the clan's donations per week.
	 * @param donationsPerWeek - The clan's donations per week
	 */
	clanInfoDonationsPerWeekFieldValue: (donationsPerWeek: number) =>
		`${CustomEmojis.donations} ${donationsPerWeek}` as const,

	/**
	 * The clan info embed field name for the clan's score.
	 */
	clanInfoScoreFieldName: () => "Punteggio" as const,

	/**
	 * The clan info embed field value for the clan's score.
	 * @param score - The clan's score
	 */
	clanInfoScoreFieldValue: (score: number) =>
		`${Emojis.Score} ${score}` as const,

	/**
	 * The clan info embed field name for the clan's type.
	 */
	clanInfoTypeFieldName: () => "Tipo" as const,

	/**
	 * The clan info embed field value for the clan's type.
	 * @param type - The clan's type
	 */
	clanInfoTypeFieldValue: (type: ClanType) =>
		`${capitalize(ClanType[type])}` as const,

	/**
	 * The clan info embed field name for the clan's member count.
	 */
	clanInfoMemberCountFieldName: () => "Membri" as const,

	/**
	 * The clan info embed field value for the clan's member count.
	 * @param memberCount - The clan's member count
	 */
	clanInfoMemberCountFieldValue: (memberCount: number) =>
		`${CustomEmojis.clanMembers} ${memberCount}/50` as const,

	/**
	 * Description with information about a clan member.
	 * @param member - The clan member
	 */
	clanMemberDescription: (member: ClanMember) =>
		`${capitalize(ClanMemberRole[member.role])} - ${Emojis.MoneyWithWings}${
			member.donationsPerWeek
		} - ${Emojis.Trophy}${member.trophies}` as const,

	/**
	 * Label with information about a clan member.
	 * @param member - The clan member
	 */
	clanMemberLabel: (member: ClanMember) =>
		`#${member.rank} ${member.name} (${member.tag})` as const,

	/**
	 * Placeholder for the clan members list.
	 */
	clanMembersPlaceholder: () => "Membri del clan" as const,

	/**
	 * Label for the clan river race log button.
	 */
	riverRaceLogLabel: () => "Guerre passate" as const,

	/**
	 * The embed title of a player info embed.
	 * @param player - The player
	 */
	playerInfoTitle: (player: Player) =>
		`${player.name} (${player.tag})` as const,

	/**
	 * The embed footer of a player info embed.
	 */
	playerInfoFooter: () => "Ultimo aggiornamento" as const,

	/**
	 * The url for player info.
	 */
	playerInfoUrl: (player: Player) =>
		`https://royaleapi.com/player/${player.tag.slice(1)}` as const,

	/**
	 * The embed field name for the player's level.
	 */
	playerInfoLevelFieldName: () => "Livello" as const,

	/**
	 * The embed field value for the player's level.
	 * @param player - The player
	 */
	playerInfoLevelFieldValue: (player: Player) =>
		`${CustomEmojis.kingLevel} ${bold(player.kingLevel.toString())} (${bold(
			player.expPoints.toString()
		)} exp)` as const,

	/**
	 * The embed field name for the player's trophies.
	 */
	playerInfoTrophiesFieldName: () => "Trofei" as const,

	/**
	 * The embed field value for the player's trophies.
	 * @param trophies - The player's trophies
	 */
	playerInfoTrophiesFieldValue: (trophies: number) =>
		`${Emojis.Trophy} ${trophies}` as const,

	/**
	 * The embed field name for the player's star points.
	 */
	playerInfoStarPointsFieldName: () => "Punti stella" as const,

	/**
	 * The embed field value for the player's star points.
	 * @param starPoints - The player's star points
	 */
	playerInfoStarPointsFieldValue: (starPoints: number) =>
		`${Emojis.Star} ${starPoints}` as const,

	/**
	 * The embed field name for the player's clan.
	 */
	playerInfoClanFieldName: () => "Clan" as const,

	/**
	 * The embed field value for the player's clan.
	 * @param player - The player
	 */
	playerInfoClanFieldValue: (player: Player) =>
		`${CustomEmojis.clanInvite} ${
			player.clan
				? `${hyperlink(
						player.clan.name,
						`https://royaleapi.com/clan/${player.clan.tag.slice(1)}`
				  )} (${player.clan.tag}) - ${ClanMemberRole[player.role]}`
				: "Nessuno"
		}` as const,

	/**
	 * The description of a player card.
	 * @param card - The card
	 */
	playerCardDescription: (card: PlayerCard) =>
		`${bold(card.name)} (Liv. ${bold(card.displayLevel.toString())})` as const,

	/**
	 * The embed field name for the player's current deck.
	 */
	playerInfoCurrentDeckFieldName: () => "Mazzo battaglia" as const,

	/**
	 * The embed field value for the player's current deck.
	 * @param player - The player
	 */
	playerInfoCurrentDeckFieldValue: (player: Player) => {
		const deck = player.deck.map(Constants.playerCardDescription);

		return `${deck.slice(0, 4).join(", ")}\n${deck
			.slice(4)
			.join(", ")} - ${hyperlink(
			"Copia",
			`https://link.clashroyale.com/deck/it?deck=${player.deck
				.map((card) => card.id)
				.join(";")}&id=${player.id.slice(1)}`
		)} ${CustomEmojis.copyDeck}` as const;
	},

	/**
	 * The embed field name for the player's best trophies in the current season.
	 */
	playerInfoCurrentBestTrophiesFieldName: () =>
		"Trofei massimi in questa stagione" as const,

	/**
	 * The embed field value for the player's best trophies in the current season.
	 * @param leagueStatistics - The player's league statistics
	 */
	playerInfoCurrentBestTrophiesFieldValue: (
		leagueStatistics: APILeagueStatistics
	) =>
		`${Emojis.Trophy} ${leagueStatistics.currentSeason.bestTrophies}` as const,

	/**
	 * The embed field name for the player's best trophies in the previous season.
	 */
	playerInfoPreviousBestTrophiesFieldName: () => "Stagione precedente" as const,

	/**
	 * The embed field value for the player's best trophies in the previous season.
	 * @param leagueStatistics - The player's league statistics
	 */
	playerInfoPreviousBestTrophiesFieldValue: (
		leagueStatistics: APILeagueStatistics
	) =>
		`${Emojis.Trophy} ${leagueStatistics.previousSeason.bestTrophies}` as const,

	/**
	 * The embed field name for the player's best season.
	 */
	playerInfoBestSeasonFieldName: () => "Stagione migliore" as const,

	/**
	 * The embed field value for the player's best season.
	 * @param leagueStatistics - The player's league statistics
	 */
	playerInfoBestSeasonFieldValue: (leagueStatistics: APILeagueStatistics) =>
		`${Emojis.Trophy} ${leagueStatistics.bestSeason.trophies}` as const,

	/**
	 * The description of a player badge.
	 * @param badge - The badge
	 */
	playerBadgeDescription: (badge: PlayerBadge) =>
		`${bold(badge.name)}${
			badge.isMultipleLevels() ? ` (Liv. ${badge.level}/${badge.levels})` : ""
		}` as const,

	/**
	 * The embed field name for the player's badges.
	 */
	playerInfoBadgesFieldName: () => "Emblemi" as const,

	/**
	 * The embed field value for the player's badges.
	 * @param badges - The player's badges
	 */
	playerInfoBadgesFieldValue: (badges: PlayerBadgeManager) =>
		badges.map(Constants.playerBadgeDescription).join(", "),

	/**
	 * The embed field name for the player's wins.
	 */
	playerInfoWinsFieldName: () => "Vittorie" as const,

	/**
	 * The embed field value for the player's wins.
	 * @param player - The player
	 */
	playerInfoWinsFieldValue: (player: Player) =>
		`${CustomEmojis.win} ${player.wins} (${player.winPercentage.toFixed(
			1
		)}%)` as const,

	/**
	 * The embed field name for the player's three crown wins.
	 */
	playerInfoThreeCrownWinsFieldName: () => "Vittorie con tre corone" as const,

	/**
	 * The embed field value for the player's three crown wins.
	 * @param player - The player
	 */
	playerInfoThreeCrownWinsFieldValue: (player: Player) =>
		`${CustomEmojis.win}${CustomEmojis.win}${CustomEmojis.win} ${
			player.threeCrownWins
		} (${player.threeCrownWinPercentage.toFixed(1)}%)` as const,

	/**
	 * The embed field name for the player's losses.
	 */
	playerInfoLossesFieldName: () => "Sconfitte" as const,

	/**
	 * The embed field value for the player's losses.
	 * @param player - The player
	 */
	playerInfoLossesFieldValue: (player: Player) =>
		`${CustomEmojis.lose} ${player.losses} (${player.lossPercentage.toFixed(
			1
		)}%)` as const,

	/**
	 * The embed field name for the player's total matches.
	 */
	playerInfoTotalMatchesFieldName: () => "Totale partite" as const,

	/**
	 * The embed field value for the player's total matches.
	 * @param player - The player
	 */
	playerInfoTotalMatchesFieldValue: (player: Player) =>
		`${player.battleCount}` as const,

	/**
	 * The embed field name for the player's trophies record.
	 */
	playerInfoTrophiesRecordFieldName: () => "Record di trofei" as const,

	/**
	 * The embed field value for the player's trophies record.
	 * @param player - The player
	 */
	playerInfoTrophiesRecordFieldValue: (player: Player) =>
		`${Emojis.Trophy} ${player.bestTrophies}` as const,

	/**
	 * The embed field name for the player's card count.
	 */
	playerInfoCardCountFieldName: () => "Carte trovate" as const,

	/**
	 * The embed field value for the player's card count.
	 * @param player - The player
	 */
	playerInfoCardCountFieldValue: (player: Player) =>
		`${CustomEmojis.cards} ${player.cards.size}` as const,

	/**
	 * The embed field name for the player's week donations.
	 */
	playerInfoWeekDonationsFieldName: () =>
		"Donazioni in questa settimana" as const,

	/**
	 * The embed field value for the player's week donations.
	 * @param player - The player
	 */
	playerInfoWeekDonationsFieldValue: (player: Player) =>
		`${CustomEmojis.donations} ${player.donationsPerWeek}` as const,

	/**
	 * The embed field name for the player's week received donations.
	 */
	playerInfoWeekReceivedDonationsFieldName: () =>
		"Donazioni ricevute in questa settimana" as const,

	/**
	 * The embed field value for the player's week received donations.
	 * @param player - The player
	 */
	playerInfoWeekReceivedDonationsFieldValue: (player: Player) =>
		`${CustomEmojis.donations} ${player.donationsReceivedPerWeek}` as const,

	/**
	 * The embed field name for the player's total donations.
	 */
	playerInfoTotalDonationsFieldName: () => "Totale donazioni" as const,

	/**
	 * The embed field value for the player's total donations.
	 * @param player - The player
	 */
	playerInfoTotalDonationsFieldValue: (player: Player) =>
		`${CustomEmojis.donations} ${player.totalDonations}` as const,

	/**
	 * The embed field name for the player's favorite card.
	 */
	playerInfoFavoriteCardFieldName: () => "Carta preferita attuale" as const,

	/**
	 * The embed field value for the player's favorite card.
	 * @param player - The player
	 */
	playerInfoFavoriteCardFieldValue: (player: Player) =>
		`${player.favouriteCard.name} (Liv. ${player.favouriteCard.displayLevel})` as const,

	/**
	 * The embed field name for the player's old war stats.
	 */
	playerInfoOldWarStatsFieldName: () =>
		"Veterano delle guerre tra clan" as const,

	/**
	 * The embed field value for the player's old war stats.
	 * @param player - The player
	 */
	playerInfoOldWarStatsFieldValue: (player: Player) =>
		`${bold("Vittorie giorno della guerra")}: ${player.oldWarDayWins} - ${bold(
			"Carte del clan ottenute"
		)}: ${player.oldClanCardsCollected}` as const,

	/**
	 * The embed field name for the player's challenge stats.
	 */
	playerInfoChallengeStatsFieldName: () => "Statistiche sfida" as const,

	/**
	 * The embed field value for the player's challenge stats.
	 * @param player - The player
	 */
	playerInfoChallengeStatsFieldValue: (player: Player) =>
		`${bold("Record vittorie")}: ${player.maxWinsInChallenge}\n${bold(
			"Carte vinte"
		)}: ${player.cardsWonInChallenges}` as const,

	/**
	 * The embed field name for the player's tournament stats.
	 */
	playerInfoTournamentStatsFieldName: () => "Statistiche del torneo" as const,

	/**
	 * The embed field value for the player's tournament stats.
	 * @param player - The player
	 */
	playerInfoTournamentStatsFieldValue: (player: Player) =>
		`${bold("Tornei giocati")}: ${player.tournamentBattleCount}\n${bold(
			"Vittorie nel torneo"
		)}: ${player.tournamentCardsWon}` as const,

	/**
	 * The embed field name for the player's achievements.
	 */
	playerInfoAchievementsFieldName: () => "Obiettivi" as const,

	/**
	 * The embed field value for the player's achievements.
	 * @param player - The player
	 */
	playerInfoAchievementsFieldValue: (player: Player) =>
		`${player.achievements
			.map(
				(achievement) =>
					`• ${bold(achievement.name)}: ${achievement.info}${
						achievement.level ? ` ${Emojis.Star.repeat(achievement.level)}` : ""
					} - ${achievement.progress}/${achievement.target}${
						achievement.completed
							? ""
							: ` (${achievement.percentage.toFixed(1)}%)`
					}`
			)
			.join("\n")}` as const,

	/**
	 * The label for clan info.
	 */
	clanInfoLabel: () => "Info clan" as const,

	/**
	 * The message to display when no war is found.
	 */
	noWarFoundMessage: () => "Nessuna guerra trovata." as const,

	/**
	 * The embed title for a clan river race.
	 * @param race - The race
	 */
	riverRaceInfoTitle: (race: FinishedRiverRace) =>
		`Stagione ${race.seasonId} - Settimana ${race.weekNumber}` as const,

	/**
	 * The embed footer for a clan river race.
	 */
	riverRaceInfoFooter: () => "Guerra terminata il" as const,

	/**
	 * The embed field for a river race standing.
	 * @param standing - The standing
	 */
	riverRaceInfoStandingField: (standing: RiverRaceWeekStanding) => {
		const values = new Collection<string, string>()
			.set("Punti", `${CustomEmojis.warPoint} ${standing.clan.points}`)
			.set(
				"Trofei guadagnati/persi",
				`${CustomEmojis.warTrophy} ${standing.trophyChange}`
			);

		if (standing.pointsToOvertake != null)
			values.set(
				"Punti necessari per superare il clan in classifica",
				`${CustomEmojis.warPoint} ${standing.pointsToOvertake}`
			);
		if (standing.clan.finishedAt != null)
			values.set(
				"Corsa terminata",
				`${time(
					standing.clan.finishedAt,
					TimestampStyles.LongDateTime
				)} (${time(standing.clan.finishedAt, TimestampStyles.RelativeTime)})`
			);
		values.set("Punteggio del clan", `${Emojis.Score} ${standing.clan.score}`);
		values.set(
			"Partecipanti",
			`${CustomEmojis.clanMembers} ${
				standing.clan.participants.filter((p) => Boolean(p.medals)).size
			}`
		);

		return {
			name: `${standing.rank}. ${standing.clan.name} (${standing.clan.tag})`,
			value: values.map((v, k) => `${bold(k)}: ${v}`).join("\n"),
		} as const;
	},

	/**
	 * Description with information about a river race participant.
	 * @param participant - The participant
	 */
	riverRaceParticipantDescription: (participant: RiverRaceParticipant) =>
		`${Emojis.medal} ${participant.medals} - ${Emojis.Boat}${Emojis.Dagger} ${participant.boatAttacks} - ${Emojis.Deck} ${participant.decksUsed}` as const,

	/**
	 * Label with information about a river race participant.
	 * @param participant - The participant
	 * @param rank - The participant rank
	 */
	riverRaceParticipantLabel: (
		participant: RiverRaceParticipant,
		rank: number
	) => `#${rank} ${participant.name} (${participant.tag})`,

	/**
	 * The invite URL for the bot.
	 */
	inviteUrl: () =>
		`https://discord.com/api/oauth2/authorize?client_id=${process.env
			.DISCORD_CLIENT_ID!}&scope=${
			// TODO: This should be replaced with the discord application scopes provided by the API when they are ready.
			// See https://github.com/discord/discord-api-docs/pull/4112
			[OAuth2Scopes.ApplicationsCommands].join("%20")
		}` as const,
} as const;

/**
 * Values used as custom identifiers for select menus
 */
export const enum MenuActions {
	/**
	 * Show info about a player
	 */
	PlayerInfo = "player",

	/**
	 * Show info about a clan
	 */
	ClanInfo = "clan",
}

/**
 * Types of other arguments for button actions
 */

export type MenuActionsTypes = {
	[MenuActions.PlayerInfo]: [];
	[MenuActions.ClanInfo]: [];
};

/**
 * Values used as custom identifiers for buttons
 */

export const enum ButtonActions {
	/**
	 * Show the next page
	 */
	NextPage = "after",

	/**
	 * Show the previous page
	 */
	PreviousPage = "before",

	/**
	 * Show the river race log of a clan
	 */
	RiverRaceLog = "rrlog",

	/**
	 * Show clan's info
	 */
	ClanInfo = "clan",
}

/**
 * Types of other arguments for button actions
 */

export type ButtonActionsTypes = {
	[ButtonActions.NextPage]: [cursor: string];
	[ButtonActions.PreviousPage]: [cursor: string];
	[ButtonActions.RiverRaceLog]: [
		clan: APITag,
		index?: number,
		userId?: Snowflake
	];
	[ButtonActions.ClanInfo]: [clan: APITag];
};

/**
 * The match level from comparing 2 strings
 */
export const enum MatchLevel {
	/**
	 * The strings don't match at all
	 */
	None,

	/**
	 * The second string is a substring of the first one
	 */
	Partial,

	/**
	 * The second string is at the end of the first one
	 */
	End,

	/**
	 * The second string is at the beginning of the first one
	 */
	Start,

	/**
	 * The second string is the same as the first one
	 */
	Full,
}

export default Constants;
