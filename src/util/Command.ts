/* eslint-disable @typescript-eslint/member-ordering */
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from "discord.js";
import type { CommandOptions } from ".";
import Constants from "./Constants";
import CustomClient from "./CustomClient";

const owners = Constants.owners();

/**
 * A class representing a Discord slash command
 */
export class Command {
	/**
	 * The client that instantiated this
	 */
	readonly client: CustomClient;

	/**
	 * The Discord data for this command
	 */
	data!: CommandOptions["data"];

	/**
	 * If this command is private and can only be executed by the owners of the bot
	 */
	reserved = false;

	/**
	 * The function to handle the autocomplete of this command
	 */
	private _autocomplete: OmitThisParameter<CommandOptions["autocomplete"]>;

	/**
	 * The function provided to handle the command received
	 */
	private _execute!: OmitThisParameter<CommandOptions["run"]>;

	/**
	 * @param options - Options for this command
	 */
	constructor(client: CustomClient, options: CommandOptions) {
		this.client = client;

		this.patch(options);
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
	 * The description of this command
	 */
	get description() {
		return this.data.description;
	}
	set description(description) {
		this.data.setDescription(description);
	}

	/**
	 * Autocomplete this command.
	 * @param interaction - The interaction received
	 */
	async autocomplete(interaction: AutocompleteInteraction) {
		try {
			if (this.reserved && !owners.includes(interaction.user.id)) return;
			await this._autocomplete?.(interaction);
		} catch (message) {
			void CustomClient.printToStderr(message, true);
		}
	}

	/**
	 * Patch this command
	 * @param options - Options for this command
	 */
	patch(options: Partial<CommandOptions>) {
		if (options.data !== undefined) this.data = options.data;
		if (options.reserved !== undefined) this.reserved = options.reserved;
		if (options.autocomplete !== undefined)
			this._autocomplete = options.autocomplete.bind(this);
		if (options.run !== undefined) this._execute = options.run.bind(this);

		return this;
	}

	/**
	 * Run this command.
	 * @param interaction - The interaction received
	 */
	async run(interaction: ChatInputCommandInteraction) {
		try {
			if (this.reserved && !owners.includes(interaction.user.id)) {
				await interaction.reply({
					content: "Questo comando è riservato ai proprietari del bot.",
				});
				return;
			}
			await this._execute(interaction);
		} catch (message) {
			void CustomClient.printToStderr(message, true);
		}
	}
}

export default Command;
