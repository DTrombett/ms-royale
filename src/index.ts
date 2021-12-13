import { config } from "dotenv";
import CustomClient from "./CustomClient";
import Constants, {
	ButtonActions,
	clanInfo,
	getSearchOptions,
	handleSearchResults,
	MenuActions,
	playerInfo,
	riverRaceLog,
	time,
} from "./util";

config();
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();

client.discord
	.on("ready", async (discord) => {
		setInterval(() => {
			client.clans
				.fetch(Constants.mainClanTag(), { maxAge: time.millisecondsPerMinute })
				.catch(console.error);
		}, Constants.mainClanFetchInterval());
		await Promise.all([
			discord.application.fetch(),
			client.clans.fetch(Constants.mainClanTag()),
		]);
		console.timeEnd(Constants.clientOnlineLabel());
	})
	.on("interactionCreate", (interaction) => {
		if (interaction.isCommand()) {
			void client.commands.get(interaction.commandName)?.run(interaction);
			return;
		}
		if (interaction.isAutocomplete()) {
			void client.commands
				.get(interaction.commandName)
				?.autocomplete(interaction);
			return;
		}
		if (interaction.isSelectMenu()) {
			const [action] = interaction.customId.split("-") as [
				MenuActions,
				...(string | undefined)[]
			];

			switch (action) {
				case MenuActions.ClanInfo:
					void clanInfo(client, interaction, interaction.values[0], true);
					break;
				case MenuActions.PlayerInfo:
					void playerInfo(client, interaction, interaction.values[0], true);
					break;
				default:
					console.error(`Received unknown action: ${action as string}`);
					break;
			}
			return;
		}
		if (interaction.isButton()) {
			const [action, ...args] = interaction.customId.split("-") as [
				ButtonActions,
				...(string | undefined)[]
			];

			switch (action) {
				case ButtonActions.NextPage:
					void client.clans
						.search(getSearchOptions(interaction, { after: args[0] }))
						.then((results) =>
							interaction.user.id ===
							interaction.message.content.split("<@")[1].split(">")[0]
								? interaction.update(handleSearchResults(results))
								: interaction.reply({
										...handleSearchResults(results),
										content: interaction.message.content,
										ephemeral: true,
								  })
						);
					break;
				case ButtonActions.PreviousPage:
					void client.clans
						.search(getSearchOptions(interaction, { before: args[0] }))
						.then((results) =>
							interaction.user.id ===
							interaction.message.content.split("<@")[1].split(">")[0]
								? interaction.update(handleSearchResults(results))
								: interaction.reply({
										...handleSearchResults(results),
										content: interaction.message.content,
										ephemeral: true,
								  })
						);
					break;
				case ButtonActions.RiverRaceLog:
					void riverRaceLog(
						client,
						interaction,
						args[0]!,
						args[1] !== undefined ? Number(args[1]) : undefined,
						true
					).then(
						(result) =>
							result &&
							(interaction.user.id === args[2]
								? interaction.update(result)
								: interaction.reply(result))
					);
					break;
				case ButtonActions.ClanInfo:
					void clanInfo(client, interaction, args[0]!, true);
					break;
				default:
					console.error(`Received unknown action: ${action as string}`);
					break;
			}
		}
	});
