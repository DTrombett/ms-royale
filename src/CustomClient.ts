import Collection from "@discordjs/collection";
import { ClientRoyale } from "apiroyale";
import { Client, Constants, Options } from "discord.js";
import type { Command, Event } from "./util";
import { loadCommands, loadEvents } from "./util";

/**
 * A custom class to interact with Clash Royale API and Discord
 */
export class CustomClient extends ClientRoyale {
	/**
	 * The Discord client
	 */
	discord = new Client({
		intents: 1 << 0,
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

	/**
	 * Commands of this client
	 */
	commands = new Collection<string, Command>();

	/**
	 * Events of this client
	 */
	events = new Collection<string, Event>();

	constructor() {
		super();

		void Promise.all([loadCommands(this), loadEvents(this)]).then(() =>
			this.discord.login(process.env.DISCORD_TOKEN)
		);
	}
}

export default CustomClient;
