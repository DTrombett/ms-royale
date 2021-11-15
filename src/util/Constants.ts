import { bold, italic, underscore } from "@discordjs/builders";
import type { Snowflake } from "discord.js";
import { Util } from "discord.js";
import type { APITag, Clan, ClanMember, ClanResultPreview } from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import { Emojis } from "../types";

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
		`${underscore(Util.escapeMarkdown(oldClanDescription))}\n=> ${underscore(
			Util.escapeMarkdown(newClanDescription)
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
		`${italic(Util.escapeMarkdown(oldClanLocation))} => ${italic(
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
	 * @param member - The member that left
	 */
	clanMemberLeftFieldName: (member: ClanMember) =>
		`A ${ClanMemberRole[member.role]} left` as const,

	/**
	 * The embed field value shown when a clan member left.
	 * @param member - The member that left
	 */
	clanMemberLeftFieldValue: (member: ClanMember) =>
		`${Util.escapeMarkdown(member.name)} (${member.tag}) - 🏆 ${
			member.trophies
		} (#${member.rank})` as const,

	/**
	 * The embed field name shown when a clan member joined.
	 * @param member - The member that joined
	 */
	clanMemberJoinedFieldName: (member: ClanMember) =>
		`A ${ClanMemberRole[member.role]} joined` as const,

	/**
	 * The embed field value shown when a clan member joined.
	 * @param member - The member that joined
	 */
	clanMemberJoinedFieldValue: (member: ClanMember) =>
		`${Util.escapeMarkdown(member.name)} (${member.tag}) - 🏆 ${
			member.trophies
		} (#${member.rank})` as const,

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
} as const;

/**
 * Values used as custom identifiers for select menus
 */
export const enum MenuActions {
	/**
	 * Show info about a clan member
	 */
	MemberInfo = "mi",

	/**
	 * Show info about a clan
	 */
	ClanInfo = "ci",
}

/**
 * Values used as custom identifiers for buttons
 */
export const enum ButtonActions {
	/**
	 * Show the next page
	 */
	NextPage = "np",

	/**
	 * Show the previous page
	 */
	PreviousPage = "pp",
}

export default Constants;
