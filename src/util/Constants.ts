import { bold, hyperlink } from "@discordjs/builders";
import type {
	APITag,
	ClanPreview,
	Player,
	PlayerBadge,
	PlayerBadgeManager,
	PlayerCard
} from "apiroyale";
import { OAuth2Scopes } from "discord-api-types/v9";
import type { Snowflake } from "discord.js";
import { Util } from "discord.js";
import { env } from "node:process";
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
	clanSearchResultsContent: (
		user: Snowflake,
		name?: string,
		locationId?: number | `${number}`,
		minMembers?: number,
		maxMembers?: number,
		minScore?: number
	) =>
		` Risultati per la seguente ricerca richiesta da <@${user}>:\n\n${bold(
			"Nome"
		)}: ${name != null ? Util.escapeMarkdown(name) : "-"}\n${bold(
			"Id posizione"
		)}: ${locationId ?? "-"}\n${bold("Minimo membri")}: ${
			minMembers ?? "-"
		}\n${bold("Massimo membri")}: ${maxMembers ?? "-"}\n${bold(
			"Punteggio minimo"
		)}: ${minScore ?? "-"}`,

	playerCardDescription: (card: PlayerCard) =>
		`${bold(card.name)} (Liv. ${bold(card.displayLevel.toString())})` as const,
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

	playerInfoAchievementsFieldValue: (player: Player) =>
		player.achievements
			.map(
				(achievement) =>
					`• ${bold(achievement.name)}: ${achievement.info}${
						achievement.level ? ` ${Emojis.Star.repeat(achievement.level)}` : ""
					} - ${achievement.progress}/${achievement.target}${
						achievement.completed
							? ""
							: ` (${achievement.percentage.toFixed(
									Constants.percentageDigits()
							  )}%)`
					}`
			)
			.join("\n"),

	/**
	 * The label used for the online event of the client.
	 */
	clientOnlineLabel: () => "Client online" as const,

	/**
	 * The tag of the main clan.
	 */
	mainClanTag: () => "#L2Y2L2PC" as const,

	/**
	 * The link of RoyaleAPI for a clan.
	 * @param clanTag - The tag of the clan
	 */
	clanLink: (clanTag: APITag) =>
		`https://royaleapi.com/clan/${clanTag.slice(1)}` as const,

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
	 * Number of digits after the decimal point for percentage.
	 */
	percentageDigits: () => 2 as const,

	/**
	 * Bot owners.
	 */
	owners: () => ["597505862449496065", "584465680506814465"],

	/**
	 * The message to log when a command is not recognized.
	 * @param command - The command
	 */
	optionNotRecognizedLog: (command: string) =>
		`Option not recognized: ${command}` as const,

	/**
	 * The url of the clan info embed.
	 * @param clan - The clan
	 */
	clanInfoUrl: (clan: ClanPreview) =>
		`https://royaleapi.com/clan/${clan.tag.slice(1)}` as const,

	/**
	 * The url for player info.
	 */
	playerInfoUrl: (player: Player) =>
		`https://royaleapi.com/player/${player.tag.slice(1)}` as const,

	/**
	 * The embed field value for the player's badges.
	 * @param badges - The player's badges
	 */
	playerInfoBadgesFieldValue: (badges: PlayerBadgeManager) =>
		badges.map(Constants.playerBadgeDescription).join(", "),
	playerBadgeDescription: (badge: PlayerBadge) =>
		`${bold(badge.name)}${
			badge.isMultipleLevels() ? ` (Liv. ${badge.level}/${badge.levels})` : ""
		}` as const,

	/**
	 * The invite URL for the bot.
	 */
	inviteUrl: () =>
		`https://discord.com/api/oauth2/authorize?client_id=${env
			.DISCORD_CLIENT_ID!}&scope=${[OAuth2Scopes.ApplicationsCommands].join(
			"%20"
		)}` as const,
} as const;

export default Constants;
