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
		const embed = new MessageEmbed()
			.setTitle("Clan aggiornato!")
			.setURL(`https://royaleapi.com/clan/${newClan.tag.slice(1)}`)
			.setAuthor(newClan.name);

		if (oldClan.name !== newClan.name)
			embed.addField("Nome", `**${oldClan.name}** => **${newClan.name}**`);
		if (oldClan.description !== newClan.description)
			embed.addField(
				"Descrizione",
				`__${oldClan.description}__\n=> __${newClan.description}__`
			);
		if (oldClan.badge !== newClan.badge)
			embed.addField("ID decorazione", `${oldClan.badge} => ${newClan.badge}`);
		if (oldClan.locationName !== newClan.locationName)
			embed.addField(
				"Posizione",
				`_${oldClan.locationName}_ => _${newClan.locationName}_`
			);
		if (oldClan.requiredTrophies !== newClan.requiredTrophies)
			embed.addField(
				"Trofei richiesti",
				`🏆 ${oldClan.requiredTrophies} => 🏆 ${newClan.requiredTrophies}`
			);
		if (oldClan.type !== newClan.type)
			embed.addField(
				"Tipo",
				`${ClanType[oldClan.type]} => ${ClanType[newClan.type]}`
			);
		for (const [tag, member] of oldClan.members)
			if (!newClan.members.has(tag))
				embed.addField(
					`${member.role} left`,
					`${member.name} (${member.tag}) - 🏆 ${member.trophies} (#${member.rank})`
				);
		for (const [tag, member] of newClan.members)
			if (!oldClan.members.has(tag))
				embed.addField(
					`New ${member.role}`,
					`${member.name} (${member.tag}) - 🏆 ${member.trophies} (#${member.rank})`
				);

		cast<TextChannel>(channel);
		if (embed.fields.length > 0)
			channel.send({ embeds: [embed] }).catch(console.error);
	});

setInterval(() => {
	client.clans.fetch("#L2Y2L2PC", { maxAge: 1000 * 60 }).catch(console.error);
}, 1000 * 60 * 2);

void client.login();
