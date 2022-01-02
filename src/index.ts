import { config } from "dotenv";
import { use } from "i18next";
import Backend from "i18next-fs-backend";
import { fileURLToPath, URL } from "node:url";
import CustomClient from "./CustomClient";
import Constants, {
	ButtonActions,
	clanInfo,
	destructureCustomButtonId,
	destructureCustomMenuId,
	getInteractionLocale,
	getSearchOptions,
	searchClan,
	MenuActions,
	playerInfo,
	riverRaceLog,
} from "./util";

config();
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();

await use(Backend).init({
	backend: {
		loadPath: fileURLToPath(
			new URL("../locales/{{lng}}/{{ns}}.json", import.meta.url)
		),
	},
	cleanCode: true,
	fallbackLng: "it",
	defaultNS: "translation",
	lng: "it",
	ns: ["translation"],
	debug: true,
});

client.discord
	.on("ready", async (discord) => {
		setInterval(() => {
			client.clans.fetch(Constants.mainClanTag()).catch(console.error);
		}, Constants.mainClanFetchInterval());
		await Promise.all([
			discord.application.fetch(),
			client.clans.fetch(Constants.mainClanTag()),
		]);
		console.timeEnd(Constants.clientOnlineLabel());
	})
	.on("interactionCreate", async (interaction) => {
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
			const { action } = destructureCustomMenuId(interaction.customId);
			const lng = getInteractionLocale(interaction);

			switch (action) {
				case MenuActions.ClanInfo:
					interaction
						.reply({
							...(await clanInfo(client, interaction.values[0], {
								lng,
								ephemeral: true,
							})),
						})
						.catch(console.error);
					break;
				case MenuActions.PlayerInfo:
					await interaction.reply({
						...(await playerInfo(client, interaction.values[0], {
							ephemeral: true,
							lng,
						})),
					});
					break;
				default:
					console.error(`Received unknown action: ${action as string}`);
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
						client,
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
							.catch(console.error);
					else
						interaction
							.reply({
								...messageOptions,
								content: interaction.message.content,
							})
							.catch(console.error);
					break;
				case ButtonActions.PreviousPage:
					messageOptions = await searchClan(
						client,
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
							.catch(console.error);
					else
						interaction
							.reply({
								...messageOptions,
								content: interaction.message.content,
							})
							.catch(console.error);
					break;
				case ButtonActions.RiverRaceLog:
					messageOptions = await riverRaceLog(client, args[0]!, {
						lng,
						ephemeral: true,
						id: interaction.user.id,
						index: args[1] !== undefined ? Number(args[1]) : undefined,
					});
					if (interaction.user.id === args[2])
						interaction.update(messageOptions).catch(console.error);
					else interaction.reply(messageOptions).catch(console.error);
					break;
				case ButtonActions.ClanInfo:
					interaction
						.reply(
							await clanInfo(client, args[0]!, {
								lng: getInteractionLocale(interaction),
								ephemeral: true,
							})
						)
						.catch(console.error);
					break;
				default:
					console.error(`Received unknown action: ${action as string}`);
					break;
			}
		}
	});
