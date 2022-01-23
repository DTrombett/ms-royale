import { ClientRoyale } from "apiroyale";
import { Client, Intents, Options } from "discord.js";
import { use } from "i18next";
import Backend from "i18next-fs-backend";
import { createWriteStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { stderr, stdout } from "node:process";
import { fileURLToPath, URL } from "node:url";
import { inspect } from "node:util";
import Command from "./Command";
import Constants from "./Constants";
import { importJson } from "./database";
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
	bot = new Client({
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
	commands = new Map<string, Command>();

	/**
	 * Events of this client
	 */
	events = new Map<string, Event>();

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
	 * Logs a message in the log file.
	 * @param message - The message to log
	 * @returns A promise that resolves when the message is logged
	 */
	static async logToFile(message: string) {
		return new Promise<void>((resolve) => {
			try {
				createWriteStream(`./debug.log`, { flags: "a" })
					.once("error", CustomClient.printToStderr)
					.once("finish", resolve)
					.setDefaultEncoding("utf8")
					.end(message);
			} catch (error) {
				void CustomClient.printToStderr(error);
			}
		});
	}

	/**
	 * Prints a message to stdout.
	 * @param message - The string to print
	 * @param log - If the message should be logged in the log file too
	 */
	static async printToStdout(this: void, message: unknown, log = false) {
		const formatted = CustomClient.format(message);

		stdout.write(formatted);
		if (log) await CustomClient.logToFile(formatted);
	}

	/**
	 * Prints a message to stderr.
	 * @param message - The string to print
	 * @param log - If the message should be logged in the log file too
	 */
	static async printToStderr(this: void, message: unknown, log = false) {
		const formatted = CustomClient.format(message);

		stderr.write(formatted);
		if (log) await CustomClient.logToFile(formatted);
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
			use(Backend).init({
				backend: {
					loadPath: fileURLToPath(
						new URL("../locales/{{lng}}.json", import.meta.url)
					),
				},
				cleanCode: true,
				fallbackLng: "en-US",
				lng: "en-US",
				load: "currentOnly",
				preload: await readdir("./locales/").then((files) =>
					files.map((file) => file.replace(".json", ""))
				),
				returnObjects: true,
				debug: true,
			}),
			readdir("./database/").then((files) => {
				for (const file of files)
					void importJson<any>(file.replace(".json", ""));
			}),
			loadCommands(this),
			loadEvents(this, EventType.Discord),
			loadEvents(this, EventType.APIRoyale),
			this.bot.login(),
		]);
	}
}

export default CustomClient;
