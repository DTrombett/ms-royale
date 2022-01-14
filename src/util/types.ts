import type {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import type { APITag, ClientEvents } from "apiroyale";
import type { Snowflake } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	Awaitable,
	ButtonInteraction,
	CommandInteraction,
	SelectMenuInteraction,
} from "discord.js";
import { ClientEvents as DiscordEvents } from "discord.js";
import type { Command, Event } from ".";

/**
 * Values used as custom identifiers for buttons
 */
export enum ButtonActions {
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
	RiverRaceLog = "rrl",

	/**
	 * Show clan's info
	 */
	ClanInfo = "ci",

	/**
	 * Show the current river race of a clan
	 */
	CurrentRiverRace = "crr",

	/**
	 * Show player's info
	 */
	PlayerInfo = "pi",

	/**
	 * Show a player achievement's info
	 */
	PlayerAchievements = "ai",
}

/**
 * Types of other arguments for button actions
 */
export type ButtonActionsTypes = {
	[ButtonActions.NextPage]: [cursor: string];
	[ButtonActions.PreviousPage]: [cursor: string];
	[ButtonActions.RiverRaceLog]: [
		clan: APITag,
		index?: `${number}`,
		userId?: Snowflake
	];
	[ButtonActions.ClanInfo]: [clan: APITag];
	[ButtonActions.CurrentRiverRace]: [clan: APITag];
	[ButtonActions.PlayerInfo]: [player: APITag];
	[ButtonActions.PlayerAchievements]: [player: APITag];
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

export enum CustomEmojis {
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

	/**
	 * The emoji for a war in a training state
	 */
	training = "<:training:927624101219160207>",

	/**
	 * The emoji for a clan war
	 */
	clanWar = "<:clanwar:929338139540066327>",

	/**
	 * The emoji for an achievement
	 */
	achievement = "<:achievement:931157677130784778>",
}

/**
 * Emojis for the bot
 */
export enum Emojis {
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

	/**
	 * The emoji for today
	 */
	Today = "📅",
}

/**
 * The data for an event
 */
export type EventOptions<
	T extends EventType = EventType,
	K extends T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never = T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never
> = {
	/**
	 * The name of the event
	 */
	name: K;

	/**
	 * The type of the event
	 */
	type: T;

	/**
	 * The function to execute when the event is received
	 */
	on?: (
		this: Event<T, K>,
		...args: K extends keyof ClientEvents
			? ClientEvents[K]
			: K extends keyof DiscordEvents
			? DiscordEvents[K]
			: never
	) => Awaitable<void>;

	/**
	 * The function to execute when the event is received once
	 */
	once?: EventOptions<T, K>["on"];
};

/**
 * The type for an event
 */
export enum EventType {
	Discord = "discord",
	APIRoyale = "royale",
}

/**
 * All the face emojis
 */
export enum FaceEmojis {
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
 * A list of locale codes
 */
export enum LocaleCodes {
	IT = "it",
	GB = "en-US",
	ES = "es-ES",
	DE = "de",
	FR = "fr",
	NL = "nl",
	NO = "no",
	FI = "fi",
	RU = "ru",
	TR = "tr",
	VI = "vi",
	TH = "th",
	TW = "zh-TW",
}

/**
 * The match level from comparing 2 strings
 */
export enum MatchLevel {
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
export enum MenuActions {
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
	| SelectMenuInteraction;

/**
 * A string identifier for a translation value
 */
export type TranslationKeys<
	T = TranslationSample,
	K extends keyof T = keyof T
> = K extends string
	? `${K extends `${infer U}_${string}` ? U : K}${
			| ""
			| (T[K] extends string
					? never
					: `.${TranslationKeys<T[K], keyof T[K]>}`)}`
	: never;

/**
 * A translation value
 */
export type TranslationResult<
	K extends string,
	T = TranslationSample,
	G extends string = K extends `${infer U}.${string}` ? U : K,
	F extends Exclude<keyof T, symbol> = Exclude<
		Extract<keyof T, G extends keyof T ? G : `${G}_${string}`>,
		symbol
	>
> = F extends never
	? never
	: T[F] extends string
	? T[F]
	: K extends `${F}.${infer U}`
	? TranslationResult<U, T[F]>
	: T[F];

/**
 * A sample of a translation
 */
export type TranslationSample = typeof import("../../locales/it.json");

/**
 * A list of all the variables
 */
export type Variables = {
	players: Record<Snowflake, APITag | undefined>;
};
