import { promises } from "fs";
import { join } from "path";
import type { CommandOptions } from "../types";
import { Command } from ".";
import type { ClientRoyale } from "../ClientRoyale";

export const loadCommands = (client: ClientRoyale) =>
	promises
		.readdir(join(__dirname, "../commands"))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(join(__dirname, "../commands", fileName)) as Promise<{
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
