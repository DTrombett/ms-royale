import { REST } from "@discordjs/rest";
import type {
	APIApplicationCommand,
	APIApplicationCommandPermission,
	APIGuildApplicationCommandPermissions,
} from "discord-api-types/v10";
import {
	APIVersion,
	ApplicationCommandPermissionType,
	Routes,
} from "discord-api-types/v10";
import { config } from "dotenv";
import { promises } from "node:fs";
import { env, exit } from "node:process";
import { URL } from "node:url";
import type { CommandOptions } from "./util";
import Constants from "./util";

if (!("DISCORD_TOKEN" in env)) config({ debug: true });
console.time("Register slash commands");

const {
	DISCORD_CLIENT_ID: applicationId,
	TEST_GUILD: guildId,
	DISCORD_TOKEN: token,
	NODE_ENV,
} = env;
const prod = NODE_ENV === "production";
const rest = new REST({ version: APIVersion }).setToken(token!);
const commands = await promises
	.readdir(new URL(Constants.commandsFolderName, import.meta.url))
	.then((fileNames) =>
		Promise.all(
			fileNames
				.filter((file): file is `${string}.js` => file.endsWith(".js"))
				.map(async (file) => {
					const fileData = (await import(
						`./${Constants.commandsFolderName}/${file}`
					)) as { command: CommandOptions };
					return fileData.command;
				})
		)
	);
const [privateAPICommands, publicAPICommands] = await Promise.all([
	rest
		.put(Routes.applicationGuildCommands(applicationId!, guildId!), {
			body: commands
				.filter((c) => !prod || c.reserved)
				.map((file) => file.data.toJSON()),
		})
		.then((registeredCommands) => {
			if (prod) return registeredCommands;
			const privateCommands = commands.filter((c) => c.reserved);

			return (registeredCommands as APIApplicationCommand[]).filter((cmd) =>
				privateCommands.some((c) => c.data.name === cmd.name)
			);
		}) as Promise<APIApplicationCommand[]>,
	prod
		? (rest.put(Routes.applicationCommands(applicationId!), {
				body: commands
					.filter((c) => c.reserved !== true)
					.map((file) => file.data.toJSON()),
		  }) as Promise<APIApplicationCommand[]>)
		: [],
]);

await rest.put(
	Routes.guildApplicationCommandsPermissions(applicationId!, guildId!),
	{
		body: privateAPICommands.map<APIGuildApplicationCommandPermissions>(
			(command) => ({
				application_id: applicationId!,
				guild_id: guildId!,
				id: command.id,
				permissions: Constants.owners.map<APIApplicationCommandPermission>(
					(id) => ({
						id,
						type: ApplicationCommandPermissionType.User,
						permission: true,
					})
				),
			})
		),
	}
);

console.log("Public commands:", publicAPICommands);
console.log("Private commands:", privateAPICommands);
console.timeEnd("Register slash commands");
exit(0);
