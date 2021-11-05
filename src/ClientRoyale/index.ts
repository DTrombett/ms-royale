import Collection from "@discordjs/collection";
import type { ClientOptions as DiscordClientOptions } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import type { Command } from "../util";
import { ArenaManager, ClanManager, LocationManager } from "./managers";
import Rest from "./rest";
import type { ClientOptions } from "./util";

/**
 * A class to connect to both Discord and Clash Royale API
 */
export class ClientRoyale extends Client {
	/**
	 * A list of Discord commands
	 */
	commands = new Collection<string, Command>();

	/**
	 * A manager for clans
	 */
	clans = new ClanManager(this);

	/**
	 * A manager for locations
	 */
	locations = new LocationManager(this);

	/**
	 * A manager for arenas
	 */
	arenas = new ArenaManager(this);

	/**
	 * The Clash Royale API
	 */
	rapi = new Rest(this);

	/**
	 * The token used for Clash Royale
	 */
	tokenRoyale: string = process.env.CLASH_ROYALE_TOKEN!;

	/**
	 * @param param0 - Options for the client
	 * @param discordOptions Options for the Discord client
	 */
	constructor(
		{ token }: ClientOptions = {},
		discordOptions: DiscordClientOptions = {
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
		}
	) {
		super(discordOptions);

		if (token != null) this.tokenRoyale = token;
		if (!this.tokenRoyale)
			throw new TypeError("No token provided for the client.");
	}
}
