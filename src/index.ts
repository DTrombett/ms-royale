import { config } from "dotenv";
import CustomClient from "./CustomClient";
import Constants, { SelectMenuActions, time } from "./util";

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
			return client.commands.get(interaction.commandName)?.run(interaction);
		if (interaction.isSelectMenu()) {
			const [action, ...args] = interaction.customId.split("-");

			if (action === SelectMenuActions.MemberInfo)
				return interaction.reply(
					`Tag clan: ${args[0]}\nTag membro: ${interaction.values[0]}`
				);
		}
		return undefined;
	});
