import { Constants } from "discord.js";
import { config } from "dotenv";
import { promises } from "fs";
import { join } from "path";
import { ClientRoyale } from "./ClientRoyale";
import type { CommandOptions } from "./types";
import { Command } from "./util";

config();
const client = new ClientRoyale();

console.time("Client online");
client.on(Constants.Events.CLIENT_READY, async (onlineClient) => {
	await Promise.all([
		onlineClient.application.fetch(),
		promises
			.readdir(join(__dirname, "commands"))
			.then((fileNames) =>
				Promise.all(
					fileNames
						.filter((fileName) => fileName.endsWith(".js"))
						.map(
							(fileName) =>
								import(join(__dirname, "commands", fileName)) as Promise<{
									command: CommandOptions;
								}>
						)
				)
			)
			.then((files) => files.map((file) => file.command))
			.then((commands) => {
				for (const command of commands)
					client.commands.set(command.data.name, new Command(client, command));
			}),
		client.clans.fetch("#L2Y2L2PC"),
	]);

	console.timeEnd("Client online");
});
client.on(Constants.Events.INTERACTION_CREATE, (interaction) => {
	if (interaction.isCommand())
		client.commands.get(interaction.commandName)?.run(interaction);
});

void client.login();
