import { config } from "dotenv";
import CustomClient from "./CustomClient";
import Constants, { time } from "./util";

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
	});
