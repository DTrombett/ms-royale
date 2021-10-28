import type { ClientOptions as DiscordClientOptions } from "discord.js";
import { Client } from "discord.js";
import type { ClientOptions } from "../types";
import Rest from "./rest";
import type { Command } from "../util";
import Collection from "@discordjs/collection";

/**
 * A class to connect to both Discord and Clash Royale API
 */
export class ClientRoyale extends Client {
	/**
	 * A list of Discord commands
	 */
	commands = new Collection<string, Command>();

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
		discordOptions: DiscordClientOptions = { intents: 0 }
	) {
		super(discordOptions);

		if (token != null) this.tokenRoyale = token;
		if (!this.tokenRoyale)
			throw new TypeError("No token provided for the client.");
	}
}
