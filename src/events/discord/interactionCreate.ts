import {
	ButtonActions,
	clanInfo,
	CustomClient,
	destructureCustomButtonId,
	destructureCustomMenuId,
	EventOptions,
	EventType,
	getInteractionLocale,
	getSearchOptions,
	MenuActions,
	playerInfo,
	riverRaceLog,
	searchClan,
} from "../../util";

export const event: EventOptions<EventType.Discord, "interactionCreate"> = {
	name: "interactionCreate",
	type: EventType.Discord,
	async on(interaction) {
		if (this.client.blocked) return;
		if (interaction.isCommand()) {
			void this.client.commands.get(interaction.commandName)?.run(interaction);
			return;
		}
		if (interaction.isAutocomplete()) {
			void this.client.commands
				.get(interaction.commandName)
				?.autocomplete(interaction);
			return;
		}
		if (interaction.isSelectMenu()) {
			const { action } = destructureCustomMenuId(interaction.customId);
			const lng = getInteractionLocale(interaction);

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
					await interaction.reply({
						...(await playerInfo(this.client, interaction.values[0], {
							ephemeral: true,
							lng,
						})),
					});
					break;
				default:
					CustomClient.printToStderr(
						`Received unknown action: ${action as string}`
					);
					break;
			}
			return;
		}
		if (interaction.isButton()) {
			const { action, args } = destructureCustomButtonId(interaction.customId);
			const lng = getInteractionLocale(interaction);
			let messageOptions;

			switch (action) {
				case ButtonActions.NextPage:
					messageOptions = await searchClan(
						this.client,
						getSearchOptions(interaction, { after: args[0] }),
						{ lng, ephemeral: true }
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
						{ lng, ephemeral: true }
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
				default:
					CustomClient.printToStderr(
						`Received unknown action: ${action as string}`
					);
					break;
			}
		}
	},
};
