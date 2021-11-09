import type { TextChannel } from "discord.js";
import { MessageEmbed } from "discord.js";
import type { EventOptions } from "../types";
import Constants, { cast } from "../util";

export const event: EventOptions<"clanUpdate"> = {
	name: "clanUpdate",
	on(oldClan, newClan) {
		const channel = this.client.channels.cache.get(
			process.env.CLAN_CHANNEL_ID!
		);
		if (!channel) return;
		const embed = new MessageEmbed()
			.setTitle(Constants.clanUpdatedEmbedTitle())
			.setURL(Constants.clanLink(newClan.tag))
			.setAuthor(newClan.name);

		if (oldClan.name !== newClan.name)
			embed.addField(
				Constants.clanNameUpdatedFieldName(),
				Constants.clanNameUpdatedFieldValue(oldClan.name, newClan.name)
			);
		if (oldClan.description !== newClan.description)
			embed.addField(
				Constants.clanDescriptionUpdatedFieldName(),
				Constants.clanDescriptionUpdatedFieldValue(
					oldClan.description,
					newClan.description
				)
			);
		if (oldClan.locationName !== newClan.locationName)
			embed.addField(
				Constants.clanLocationUpdatedFieldName(),
				Constants.clanLocationUpdatedFieldValue(
					oldClan.locationName,
					newClan.locationName
				)
			);
		if (oldClan.requiredTrophies !== newClan.requiredTrophies)
			embed.addField(
				Constants.clanRequiredTrophiesUpdatedFieldName(),
				Constants.clanRequiredTrophiesUpdatedFieldValue(
					oldClan.requiredTrophies,
					newClan.requiredTrophies
				)
			);
		if (oldClan.type !== newClan.type)
			embed.addField(
				Constants.clanTypeUpdatedFieldName(),
				Constants.clanTypeUpdatedFieldValue(oldClan.type, newClan.type)
			);
		for (const [tag, member] of oldClan.members)
			if (!newClan.members.has(tag))
				embed.addField(
					Constants.clanMemberLeftFieldName(member),
					Constants.clanMemberLeftFieldValue(member)
				);
		for (const [tag, member] of newClan.members)
			if (!oldClan.members.has(tag))
				embed.addField(
					Constants.clanMemberJoinedFieldName(member),
					Constants.clanMemberJoinedFieldValue(member)
				);

		cast<TextChannel>(channel);
		if (embed.fields.length > 0)
			channel.send({ embeds: [embed] }).catch(console.error);
	},
};
