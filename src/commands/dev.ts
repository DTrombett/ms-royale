import {
	bold,
	codeBlock,
	inlineCode,
	SlashCommandBuilder,
	TimestampStyles,
} from "@discordjs/builders";
import { Colors, Util } from "discord.js";
import type { Buffer } from "node:buffer";
import type { ChildProcess } from "node:child_process";
import { exec, execFile } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import {
	argv,
	cwd,
	env,
	exit,
	memoryUsage,
	stderr,
	stdin,
	stdout,
	uptime,
} from "node:process";
import prettier from "prettier";
import type { CommandOptions } from "../util";
import {
	CustomClient,
	importJson,
	normalizeTag,
	parseEval,
	restart,
	writeJson,
} from "../util";

enum SubCommands {
	shell = "shell",
	evalCmd = "eval",
	test = "test",
	ram = "ram",
	restartCmd = "restart",
	shutdown = "shutdown",
	uptimeCmd = "uptime",
	pull = "pull",
	cpp = "cpp",
	logs = "logs",
	save = "save",
}
enum SubCommandOptions {
	cmd = "cmd",
	ephemeral = "ephemeral",
	process = "process",
	rebuild = "rebuild",
	registerCommands = "synccommands",
	restartProcess = "restart",
	packages = "packages",
	code = "code",
	include = "include",
	namespaces = "namespaces",
	lines = "lines",
	user = "user",
	tag = "tag",
}

const bytesToMb = (memory: number) =>
		Math.round((memory / 1024 / 1024) * 100) / 100,
	commaRegex = /,\s{0,}/g;

