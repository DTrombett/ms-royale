import { Embed } from "@discordjs/builders";
import { Clan } from "apiroyale";
import { Constants as DiscordConstants, TextChannel } from "discord.js";
import { t } from "i18next";
import Constants, { cast, EventOptions, locationToLocale } from "../util";

const constructClanUpdateEmbed = (newClan: Clan, oldClan: Clan) => {
	const lng = locationToLocale(newClan.location);
	const embed = new Embed()
		.setTitle(t("events.clanUpdate.title", { lng }))
		.setURL(Constants.clanLink(newClan.tag))
		.setAuthor({ name: newClan.name })
		.setThumbnail(newClan.badgeUrl)
		.setColor(DiscordConstants.Colors.BLURPLE);

	if (oldClan.name !== newClan.name)
		embed.addField(
			t("events.clanUpdate.name", {
				lng,
				returnObjects: true,
				old: oldClan.name,
				new: newClan.name,
			})
		);
	if (oldClan.description !== newClan.description)
		embed.addField(
			t("events.clanUpdate.fields.description", {
				lng,
				returnObjects: true,
				new: newClan.description,
				old: oldClan.description,
			})
		);
	if (oldClan.badgeId !== newClan.badgeId)
		embed.addField(
			t("events.clanUpdate.fields.badgeId", {
				lng,
				returnObjects: true,
				old: oldClan.badgeId,
				new: newClan.badgeId,
			})
		);
	if (oldClan.locationName !== newClan.locationName)
		embed.addField(
			t("events.clanUpdate.fields.location", {
				lng,
				returnObjects: true,
				old: oldClan.locationName,
				new: newClan.locationName,
			})
		);
	if (oldClan.requiredTrophies !== newClan.requiredTrophies)
		embed.addField(
			t("events.clanUpdate.fields.requiredTrophies", {
				lng,
				returnObjects: true,
				old: oldClan.requiredTrophies,
				new: newClan.requiredTrophies,
			})
		);
	if (oldClan.type !== newClan.type)
		embed.addField(
			t("events.clanUpdate.fields.type", {
				lng,
				returnObjects: true,
				old: oldClan.type,
				new: newClan.type,
			})
		);
	for (const [tag, member] of oldClan.members)
		if (!newClan.members.has(tag))
			embed.addField(
				t("events.clanUpdate.fields.memberLeft", {
					lng,
					returnObjects: true,
					member,
				})
			);
	for (const [tag, member] of newClan.members)
		if (!oldClan.members.has(tag))
			embed.addField(
				t("events.clanUpdate.fields.memberJoined", {
					lng,
					returnObjects: true,
					member,
				})
			);
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
			channel.send({ embeds: [embed] }).catch(console.error);
	},
};
