import { Embed } from "@discordjs/builders";
import type { Clan } from "apiroyale";
import type { TextChannel } from "discord.js";
import { Constants as DiscordConstants } from "discord.js";
import type { EventOptions } from "../util";
import Constants, { cast } from "../util";

const constructClanUpdateEmbed = (newClan: Clan, oldClan: Clan) => {
	const embed = new Embed()
		.setTitle(Constants.clanUpdatedEmbedTitle())
		.setURL(Constants.clanLink(newClan.tag))
		.setAuthor({ name: newClan.name })
		.setThumbnail(newClan.badgeUrl)
		.setColor(DiscordConstants.Colors.BLURPLE);

	if (oldClan.name !== newClan.name)
		embed.addField({
			name: Constants.clanNameUpdatedFieldName(),
			value: Constants.clanNameUpdatedFieldValue(oldClan.name, newClan.name),
		});
	if (oldClan.description !== newClan.description)
		embed.addField({
			name: Constants.clanDescriptionUpdatedFieldName(),
			value: Constants.clanDescriptionUpdatedFieldValue(
				oldClan.description,
				newClan.description
			),
		});
	if (oldClan.badgeId !== newClan.badgeId)
		embed.addField({
			name: Constants.clanBadgeIdUpdatedFieldName(),
			value: Constants.clanBadgeIdUpdatedFieldValue(
				oldClan.badgeId,
				newClan.badgeId
			),
		});
	if (oldClan.locationName !== newClan.locationName)
		embed.addField({
			name: Constants.clanLocationUpdatedFieldName(),
			value: Constants.clanLocationUpdatedFieldValue(
				oldClan.locationName,
				newClan.locationName
			),
		});
	if (oldClan.requiredTrophies !== newClan.requiredTrophies)
		embed.addField({
			name: Constants.clanRequiredTrophiesUpdatedFieldName(),
			value: Constants.clanRequiredTrophiesUpdatedFieldValue(
				oldClan.requiredTrophies,
				newClan.requiredTrophies
			),
		});
	if (oldClan.type !== newClan.type)
		embed.addField({
			name: Constants.clanTypeUpdatedFieldName(),
			value: Constants.clanTypeUpdatedFieldValue(oldClan.type, newClan.type),
		});
	for (const [tag, member] of oldClan.members)
		if (!newClan.members.has(tag))
			embed.addField({
				name: Constants.clanMemberLeftFieldName(),
				value: Constants.clanMemberLeftFieldValue(member),
			});
	for (const [tag, member] of newClan.members)
		if (!oldClan.members.has(tag))
			embed.addField({
				name: Constants.clanMemberJoinedFieldName(),
				value: Constants.clanMemberJoinedFieldValue(member),
			});
	return embed;
};

export const event: EventOptions<"clanUpdate"> = {
	name: "clanUpdate",
	on(oldClan, newClan) {
		// Prepare the embed only if it's the main clan
		if (newClan.tag !== Constants.mainClanTag()) return;
		/**
		 * The channel to send the embed to
		 */
		const channel = this.client.discord.channels.cache.get(
			process.env.CLAN_CHANNEL_ID!
		);

		if (!channel) return;
		/**
		 * The embed to send
		 */
		const embed = constructClanUpdateEmbed(newClan, oldClan);

		cast<TextChannel>(channel);
		// Send the embed only if we have at least one field
		if (embed.fields.length)
			channel.send({ embeds: [embed.toJSON()] }).catch(console.error);
	},
};
