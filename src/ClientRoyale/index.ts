import Collection from "@discordjs/collection";
import type { Awaitable } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import type { Command } from "../util";
import { ArenaManager, ClanManager, LocationManager } from "./managers";
import Rest from "./rest";
import type { ClientEvents, ClientOptions } from "./util";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ClientRoyale extends Client {
	on<T extends keyof ClientEvents>(
		event: T,
		listener: (...args: ClientEvents[T]) => Awaitable<void>
	): this;
	emit<T extends keyof ClientEvents>(
		event: T,
		...args: ClientEvents[T]
	): boolean;
}

/**
 * A class to connect to both Discord and Clash Royale API
 */
export class ClientRoyale extends Client {
	/**
	 * A manager for arenas
	 */
	arenas = new ArenaManager(this);

	/**
	 * A manager for clans
	 */
	clans = new ClanManager(this);

	/**
	 * A list of Discord commands
	 */
	commands = new Collection<string, Command>();

	/**
	 * A manager for locations
	 */
	locations = new LocationManager(this);

	/**
	 * The rest client
	 */
	rapi = new Rest(this);

	/**
	 * The token used for the API
	 */
	tokenRoyale: string = process.env.CLASH_ROYALE_TOKEN!;

	/**
	 * @param options - Options for the client
	 */
	constructor({ token }: ClientOptions = {}) {
		super({
			intents: 0,
			allowedMentions: { parse: [], repliedUser: false, roles: [], users: [] },
			failIfNotExists: false,
			http: { api: "https://canary.discord.com/api" },
			invalidRequestWarningInterval: 9_999,
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
				activities: [
					{ name: "Clash Royale", type: Constants.ActivityTypes.PLAYING },
				],
			},
			rejectOnRateLimit: () => true,
			restGlobalRateLimit: 50,
			restTimeOffset: 1000,
			shards: "auto",
		});

		if (token != null) this.tokenRoyale = token;
		if (!this.tokenRoyale)
			throw new TypeError("No token provided for the client.");
	}
}
