import { GuildChannel } from "discord.js";
import type {
	ButtonActions,
	EventOptions,
	MenuActions,
	SortMethod,
} from "../../util";
import {
	clanInfo,
	clanMembers,
	currentRiverRace,
	CustomClient,
	EventType,
	getInteractionLocale,
	getSearchOptions,
	interactionCommand,
	parseActionId,
	playerAchievements,
	playerInfo,
	playerUpcomingChests,
	riverRaceLog,
	searchClan,
} from "../../util";

export const event: EventOptions<EventType.Discord, "interactionCreate"> = {
	name: "interactionCreate",
	type: EventType.Discord,
	async on(interaction) {
		if (this.client.blocked) {
			void CustomClient.printToStderr(
				"Received interactionCreate event, but client is blocked."
			);
			return;
		}
		if (interaction.isChatInputCommand()) {
			void this.client.commands.get(interaction.commandName)?.run(interaction);
			void CustomClient.printToStdout(
				`Received command \`${interactionCommand(interaction)}\` from ${
					interaction.user.tag
				} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			return;
		}
		if (interaction.isAutocomplete()) {
			void this.client.commands
				.get(interaction.commandName)
				?.autocomplete(interaction);
			void CustomClient.printToStdout(
				`Received autocomplete request for command ${interactionCommand(
					interaction
				)} from ${interaction.user.tag} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			return;
		}
		if (interaction.isSelectMenu()) {
			const { action, args } = parseActionId<keyof MenuActions>(
				interaction.customId
			);
			const lng = getInteractionLocale(interaction);

			void CustomClient.printToStdout(
				`Received select menu interaction ${action} with args [${args.join(
					", "
				)}] and values [${interaction.values.join(", ")}] from ${
					interaction.user.tag
				} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			switch (action) {
				case "clan":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply({
								...(await clanInfo(this.client, interaction.values[0], {
									lng,
								})),
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case "player":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply({
								...(await playerInfo(this.client, interaction.values[0], {
									lng,
								})),
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case "members":
					(interaction.user.id === args[1]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply({
								...(await clanMembers(this.client, args[0]!, {
									lng,
									sort: interaction.values[0] as SortMethod,
									id: args[1]!,
								})),
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown action: ${action as string}`,
						true
					);
					await interaction.deferUpdate();
			}
			return;
		}
		if (interaction.isButton()) {
			const { action, args } = parseActionId<keyof ButtonActions>(
				interaction.customId
			);
			const lng = getInteractionLocale(interaction);

			void CustomClient.printToStdout(
				`Received button interaction ${action} with args [${args.join(
					", "
				)}] from ${interaction.user.tag} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			switch (action) {
				case "after":
					(interaction.user.id ===
					interaction.message.content.split("<@")[1].split(">")[0]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply({
								...(await searchClan(
									this.client,
									getSearchOptions(interaction, { after: args[0] }),
									{ lng, id: interaction.user.id }
								)),
								content: interaction.message.content,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case "before":
					(interaction.user.id ===
					interaction.message.content.split("<@")[1].split(">")[0]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply({
								...(await searchClan(
									this.client,
									getSearchOptions(interaction, { before: args[0] }),
									{ lng, id: interaction.user.id }
								)),
								content: interaction.message.content,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case "rl":
					(interaction.user.id === args[2]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply({
								...(await riverRaceLog(this.client, args[0], {
									lng,
									ephemeral: true,
									id: interaction.user.id,
									index: args[1] !== undefined ? Number(args[1]) : undefined,
								})),
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case "ci":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply(
								await clanInfo(this.client, args[0], {
									lng: getInteractionLocale(interaction),
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				case "cm":
					(interaction.user.id === args[1]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply(
								await clanMembers(this.client, args[0], {
									lng: getInteractionLocale(interaction),
									index: args[2] !== undefined ? Number(args[2]) : undefined,
									sort: args[3],
									id: interaction.user.id,
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				case "cr":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply(
								await currentRiverRace(this.client, args[0], {
									lng: getInteractionLocale(interaction),
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				case "pi":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply(
								await playerInfo(this.client, args[0], {
									lng: getInteractionLocale(interaction),
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				case "ai":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply(
								await playerAchievements(this.client, args[0], {
									lng: getInteractionLocale(interaction),
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				case "uc":
					interaction
						.deferReply({ ephemeral: true })
						.then(async () =>
							interaction.editReply(
								await playerUpcomingChests(this.client, args[0], {
									lng: getInteractionLocale(interaction),
								})
							)
						)
						.catch(CustomClient.printToStderr);
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown action: ${action as string}`,
						true
					);
					await interaction.deferUpdate();
			}
		}
	},
};
