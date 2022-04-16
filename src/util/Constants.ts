import { bold } from "@discordjs/builders";
import type { APITag, PlayerBadge, PlayerBadgeManager } from "apiroyale";
import type { Snowflake } from "discord-api-types/v10";
import type { ClientApplication } from "discord.js";
import { env } from "node:process";
import { author, name } from "../../package.json";

const prod = env.NODE_ENV === "production";

export const RoyaleUrls = {
	/**
	 * The schema of the royale url
	 */
	SCHEMA: "clashroyale://" as const,

	/**
	 * The path for clan info
	 */
	clanInfoPath: "clanInfo" as const,

	/**
	 * The path for player info
	 */
	playerInfoPath: "playerInfo" as const,

	/**
	 * Builds a Clash Royale url.
	 * @param path - The path of the url
	 */
	build: (path: string) => `${RoyaleUrls.SCHEMA}${path}` as const,

	/**
	 * The url for clan info.
	 * @param tag - The tag of the clan
	 */
	clanInfo: (tag: APITag) =>
		RoyaleUrls.build(`${RoyaleUrls.clanInfoPath}?id=${tag.slice(1)}`),

	/**
	 * The url for player info.
	 * @param tag - The tag of the player
	 */
	playerInfo: (tag: APITag) =>
		RoyaleUrls.build(`${RoyaleUrls.playerInfoPath}?id=${tag.slice(1)}`),
};

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
	 * The label used for the online event of the client
	 */
	clientOnlineLabel: "Client online",

	/**
	 * The tag of the main clan
	 */
	mainClanTag: "#L2Y2L2PC",

	/**
	 * The tag of the main clan
	 */
	secondClanTag: "#QGY89R8U",

	/**
	 * Number of milliseconds before fetching the main clan again
	 */
	mainClanFetchInterval: TIME.millisecondsPerMinute * 5,

	/**
	 * The name of the folder with commands
	 */
	commandsFolderName: "commands",

	/**
	 * The name of the folder with events
	 */
	eventsFolderName: "events",

	/**
	 * A zero-width space
	 */
	zeroWidthSpace: "\u200b",

	/**
	 * Number of digits after the decimal point for percentage
	 */
	percentageDigits: 2,

	/**
	 * Bot owners
	 */
	owners: ["597505862449496065", "584465680506814465"] as Snowflake[],

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
		prod
			? Constants.website(`${RoyaleUrls.clanInfoPath}?tag=${tag.slice(1)}`)
			: (`https://royaleapi.com/clan/${tag.slice(1)}` as const),

	/**
	 * The link for player info.
	 * @param tag - The player tag
	 */
	playerLink: (tag: APITag) =>
		prod
			? Constants.website(`${RoyaleUrls.playerInfoPath}?tag=${tag.slice(1)}`)
			: (`https://royaleapi.com/player/${tag.slice(1)}` as const),

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
	 * @param application - The application
	 */
	inviteUrl: (application: ClientApplication) =>
		application.customInstallURL ??
		(`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID!}&scope=${(
			application.installParams?.scopes ?? ["application.commands"]
		).join("%20")}&permissions=${
			application.installParams?.permissions.bitfield ?? 0
		}&response_type=code` as const),

	/**
	 * The bot's locale
	 */
	locale: "it-IT",

	/**
	 * The folder with saved variables
	 */
	variablesFolderName: "database",

	/**
	 * The url of the bot's website.
	 * @param path - The path to append to the url
	 */
	website: (...path: string[]) =>
		`https://${name}.${author}.repl.co/${path.join("/")}` as const,
} as const;

export default Constants;
