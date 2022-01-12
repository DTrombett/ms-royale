import Collection from "@discordjs/collection";
import { ClientRoyale } from "apiroyale";
import { Client, Intents, Options } from "discord.js";
import { env, stderr, stdout } from "node:process";
import { inspect } from "node:util";
import Command from "./Command";
import Constants from "./Constants";
import Event from "./Event";
import loadCommands from "./loadCommands";
import loadEvents from "./loadEvents";
import { EventType } from "./types";

const locale = Constants.locale();

/**
 * A custom class to interact with Clash Royale API and Discord
 */
export class CustomClient extends ClientRoyale {
	/**
	 * If the client is blocked and should not perform any action
	 */
	blocked = false;

	/**
	 * The Discord client
	 */
	discord = new Client({
		intents: [Intents.FLAGS.GUILDS],
		allowedMentions: { parse: [], repliedUser: false, roles: [], users: [] },
		failIfNotExists: false,
		http: { api: "https://canary.discord.com/api" },
		invalidRequestWarningInterval: 9_998,
		makeCache: Options.cacheWithLimits({
			...Options.defaultMakeCacheSettings,
			BaseGuildEmojiManager: 0,
			GuildBanManager: 0,
			GuildEmojiManager: 0,
			GuildInviteManager: 0,
			GuildMemberManager: 0,
			GuildStickerManager: 0,
			MessageManager: 0,
			PresenceManager: 0,
			ReactionManager: 0,
			ReactionUserManager: 0,
			StageInstanceManager: 0,
			ThreadMemberManager: 0,
			UserManager: 0,
			VoiceStateManager: 0,
		}),
		presence: {
			activities: [{ name: "Clash Royale", type: 0 }],
		},
		rejectOnRateLimit: () => true,
		restGlobalRateLimit: 50,
		restTimeOffset: 1000,
		shards: "auto",
	});

	/**
	 * Commands of this client
	 */
	commands = new Collection<string, Command>();

	/**
	 * Events of this client
	 */
	events = new Collection<string, Event>();

	constructor() {
		super({ baseURL: "https://proxy.royaleapi.dev/v1" });
	}

	/**
	 * Inspects a value.
	 * @param value - The value to check
	 */
	static inspect(this: void, value: unknown) {
		switch (typeof value) {
			case "string":
				return value;
			case "bigint":
			case "number":
			case "boolean":
			case "function":
			case "symbol":
				return value.toString();
			case "object":
				return inspect(value);
			default:
				return "undefined";
		}
	}

	/**
	 * Prints a message to stdout.
	 * @param message - The string to print
	 */
	static printToStdout(this: void, message: unknown) {
		stdout.write(CustomClient.format(message));
	}

	/**
	 * Prints a message to stderr.
	 * @param message - The string to print
	 */
	static printToStderr(this: void, message: unknown) {
		stderr.write(CustomClient.format(message));
	}

	/**
	 * Formats a string with the current time.
	 * @param message - The message to format
	 * @returns The formatted message
	 */
	private static format(this: void, message: unknown): string {
		return `${CustomClient.inspect(message)} (${new Date().toLocaleString(
			locale,
			{
				timeZone: "Europe/Rome",
			}
		)})\n`;
	}

	/**
	 * Loads commands and events, then logs in with Discord.
	 * @returns A promise that resolves when the client is ready
	 */
	async login() {
		await Promise.all([
			loadCommands(this),
			loadEvents(this, EventType.Discord),
			loadEvents(this, EventType.APIRoyale),
		]);
		return this.discord.login(env.DISCORD_TOKEN);
	}
}

export default CustomClient;
