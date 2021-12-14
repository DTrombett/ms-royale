import { bold } from "@discordjs/builders";
import type {
	APITag,
	Clan,
	ClanMember,
	ClanPreview,
	ClanResultPreview,
	Location,
	Player,
} from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import type { Snowflake } from "discord.js";
import { Util } from "discord.js";
import capitalize from "./capitalize";
import { CustomEmojis, Emojis } from "./types";

/**
 * Constants about time
 */
export const time = {
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
	mainClanFetchInterval: () => time.millisecondsPerMinute * 2,

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
