import { bold } from "@discordjs/builders";
import type { APITag, PlayerBadge, PlayerBadgeManager } from "apiroyale";
import { env } from "node:process";

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
	 * Number of milliseconds before fetching the main clan again.
	 */
	mainClanFetchInterval: () => TIME.millisecondsPerMinute * 5,

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
	 * @param tag - The clan tag
	 */
	clanLink: (tag: APITag) =>
		`https://royaleapi.com/clan/${tag.slice(1)}` as const,

	/**
	 * The link for player info.
	 * @param clan - The player tag
	 */
	playerLink: (tag: APITag) =>
		`https://royaleapi.com/player/${tag.slice(1)}` as const,

	/**
	 * The embed field value for the player's badges.
	 * @param badges - The player's badges
	 */
	playerInfoBadgesFieldValue: (badges: PlayerBadgeManager) =>
		badges.size
			? badges.map(Constants.playerBadgeDescription).join(", ")
			: "None",
	playerBadgeDescription: (badge: PlayerBadge) =>
		`${bold(badge.name)}${
			badge.isMultipleLevels() ? ` (Liv. ${badge.level}/${badge.levels})` : ""
		}` as const,

	/**
	 * The invite URL for the bot.
	 */
	inviteUrl: () =>
		`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID!}&scope=${[
			"applications.commands",
		].join("%20")}` as const,

	/**
	 * The bot's locale.
	 */
	locale: () => "it-IT" as const,

	/**
	 * The folder with saved variables.
	 */
	variablesFolderName: () => "database" as const,
} as const;

export default Constants;
