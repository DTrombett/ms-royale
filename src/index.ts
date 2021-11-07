import { Constants } from "discord.js";
import { config } from "dotenv";
import { ClientRoyale } from "./ClientRoyale";
import { loadCommands } from "./util/loadCommands";

config();

const client = new ClientRoyale();

console.time("Client online");
client.on(Constants.Events.CLIENT_READY, async (onlineClient) => {
	await Promise.all([
		onlineClient.application.fetch(),
		loadCommands(client),
		client.clans.fetch("#L2Y2L2PC"),
	]);
	console.timeEnd("Client online");
});
client.on(Constants.Events.INTERACTION_CREATE, (interaction) => {
	if (interaction.isCommand())
		client.commands.get(interaction.commandName)?.run(interaction);
});

void client.login();