export const command: CommandOptions = {
	reserved: true,
	data: new SlashCommandBuilder()
		.setName("dev")
		.setDescription("Comandi privati disponibili solo ai sviluppatori")
		.setDefaultPermission(false)
		.addSubcommand((shell) =>
			shell
				.setName(SubCommands.shell)
				.setDescription("Esegue un comando nel terminal")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Comando da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((evalCmd) =>
			evalCmd
				.setName(SubCommands.evalCmd)
				.setDescription("Esegue del codice")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Codice da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((ram) =>
			ram
				.setName(SubCommands.ram)
				.setDescription("Mostra la RAM utilizzata")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((restartCmd) =>
			restartCmd
				.setName(SubCommands.restartCmd)
				.setDescription("Riavvia il bot")
				.addBooleanOption((process) =>
					process
						.setName(SubCommandOptions.process)
						.setDescription("Se riavviare il processo (default: true)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((shutdown) =>
			shutdown
				.setName(SubCommands.shutdown)
				.setDescription("Spegni il bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((uptimeCmd) =>
			uptimeCmd
				.setName(SubCommands.uptimeCmd)
				.setDescription("Mostra l'uptime del bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((pull) =>
			pull
				.setName(SubCommands.pull)
				.setDescription("Aggiorna il bot")
				.addBooleanOption((rebuild) =>
					rebuild
						.setName(SubCommandOptions.rebuild)
						.setDescription("Ricompila il progetto con i nuovi cambiamenti")
				)
				.addBooleanOption((registerCommands) =>
					registerCommands
						.setName(SubCommandOptions.registerCommands)
						.setDescription("Sincronizza i comandi con Discord")
				)
				.addBooleanOption((restartProcess) =>
					restartProcess
						.setName(SubCommandOptions.restartProcess)
						.setDescription("Riavvia il processo")
				)
				.addBooleanOption((packages) =>
					packages
						.setName(SubCommandOptions.packages)
						.setDescription("Aggiorna i pacchetti")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((cpp) =>
			cpp
				.setName(SubCommands.cpp)
				.setDescription("Compila il codice")
				.addStringOption((code) =>
					code
						.setName(SubCommandOptions.code)
						.setDescription("Codice da compilare")
						.setRequired(true)
				)
				.addStringOption((include) =>
					include
						.setName(SubCommandOptions.include)
						.setDescription(
							"Librerie da includere, separate da virgola (default: iostream)"
						)
				)
				.addStringOption((namespaces) =>
					namespaces
						.setName(SubCommandOptions.namespaces)
						.setDescription("Namespaces da usare (default: std)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((logs) =>
			logs
				.setName(SubCommands.logs)
				.setDescription("Mostra i log del bot")
				.addIntegerOption((lines) =>
					lines
						.setName(SubCommandOptions.lines)
						.setDescription("Numero di righe da mostrare (default: max)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
				)
		)
		.addSubcommand((save) =>
			save
				.setName(SubCommands.save)
				.setDescription("Salva il tag di un utente")
				.addUserOption((user) =>
					user
						.setName(SubCommandOptions.user)
						.setDescription("Utente da salvare")
						.setRequired(true)
				)
				.addStringOption((tag) =>
					tag
						.setName(SubCommandOptions.tag)
						.setDescription("Tag da salvare")
						.setRequired(true)
				)
		)
		.addSubcommand((test) =>
			test.setName(SubCommands.test).setDescription("Un comando di test")
		),
	async run(interaction) {
		await interaction.deferReply({
			ephemeral:
				interaction.options.getBoolean(SubCommandOptions.ephemeral) ?? true,
		});
		const now = Date.now();
		let botUptime: number,
			child: ChildProcess,
			cmd: string,
			code: string,
			commands: string[],
			error: Error | undefined,
			exitCode: number,
			lines: number | null,
			logs: string[],
			memory: NodeJS.MemoryUsage,
			output: string,
			processUptime: number,
			restartProcess: boolean,
			result: string;

		switch (interaction.options.getSubcommand()) {
			case SubCommands.shell:
				cmd = interaction.options.getString(SubCommandOptions.cmd, true);
				child = exec(cmd);
				output = "";
				child.stdout?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.pipe(stderr);
				child.stdout?.pipe(stdout);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				await interaction.editReply({
					content: `Comando eseguito in ${Date.now() - now}ms\n${inlineCode(
						`${cwd()}> ${Util.escapeInlineCode(cmd.slice(0, 2000 - 100))}`
					)}`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "Output",
							description: codeBlock(
								Util.escapeCodeBlock(output.slice(0, 4096 - 7))
							),
							color: exitCode === 0 ? Colors.Green : Colors.Red,
							timestamp: new Date().toISOString(),
						},
					],
				});
				break;
			case SubCommands.evalCmd:
				code = interaction.options.getString(SubCommandOptions.cmd, true);
				try {
					code = prettier
						.format(code, {
							...((await prettier
								.resolveConfig(".prettierrc.json")
								.catch(() => null)) ?? {}),
						})
						.slice(0, -1);
					result = await parseEval(code);
				} catch (e) {
					result = CustomClient.inspect(e);
				}
				void CustomClient.printToStdout(result);
				await interaction.editReply({
					content: `Eval elaborato in ${Date.now() - now}ms`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "Eval output",
							description: codeBlock(
								"js",
								Util.escapeCodeBlock(result).slice(0, 4096 - 9)
							),
							fields: [
								{
									name: "Input",
									value: codeBlock(
										"js",
										Util.escapeCodeBlock(code).slice(0, 1024 - 9)
									),
								},
							],
							color: Colors.Blurple,
							timestamp: new Date().toISOString(),
						},
					],
				});
				break;
			case SubCommands.ram:
				memory = memoryUsage();
				await interaction.editReply({
					content: `Memoria calcolata in ${Date.now() - now}ms`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "RAM",
							description: `${bold("Resident Set Size")}: ${bytesToMb(
								memory.rss
							)} MB\n${bold("Heap Total")}: ${bytesToMb(
								memory.heapTotal
							)} MB\n${bold("Heap Used")}: ${bytesToMb(
								memory.heapUsed
							)} MB\n${bold("External")}: ${bytesToMb(memory.external)} MB`,
							color: Math.round(((memory.rss / 1024 / 1024) * 16777215) / 500),
							timestamp: new Date().toISOString(),
						},
					],
				});
				break;
			case SubCommands.restartCmd:
				if (interaction.options.getBoolean(SubCommandOptions.process) ?? true) {
					await interaction.editReply({
						content: `Sto facendo ripartire il programma con i seguenti argv:\n${argv
							.map((arg) => inlineCode(Util.escapeInlineCode(arg)))
							.join("\n")}`,
					});
					restart(this.client);
				} else {
					this.client.bot.destroy();
					this.client.token = env.DISCORD_TOKEN!;
					await this.client.bot.login();
					await interaction.editReply({
						content: `Ricollegato in ${Date.now() - now}ms.`,
					});
				}
				break;
			case SubCommands.shutdown:
				await interaction.editReply({
					content: `Sto spegnendo il bot...`,
				});
				this.client.bot.destroy();
				return exit(0);
			case SubCommands.uptimeCmd:
				processUptime = Math.round(Date.now() / 1000 - uptime());
				botUptime = Math.round((Date.now() - this.client.bot.uptime!) / 1000);
				await interaction.editReply({
					content: `Process uptime calcolato in ${bold(
						`${Date.now() - now}ms`
					)}`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "Uptime",
							description: `${bold("Processo")}: <t:${processUptime}:${
								TimestampStyles.RelativeTime
							} (<t:${processUptime}:${TimestampStyles.LongDateTime}>)\n${bold(
								"Bot"
							)}: <t:${botUptime}:${
								TimestampStyles.RelativeTime
							}> (<t:${botUptime}:${TimestampStyles.LongDateTime}>)`,
							color: Colors.Blurple,
							timestamp: new Date().toISOString(),
						},
					],
				});
				break;
			case SubCommands.pull:
				output = "";
				commands = ["git pull"];
				restartProcess =
					interaction.options.getBoolean(SubCommandOptions.restartProcess) ??
					false;
				if (interaction.options.getBoolean(SubCommandOptions.packages) ?? false)
					commands.push("rm -r node_modules", "rm package-lock.json", "npm i");
				if (interaction.options.getBoolean(SubCommandOptions.rebuild) ?? false)
					commands.push("npm run build");
				if (
					interaction.options.getBoolean(SubCommandOptions.registerCommands) ??
					false
				)
					commands.push("npm run commands");
				child = exec(commands.join(" && "));
				child.stdout?.on("data", (data) => (output += data));
				child.stderr?.on("data", (data) => (output += data));
				child.stdout?.pipe(stdout);
				child.stderr?.pipe(stderr);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				await interaction.editReply({
					content:
						exitCode === 0
							? `Ho eseguito ${commands.join(" && ")} in ${
									Date.now() - now
							  }ms\n${
									restartProcess
										? "Sto riavviando il processo per rendere effettivi i cambiamenti..."
										: "Il bot è nuovamente pronto all'uso!"
							  }`
							: `Errore durante l'esecuzione di ${inlineCode(
									commands.join(" && ")
							  )}\nCodice di errore: ${exitCode}`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "Output",
							description: codeBlock(
								Util.escapeCodeBlock(output.slice(0, 4096 - 7))
							),
							color: exitCode ? Colors.Red : Colors.Green,
							timestamp: new Date().toISOString(),
						},
					],
				});
				if (restartProcess && exitCode === 0) restart(this.client);
				break;
			case SubCommands.cpp:
				code = `${(
					interaction.options.getString(SubCommandOptions.include) ?? "iostream"
				)
					.split(commaRegex)
					.map((include) => `#include <${include}>`)
					.join("\n")}\n${(
					interaction.options.getString(SubCommandOptions.namespaces) ?? "std"
				)
					.split(commaRegex)
					.map((namespace) => `using namespace ${namespace};`)
					.join("\n")}\n\nint main() {\n\t${interaction.options.getString(
					SubCommandOptions.code,
					true
				)}\n}`;
				error = await new Promise((resolve) => {
					createWriteStream("./tmp/cpp.cpp")
						.once("error", resolve)
						.once("finish", resolve)
						.setDefaultEncoding("utf8")
						.end(code);
				});
				if (error) {
					void CustomClient.printToStderr(error);
					await interaction.editReply({
						content: `Errore durante la creazione del file: ${CustomClient.inspect(
							error
						)}`,
					});
					break;
				}
				child = exec("g++ ./tmp/cpp.cpp -o ./tmp/cpp.exe");
				output = "";
				child.stdout?.on("data", (data) => (output += data));
				child.stderr?.on("data", (data) => (output += data));
				child.stdout?.pipe(stdout);
				child.stderr?.pipe(stderr);
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				unlink("./tmp/cpp.cpp").catch(CustomClient.printToStderr);
				if (exitCode) {
					await interaction.editReply({
						content: `Errore durante la compilazione del codice C++\nCodice di errore: ${exitCode}`,
						embeds: [
							{
								author: {
									name: interaction.user.tag,
									icon_url: interaction.user.displayAvatarURL(),
								},
								title: "Output",
								description: codeBlock(
									Util.escapeCodeBlock(output.slice(0, 4096 - 7))
								),
								color: Colors.Red,
								timestamp: new Date().toISOString(),
							},
							{
								author: {
									name: interaction.user.tag,
									icon_url: interaction.user.displayAvatarURL(),
								},
								title: "Codice C++",
								description: codeBlock(
									Util.escapeCodeBlock(code.slice(0, 4096 - 7))
								),
								color: Colors.Blurple,
								timestamp: new Date().toISOString(),
							},
						],
					});
					break;
				}
				const collector = interaction.channel?.createMessageCollector({
					filter: (m) => m.author.id === interaction.user.id,
				});
				const onData = (data: Buffer) => {
					output += data;
					interaction
						.editReply({
							content: output,
						})
						.catch(CustomClient.printToStderr);
				};

				output = "";
				child = execFile("./tmp/cpp.exe");
				child.stderr?.on("data", onData);
				child.stdout?.on("data", onData);
				stdin.pipe(child.stdin!);
				collector?.on("collect", (message) => {
					const input = `${message.content}\n`;

					message.delete().catch(CustomClient.printToStderr);
					output += input;
					child.stdin?.write(input);
				});
				exitCode = await new Promise((resolve) => {
					child.once("close", resolve);
				});
				collector?.stop();
				unlink("./tmp/cpp.exe").catch(CustomClient.printToStderr);
				await interaction.editReply({
					content: `${output}\n\n**Processo terminato in ${
						Date.now() - now
					}ms con codice ${exitCode}**`,
				});
				break;
			case SubCommands.logs:
				logs = await new Promise<string[]>((resolve) => {
					let data = "";

					createReadStream(`./debug.log`)
						.setEncoding("utf8")
						.on("data", (chunk) => (data += chunk))
						.once("end", () => {
							resolve(data.split("\n"));
						})
						.once("error", (err) => {
							interaction
								.editReply({
									content: `Errore durante la lettura del file di log: ${CustomClient.inspect(
										err
									)}`,
								})
								.catch(CustomClient.printToStderr);
							resolve([]);
						});
				});
				if (!logs.length) break;
				const { length } = logs;

				lines = interaction.options.getInteger(SubCommandOptions.lines);
				if (lines != null && lines > 0)
					logs = logs.slice(Math.max(0, length - lines - 1));
				while (logs.join("\n").length > 4096 - 7) logs.shift();
				await interaction.editReply({
					content: `Logs letti in ${
						Date.now() - now
					}ms\nRighe totali: ${length}\nRighe visualizzate: ${logs.length}`,
					embeds: [
						{
							author: {
								name: interaction.user.tag,
								icon_url: interaction.user.displayAvatarURL(),
							},
							title: "Logs",
							description: codeBlock(
								Util.escapeCodeBlock(logs.join("\n").slice(0, 4096 - 7))
							),
							color: Colors.Blurple,
							timestamp: new Date().toISOString(),
						},
					],
				});
				break;
			case SubCommands.save:
				const tag = normalizeTag(
						interaction.options.getString(SubCommandOptions.tag, true)
					),
					{ id } = interaction.options.getUser(SubCommandOptions.user, true);

				await writeJson("players", {
					...(await importJson("players").catch(() => ({}))),
					[id]: tag,
				})
					.then(() =>
						interaction.editReply({
							content: `Salvato il tag ${tag} per l'utente <@!${id}>`,
							allowedMentions: { users: [id] },
						})
					)
					.catch(({ message }: Error) =>
						interaction.editReply({
							content: message,
						})
					);
				break;
			default:
				await interaction.editReply("Comando non riconosciuto");
		}

		return undefined;
	},
};
