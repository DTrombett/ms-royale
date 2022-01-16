import {
	ButtonActions,
	clanInfo,
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
		if (interaction.isCommand()) {
			void this.client.commands.get(interaction.commandName)?.run(interaction);
			void CustomClient.printToStdout(
				`Received command ${interactionCommand(interaction)}`,
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
				)}`,
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
				)}] and values [${interaction.values.join(", ")}]`,
				true
			);
			switch (action) {
				case MenuActions.ClanInfo:
					interaction
						.reply({
							...(await clanInfo(this.client, interaction.values[0], {
								lng,
								ephemeral: true,
							})),
						})
						.catch(CustomClient.printToStderr);
					break;
				case MenuActions.PlayerInfo:
					interaction
						.reply({
							...(await playerInfo(this.client, interaction.values[0], {
								ephemeral: true,
								lng,
							})),
						})
						.catch(CustomClient.printToStderr);
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown action: ${action as string}`,
						true
					);
					break;
			}
			return;
		}
		if (interaction.isButton()) {
			const { action, args } = destructureCustomButtonId(interaction.customId);
			const lng = getInteractionLocale(interaction);
			let messageOptions;

			void CustomClient.printToStdout(
				`Received button interaction ${action} with args [${args.join(", ")}]`,
				true
			);
			switch (action) {
				case ButtonActions.NextPage:
					messageOptions = await searchClan(
						this.client,
						getSearchOptions(interaction, { after: args[0] }),
						{ lng, ephemeral: true, id: interaction.user.id }
					);

					if (
						interaction.user.id ===
						interaction.message.content.split("<@")[1].split(">")[0]
					)
						interaction
							.update({
								...messageOptions,
							})
							.catch(CustomClient.printToStderr);
					else
						interaction
							.reply({
								...messageOptions,
								content: interaction.message.content,
							})
							.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.PreviousPage:
					messageOptions = await searchClan(
						this.client,
						getSearchOptions(interaction, { before: args[0] }),
						{ lng, ephemeral: true, id: interaction.user.id }
					);

					if (
						interaction.user.id ===
						interaction.message.content.split("<@")[1].split(">")[0]
					)
						interaction
							.update({
								...messageOptions,
							})
							.catch(CustomClient.printToStderr);
					else
						interaction
							.reply({
								...messageOptions,
								content: interaction.message.content,
							})
							.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.RiverRaceLog:
					messageOptions = await riverRaceLog(this.client, args[0]!, {
						lng,
						ephemeral: true,
						id: interaction.user.id,
						index: args[1] !== undefined ? Number(args[1]) : undefined,
					});
					if (interaction.user.id === args[2])
						interaction
							.update(messageOptions)
							.catch(CustomClient.printToStderr);
					else
						interaction.reply(messageOptions).catch(CustomClient.printToStderr);
					break;
				case ButtonActions.ClanInfo:
					interaction
						.reply(
							await clanInfo(this.client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.CurrentRiverRace:
					interaction
						.reply(
							await currentRiverRace(this.client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.PlayerInfo:
					interaction
						.reply(
							await playerInfo(this.client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.PlayerAchievements:
					interaction
						.reply(
							await playerAchievements(this.client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				case ButtonActions.PlayerUpcomingChests:
					interaction
						.reply(
							await playerUpcomingChests(this.client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
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
