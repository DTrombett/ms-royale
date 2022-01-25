import { GuildChannel } from "discord.js";
import {
	ButtonActions,
	clanInfo,
	// clanMembers,
	currentRiverRace,
	CustomClient,
	destructureCustomButtonId,
	destructureCustomMenuId,
	EventOptions,
	EventType,
	getInteractionLocale,
	getSearchOptions,
	interactionCommand,
	MenuActions,
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
			const { action, args } = destructureCustomMenuId(interaction.customId);
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
				case MenuActions.ClanInfo:
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
				case MenuActions.PlayerInfo:
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
				default:
					void CustomClient.printToStderr(
						`Received unknown action: ${action as string}`,
						true
					);
					await interaction.deferReply({ ephemeral: true });
					break;
			}
			return;
		}
		if (interaction.isButton()) {
			const { action, args } = destructureCustomButtonId(interaction.customId);
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
				case ButtonActions.NextPage:
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
				case ButtonActions.PreviousPage:
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
				case ButtonActions.RiverRaceLog:
					(interaction.user.id === args[2]
						? interaction.deferUpdate()
						: interaction.deferReply({ ephemeral: true })
					)
						.then(async () =>
							interaction.editReply({
								...(await riverRaceLog(this.client, args[0]!, {
									lng,
									ephemeral: true,
									id: interaction.user.id,
									index: args[1] !== undefined ? Number(args[1]) : undefined,
								})),
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.ClanInfo:
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
				case ButtonActions.ClanMembers:
					interaction
						.reply({
							content: "Questo comando non è ancora disponibile!",
							ephemeral: true,
						})
						.catch(CustomClient.printToStderr);
					// interaction
					// 	.deferReply({ ephemeral: true })
					// 	.then(async () =>
					// 		interaction.editReply(
					// 			await clanMembers(this.client, args[0], {
					// 				lng: getInteractionLocale(interaction),
					// 			})
					// 		)
					// 	)
					// 	.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.CurrentRiverRace:
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
				case ButtonActions.PlayerInfo:
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
				case ButtonActions.PlayerAchievements:
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
				case ButtonActions.PlayerUpcomingChests:
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
					break;
			}
		}
	},
};
