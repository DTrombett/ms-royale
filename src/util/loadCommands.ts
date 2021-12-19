import { promises } from "node:fs";
import { join } from "node:path";
import { URL } from "node:url";
import type { CommandOptions } from ".";
import type CustomClient from "../CustomClient";
import Command from "./Command";
import Constants from "./Constants";

/**
 * Loads all commands from the commands directory.
 * @param client - The client to load commands into
 */
export const loadCommands = (client: CustomClient) =>
	promises
		.readdir(
			new URL(join("..", Constants.commandsFolderName()), import.meta.url)
		)
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(
								`../${Constants.commandsFolderName()}/${fileName}`
							) as Promise<{
								command: CommandOptions;
							}>
					)
			)
		)
		.then((files) => files.map((file) => file.command))
		.then((commands) => {
			for (const command of commands)
				client.commands.set(command.data.name, new Command(client, command));
		});

export default loadCommands;
