import type { ClientOptions as DiscordClientOptions } from "discord.js";
import { Client } from "discord.js";
import type { ClientOptions } from "./types";
import Rest from "./rest";

export class ClientRoyale extends Client {
	royale = new Rest(this);
	tokenRoyale: string = process.env.CLASH_ROYALE_TOKEN!;
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
