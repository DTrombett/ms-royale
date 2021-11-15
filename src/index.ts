import { config } from "dotenv";
import CustomClient from "./CustomClient";
import Constants, {
	MenuActions,
	clanInfo,
	time,
	ButtonActions,
	getSearchOptions,
	handleSearchResults,
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
		if (interaction.isCommand())
			client.commands.get(interaction.commandName)?.run(interaction);
		if (interaction.isSelectMenu()) {
			const [action, ...args] = interaction.customId.split("-") as [
				MenuActions,
				...(string | undefined)[]
			];

			switch (action) {
				case MenuActions.ClanInfo:
					void clanInfo(client, interaction, interaction.values[0], true);
					break;
				case MenuActions.MemberInfo:
					void interaction.reply(
						`Tag clan: ${args[0]!}\nTag membro: ${interaction.values[0]}`
					);
					break;
				default:
					console.error(`Received unknown action: ${action as string}`);
					break;
			}
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
				default:
					console.error(`Received unknown action: ${action as string}`);
					break;
			}
		}
	});
