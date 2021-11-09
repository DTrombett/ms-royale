import { promises } from "node:fs";
import { join } from "node:path";
import type { CommandOptions } from "../types";
import type ClientRoyale from "../ClientRoyale";
import Constants from "./Constants";
import Command from "./Command";

export const loadCommands = (client: ClientRoyale) =>
	promises
		.readdir(join(__dirname, "..", Constants.commandsFolderName()))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(
								join(__dirname, "..", Constants.commandsFolderName(), fileName)
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
