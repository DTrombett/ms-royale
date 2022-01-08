import { REST } from "@discordjs/rest";
import type {
	APIApplicationCommand,
	APIApplicationCommandPermission,
	APIGuildApplicationCommandPermissions,
} from "discord-api-types/v9";
import {
	APIVersion,
	ApplicationCommandPermissionType,
	Routes,
} from "discord-api-types/v9";
import { config } from "dotenv";
import { promises } from "node:fs";
import { join } from "node:path";
import { cwd, env } from "node:process";
import { URL } from "node:url";
import type { CommandOptions } from "./util";
import Constants, { CustomClient } from "./util";

console.time("Register slash commands");

config({ path: join(cwd(), ".env") });

const {
	DISCORD_CLIENT_ID: applicationId,
	TEST_GUILD: guildId,
	DISCORD_TOKEN: token,
	GLOBAL_COMMANDS,
} = env;
const registerGlobal = GLOBAL_COMMANDS === "true";
const rest = new REST({ version: APIVersion }).setToken(token!);
const commands = await promises
	.readdir(new URL(Constants.commandsFolderName(), import.meta.url))
	.then((fileNames) =>
		Promise.all(
			fileNames
				.filter((file): file is `${string}.js` => file.endsWith(".js"))
				.map(async (file) => {
					const fileData = (await import(
						`./${Constants.commandsFolderName()}/${file}`
					)) as { command: CommandOptions };
					return fileData.command;
				})
		)
	)
	.then((allCommands) =>
		allCommands.filter(
			(command) => (command.reserved ?? false) !== registerGlobal
		)
	);
const APICommands = (await rest.put(
	registerGlobal
		? Routes.applicationCommands(applicationId!)
		: Routes.applicationGuildCommands(applicationId!, guildId!),
	{
		body: commands.map((file) => file.data.toJSON()),
	}
)) as APIApplicationCommand[];

if (!registerGlobal)
	await rest.put(
		Routes.guildApplicationCommandsPermissions(applicationId!, guildId!),
		{
			body: APICommands.map<APIGuildApplicationCommandPermissions>(
				(command) => ({
					application_id: applicationId!,
					guild_id: guildId!,
					id: command.id,
					permissions: Constants.owners().map<APIApplicationCommandPermission>(
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

CustomClient.printToStdout(APICommands);
console.timeEnd("Register slash commands");
