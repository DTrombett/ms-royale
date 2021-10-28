import type { CommandInteraction } from "discord.js";
import type { ClientRoyale } from "../ClientRoyale";
import type { CommandOptions } from "../types";

/**
 * A class representing a Discord slash command
 */
export class Command {
	/**
	 * The client that instantiated this
	 */
	client: ClientRoyale;

	/**
	 * The Discord data for this command
	 */
	data: CommandOptions["data"];

	/**
	 * The function provided to handle the command received
	 */
	private _execute: OmitThisParameter<CommandOptions["run"]>;

	/**
	 * @param options - Options for this command
	 */
	constructor(client: ClientRoyale, options: CommandOptions) {
		this._execute = options.run.bind(this);
		this.client = client;
		this.data = options.data;
	}

	/**
	 * The name of this command
	 */
	get name() {
		return this.data.name;
	}
	set name(name) {
		this.data.setName(name);
	}

	/**
	 * Run this command.
	 * @param interaction - The interaction received
	 */
	async run(interaction: CommandInteraction) {
		try {
			await this._execute(interaction);
		} catch (message) {
			console.error(message);
		}
	}
}
