import type { TextChannel } from "discord.js";
import { Constants, MessageEmbed } from "discord.js";
import { config } from "dotenv";
import { ClientRoyale } from "./ClientRoyale";
import { ClanType } from "./ClientRoyale/util";
import { cast } from "./util";
import { loadCommands } from "./util/loadCommands";

config();

const client = new ClientRoyale();

console.time("Client online");
client
	.on(Constants.Events.CLIENT_READY, async (onlineClient) => {
		await Promise.all([
			onlineClient.application.fetch(),
			loadCommands(client),
			client.clans.fetch("#L2Y2L2PC"),
		]);
		console.timeEnd("Client online");
	})
	.on(Constants.Events.INTERACTION_CREATE, (interaction) => {
		if (interaction.isCommand())
			client.commands.get(interaction.commandName)?.run(interaction);
	})
	.on("clanUpdate", (oldClan, newClan) => {
		const channel = client.channels.cache.get(process.env.CLAN_CHANNEL_ID!);
		if (!channel) return;
		console.log(oldClan, newClan);
		const embed = new MessageEmbed()
			.setTitle("Clan Update")
			.setAuthor(newClan.name);

		if (oldClan.name !== newClan.name)
			embed.addField("Name", `${oldClan.name} => ${newClan.name}`);
		if (oldClan.tag !== newClan.tag)
			embed.addField("Tag", `${oldClan.tag} => ${newClan.tag}`);
		if (oldClan.description !== newClan.description)
			embed.addField(
				"Description",
				`${oldClan.description} => ${newClan.description}`
			);
		if (oldClan.badge !== newClan.badge)
			embed.addField("Badge", `${oldClan.badge} => ${newClan.badge}`);
		if (oldClan.locationName !== newClan.locationName)
			embed.addField(
				"Location",
				`${oldClan.locationName} => ${newClan.locationName}`
			);
		if (oldClan.requiredTrophies !== newClan.requiredTrophies)
			embed.addField(
				"Required Trophies",
				`${oldClan.requiredTrophies} => ${newClan.requiredTrophies}`
			);
		if (oldClan.type !== newClan.type)
			embed.addField(
				"Type",
				`${ClanType[oldClan.type]} => ${ClanType[newClan.type]}`
			);
		for (const [tag, member] of oldClan.members)
			if (!newClan.members.has(tag))
				embed.addField(
					"Member Left",
					`${member.name} (${member.tag}) - ${member.trophies} (${member.rank})`
				);
		for (const [tag, member] of newClan.members)
			if (!oldClan.members.has(tag))
				embed.addField(
					"Member Joined",
					`${member.name} (${member.tag}) - ${member.trophies} (${member.rank})`
				);

		cast<TextChannel>(channel);
		if (embed.fields.length > 0)
			channel.send({ embeds: [embed] }).catch(console.error);
	});

setInterval(() => {
	client.clans.fetch("#L2Y2L2PC", { maxAge: 1000 * 59 }).catch(console.error);
}, 1000 * 60);

void client.login();
