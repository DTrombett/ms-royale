import type {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import type { APITag, ClientEvents } from "apiroyale";
import type { Snowflake as APISnowflake } from "discord-api-types";
import type {
	AutocompleteInteraction,
	Awaitable,
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction,
} from "discord.js";
import type { Command, Event } from ".";

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
		userId?: APISnowflake
	];
	[ButtonActions.ClanInfo]: [clan: APITag];
};

/**
 * Options to create a command
 */
export type CommandOptions = {
	/**
	 * The data for this command
	 */
	data:
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * If this event can only be executed from owners
	 */
	reserved?: boolean;

	/**
	 * A functions to run when an autocomplete request is received by Discord.
	 * @param this - The command object that called this
	 * @param interaction - The interaction received
	 */
	autocomplete?(
		this: Command,
		interaction: AutocompleteInteraction
	): Awaitable<void>;

	/**
	 * A function to run when this command is received by Discord.
	 * @param this - The command object that called this
	 * @param interaction - The interaction received
	 */
	run(this: Command, interaction: CommandInteraction): Awaitable<void>;
};

/**
 * Custom emojis for the bot
 */
export const enum CustomEmojis {
	/**
	 * The emoji of a war trophy
	 */
	warTrophy = "<:wartrophy:906920944868671498>",

	/**
	 * The profile emoji of a user
	 */
	user = "<:user:915686990723285022>",

	/**
	 * The emoji of donations
	 */
	donations = "<:donations:915687097984241685>",

	/**
	 * The emoji for clan members
	 */
	clanMembers = "<:members:915688913413210123>",

	/**
	 * The emoji of the king level
	 */
	kingLevel = "<:kinglevel:916016946774958101>",

	/**
	 * The emoji for copying a deck
	 */
	copyDeck = "<:copydeck:916029046700261417>",

	/**
	 * The emoji of a clan invite
	 */
	clanInvite = "<:claninvite:916032272631750698>",

	/**
	 * The emoji for a win
	 */
	win = "<:win:916339474403848223>",

	/**
	 * The emoji for a loss
	 */
	lose = "<:lose:916339513591222322>",

	/**
	 * The emoji for cards
	 */
	cards = "<:cards:916340767021203478>",

	/**
	 * The emoji for a medal
	 */
	medal = "<:medal:918514839670886400>",

	/**
	 * The emoji for a war point
	 */
	warPoint = "<:warpoint:918522796747915304>",

	/**
	 * The emoji for a boat attack
	 */
	boatAttack = "<:boatattack:918909257745825793>",

	/**
	 * The emoji for a war deck
	 */
	warDeck = "<:wardeck:918908890761035817>",
}

/**
 * Emojis for the bot
 */
export const enum Emojis {
	/**
	 * The emoji for a check mark
	 */
	Check = "✅",

	/**
	 * The emoji for a cross mark
	 */
	Cross = "❌",

	/**
	 * The emoji for a warning sign
	 */
	Warning = "⚠️",

	/**
	 * The emoji for a question mark
	 */
	Question = "❓",

	/**
	 * The emoji for a exclamation mark
	 */
	Exclamation = "❗",

	/**
	 * The emoji for a double exclamation mark
	 */
	DoubleExclamation = "❕",

	/**
	 * The emoji for a heavy check mark
	 */
	HeavyCheck = "✔️",

	/**
	 * The emoji for a heavy multiplication sign
	 */
	HeavyMultiplication = "✖️",

	/**
	 * The emoji for a heavy division sign
	 */
	HeavyDivision = "➗",

	/**
	 * The emoji for a heavy minus sign
	 */
	HeavyMinus = "➖",

	/**
	 * The emoji for a heavy plus sign
	 */
	HeavyPlus = "➕",

	/**
	 * The emoji for a trophy
	 */
	Trophy = "🏆",

	/**
	 * The emoji for a crown
	 */
	Crown = "👑",

	/**
	 * The emoji for a star
	 */
	Star = "⭐",

	/**
	 * The emoji for a sparkles
	 */
	Sparkles = "✨",

	/**
	 * The emoji for a snowflake
	 */
	Snowflake = "❄",

	/**
	 * The emoji for a heart
	 */
	Heart = "❤",

	/**
	 * The emoji for a heavy heart
	 */
	HeavyHeart = "💖",

	/**
	 * The emoji for money with wings
	 */
	MoneyWithWings = "💸",

	/**
	 * The emoji for people
	 */
	People = "👥",

	/**
	 * The emoji for a score
	 */
	Score = "💯",

	/**
	 * The emoji for a location
	 */
	Location = "📍",

	/**
	 * The emoji for a back arrow
	 */
	BackArrow = "⬅",

	/**
	 * The emoji for a forward arrow
	 */
	ForwardArrow = "➡",

	/**
	 * The emoji for a medal
	 */
	medal = "🏅",

	/**
	 * The emoji for a boat
	 */
	Boat = "⛵",

	/**
	 * The emoji for a dagger
	 */
	Dagger = "🗡",

	/**
	 * The emoji for a deck
	 */
	Deck = "🎴",

	/**
	 * The emoji for an information symbol
	 */
	Info = "ℹ",

	/**
	 * The emoji for a log
	 */
	Log = "🗒",

	/**
	 * The emoji for crossed swords
	 */
	CrossedSwords = "⚔",

	/**
	 * The emoji for a robot
	 */
	Robot = "🤖",
}

/**
 * The data for an event
 */
export type EventOptions<T extends keyof ClientEvents = keyof ClientEvents> = {
	/**
	 * The name of the event
	 */
	name: T;

	/**
	 * The function to execute when the event is received
	 */
	on?: (this: Event<T>, ...args: ClientEvents[T]) => Awaitable<void>;

	/**
	 * The function to execute when the event is received once
	 */
	once?: EventOptions<T>["on"];
};

/**
 * All the face emojis
 */
export const enum FaceEmojis {
	":)" = "😊",
	":D" = "😀",
	":P" = "😛",
	":O" = "😮",
	":*" = "😗",
	";)" = "😉",
	":|" = "😐",
	":/" = "😕",
	":S" = "😖",
	":$" = "😳",
	":@" = "😡",
	":^)" = "😛",
	":\\" = "😕",
}

/**
 * A list of all available locales
 */
export enum Locales {
	Italiano = "IT",
	English = "GB",
	Español = "ES",
	Deutsch = "DE",
	France = "FR",
	Nederlands = "NL",
	Norsk = "NO",
	Suomi = "FI",
	Русский = "RU",
	Türkçe = "TR",
	"Tiếng Việt" = "VI",
	ไทย = "TH",
	繁體中文 = "TW",
}

/**
 * A list of locale emojis
 */
export const enum LocaleEmojis {
	Italiano = "🇮🇹",
	English = "🇬🇧",
	Español = "🇪🇸",
	Deutsch = "🇩🇪",
	France = "🇫🇷",
	Nederlands = "🇳🇱",
	Norsk = "🇳🇴",
	Suomi = "🇫🇮",
	Русский = "🇷🇺",
	Türkçe = "🇹🇷",
	"Tiếng Việt" = "🇻🇳",
	ไทย = "🇹🇭",
	日本語 = "🇯🇵",
	繁體中文 = "🇹🇼",
	한국어 = "🇰🇷",
}

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
 * An interaction that can be replied to
 */
export type ReplyableInteraction =
	| ButtonInteraction
	| CommandInteraction
	| ContextMenuInteraction
	| SelectMenuInteraction;

/**
 * A list of all supported locales
 */
export enum SupportedLocales {
	Italiano = "IT",
	// TODO: Change to English
	Default = Italiano,
}
