import {
	bold,
	codeBlock,
	Embed,
	inlineCode,
	SlashCommandBuilder,
	time,
	TimestampStyles,
} from "@discordjs/builders";
import { Constants, Util } from "discord.js";
import { Buffer } from "node:buffer";
import { exec, execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
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
import { CustomClient, parseEval, restart } from "../util";

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
}

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
		.addSubcommand((test) =>
			test.setName(SubCommands.test).setDescription("Un comando di test")
		),
	async run(interaction) {
		await interaction.deferReply({
			ephemeral:
				interaction.options.getBoolean(SubCommandOptions.ephemeral) ?? true,
		});

		const now = Date.now();
		switch (interaction.options.getSubcommand()) {
			case SubCommands.shell:
				const cmd = interaction.options.getString(SubCommandOptions.cmd, true);
				const child = exec(cmd);
				let output = "";
				child.stdout?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.on("data", (data: Buffer) => (output += data.toString()));
				child.stderr?.pipe(stderr);
				child.stdout?.pipe(stdout);
				child.once("close", (code) =>
					interaction
						.editReply({
							content: `Comando eseguito in ${bold(
								`${Date.now() - now}ms`
							)}\n${inlineCode(
								`${cwd()}> ${Util.escapeInlineCode(cmd.slice(0, 2000 - 100))}`
							)}`,
							embeds: [
								new Embed()
									.setAuthor({
										name: interaction.user.tag,
										iconURL: interaction.user.displayAvatarURL(),
									})
									.setTitle("Output")
									.setDescription(
										codeBlock(Util.escapeCodeBlock(output.slice(0, 4096 - 7)))
									)
									.setColor(
										code === 0 ? Constants.Colors.GREEN : Constants.Colors.RED
									)
									.setTimestamp(),
							],
						})
						.catch(CustomClient.printToStderr)
				);
				break;
			case SubCommands.evalCmd:
				let code = interaction.options.getString(SubCommandOptions.cmd, true),
					parsed: string;
				try {
					code = prettier
						.format(code, {
							...((await prettier
								.resolveConfig(".prettierrc.json")
								.catch(() => null)) ?? {}),
						})
						.slice(0, -1);
					parsed = await parseEval(code);
				} catch (e) {
					parsed = CustomClient.inspect(e);
				}
				void CustomClient.printToStdout(parsed);
				const evalEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("Eval")
					.setDescription(
						codeBlock("js", Util.escapeCodeBlock(parsed).slice(0, 4096 - 9))
					)
					.addField({
						name: "Code",
						value: codeBlock(
							"js",
							Util.escapeCodeBlock(code).slice(0, 1024 - 9)
						),
					})
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Eval elaborato in ${bold(`${Date.now() - now}ms`)}`,
					embeds: [evalEmbed],
				});
				break;
			case SubCommands.ram:
				const mem = memoryUsage();
				const ramEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("RAM")
					.setDescription(
						`${bold("Resident Set Size")}: ${
							Math.round((mem.rss / 1024 / 1024) * 100) / 100
						} MB\n${bold("Heap Total")}: ${
							Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
						} MB\n${bold("Heap Used")}: ${
							Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100
						} MB\n${bold("External")}: ${
							Math.round((mem.external / 1024 / 1024) * 100) / 100
						} MB`
					)
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Memoria calcolata in ${Date.now() - now}ms`,
					embeds: [ramEmbed],
				});
				break;
			case SubCommands.restartCmd:
				if (interaction.options.getBoolean(SubCommandOptions.process) ?? true) {
					const args = argv
						.map((arg) => inlineCode(Util.escapeInlineCode(arg)))
						.join("\n");

					await interaction.editReply({
						content: `Sto facendo ripartire il programma con i seguenti argv:\n${args}`,
					});
					restart(this.client);
				} else {
					this.client.bot.destroy();
					this.client.token = env.DISCORD_TOKEN!;
					await this.client.bot.login();
					await interaction.editReply({
						content: `Ricollegato in ${bold(`${Date.now() - now}ms`)}.`,
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
				const processUptime = new Date(Date.now() - uptime() * 1000);
				const botUptime = new Date(Date.now() - this.client.bot.uptime!);
				const uptimeEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("Uptime")
					.setDescription(
						`${bold("Processo")}: ${time(
							processUptime,
							TimestampStyles.RelativeTime
						)} (${time(processUptime)})\n${bold("Bot")}: ${time(
							botUptime,
							TimestampStyles.RelativeTime
						)} (${time(botUptime)})`
					)
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Process uptime calcolato in ${bold(
						`${Date.now() - now}ms`
					)}`,
					embeds: [uptimeEmbed],
				});
				break;
			case SubCommands.pull:
				let out = "";
				const commands = ["git pull"];
				const restartProcess =
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
				const childProcess = exec(commands.join(" && "));

				childProcess.stdout?.on("data", (data) => (out += data));
				childProcess.stderr?.on("data", (data) => (out += data));
				childProcess.stdout?.pipe(stdout);
				childProcess.stderr?.pipe(stderr);
				childProcess.once("close", (closeCode) => {
					interaction
						.editReply({
							content:
								closeCode === 0
									? `Ho eseguito ${commands.join(" && ")} in ${bold(
											`${Date.now() - now}ms`
									  )}\n${
											restartProcess
												? "Sto riavviando il processo per rendere effettivi i cambiamenti..."
												: "Il bot è nuovamente pronto all'uso!"
									  }`
									: `Errore durante l'esecuzione di ${bold(
											commands.join(" && ")
									  )}\nCodice di errore: ${closeCode ?? "N/A"}`,
							embeds: [
								new Embed()
									.setAuthor({
										name: interaction.user.tag,
										iconURL: interaction.user.displayAvatarURL(),
									})
									.setTitle("Output")
									.setDescription(
										codeBlock(Util.escapeCodeBlock(out.slice(0, 4096 - 7)))
									)
									.setColor(
										closeCode === 0
											? Constants.Colors.GREEN
											: Constants.Colors.RED
									)
									.setTimestamp(),
							],
						})
						.catch(CustomClient.printToStderr);
					if (restartProcess) restart(this.client);
				});
				break;
			case SubCommands.cpp:
				const commaRegex = /,\s{0,}/g;
				const cppCode = `${(
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
				const successful = await new Promise<boolean>((resolve) => {
					createWriteStream("./tmp/cpp.cpp")
						.once("error", (err) => {
							resolve(false);
							void CustomClient.printToStderr(err);
							interaction
								.editReply({
									content: `Errore durante la creazione del file temporaneo: ${CustomClient.inspect(
										err
									)}`,
								})
								.catch(CustomClient.printToStderr);
						})
						.once("finish", () => {
							resolve(true);
						})
						.setDefaultEncoding("utf8")
						.end(cppCode);
				});

				if (!successful) break;
				const subProcess = exec("g++ ./tmp/cpp.cpp -o ./tmp/cpp.exe");
				let out2 = "";

				subProcess.stdout?.on("data", (data) => (out2 += data));
				subProcess.stderr?.on("data", (data) => (out2 += data));
				subProcess.stdout?.pipe(stdout);
				subProcess.stderr?.pipe(stderr);
				subProcess.once("close", (closeCode) => {
					if (closeCode === 0) {
						const collector = interaction.channel?.createMessageCollector({
								filter: (m) => m.author.id === interaction.user.id,
							}),
							subProcess2 = execFile("./tmp/cpp.exe");
						let content = "",
							errOut = "";

						collector?.on("collect", (message) => {
							const input = `${message.content}\n`;

							if (message.deletable)
								message.delete().catch(CustomClient.printToStderr);
							content += input;
							subProcess2.stdin?.write(input);
						});
						subProcess2.stderr?.on("data", (data: Buffer) => (errOut += data));
						subProcess2.stdout?.on("data", (data: Buffer) => {
							content += data;
							interaction
								.editReply({
									content,
								})
								.catch(CustomClient.printToStderr);
						});
						subProcess2.stdout?.pipe(stdout);
						subProcess2.stderr?.pipe(stderr);
						stdin.pipe(subProcess2.stdin!);
						subProcess2.once("close", (closeCode2) => {
							collector?.stop();
							if (closeCode2 === 0)
								interaction
									.followUp({
										content: `Processo eseguito con successo in ${bold(
											`${Date.now() - now}ms`
										)}`,
									})
									.catch(CustomClient.printToStderr);
							else
								interaction
									.followUp({
										content: `Errore durante l'esecuzione del processo: ${errOut}`,
									})
									.catch(CustomClient.printToStderr);
						});
					} else
						interaction
							.editReply({
								content: `Errore durante la compilazione del codice C++\nCodice di errore: ${
									closeCode ?? "N/A"
								}`,
								embeds: [
									new Embed()
										.setAuthor({
											name: interaction.user.tag,
											iconURL: interaction.user.displayAvatarURL(),
										})
										.setTitle("Output")
										.setDescription(
											codeBlock(Util.escapeCodeBlock(out2.slice(0, 4096 - 7)))
										)
										.setColor(Constants.Colors.RED)
										.setTimestamp(),
									new Embed()
										.setAuthor({
											name: interaction.user.tag,
											iconURL: interaction.user.displayAvatarURL(),
										})
										.setTitle("Codice C++")
										.setDescription(
											codeBlock(
												"cpp",
												Util.escapeCodeBlock(cppCode.slice(0, 4096 - 7))
											)
										)
										.setColor(Constants.Colors.BLURPLE)
										.setTimestamp(),
								],
							})
							.catch(CustomClient.printToStderr);
				});
				break;
			default:
				await interaction.editReply("Comando non riconosciuto");
		}

		return undefined;
	},
};
