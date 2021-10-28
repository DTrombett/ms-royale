import type { SlashCommandBuilder } from "@discordjs/builders";
import type { Awaitable, CommandInteraction } from "discord.js";
import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import type { URLSearchParams } from "url";
import type { APIRequest } from "./ClientRoyale/rest";
import type { Command } from "./util";

/**
 * Options to instantiate a client
 */
export type ClientOptions = {
	/**
	 * The token of this client
	 * This defaults to `process.env.CLASH_ROYALE_TOKEN` if none is provided
	 */
	token?: Token;
};

/**
 * Options to create a command
 */
export type CommandOptions = {
	/**
	 * The data for this command
	 */
	data: SlashCommandBuilder;

	/**
	 * A function to run when this command is received by Discord.
	 * @param this - The command object that called this
	 * @param interaction - The interaction received
	 */
	run(this: Command, interaction: CommandInteraction): Awaitable<void>;
};

export const enum Constants {
	AbortTimeout = 10_000,
	APIUrl = "https://api.clashroyale.com/v1",
}

/**
 * Any JSON data
 */
export type Json =
	| Json[]
	| boolean
	| number
	| string
	| { [property: string]: Json };

/**
 * The path for a request to the API
 */
export type Path = `/${string}`;

/**
 * The options for a request
 */
export type RequestOptions = {
	/**
	 * Headers to be sent for this request
	 */
	headers?: OutgoingHttpHeaders;

	/**
	 * The query of this request
	 */
	query?:
		| Iterable<[string, string]>
		| Record<string, string | readonly string[]>
		| URLSearchParams
		| string
		| readonly [string, string][];

	/**
	 * The base url for this request
	 */
	url?: string;
};

/**
 * The status of a request to the API
 */
export enum RequestStatus {
	Pending,
	InProgress,
	Finished,
	Failed,
}

/**
 * A response received from the API
 */
export type Response = {
	/**
	 * The received data
	 */
	data: string | null;

	/**
	 * The status code received for this request
	 */
	statusCode: number;

	/**
	 * Headers received from the API
	 */
	headers: IncomingHttpHeaders;

	/**
	 * The status message received for this request
	 */
	status: string;

	/**
	 * The APIRequest object that instantiated this
	 */
	request: APIRequest;
};

/**
 * A valid token for the API
 */
export type Token = `${string}.${string}.${string}`;
