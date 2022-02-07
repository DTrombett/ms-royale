import { Embed } from "@discordjs/builders";
import type { Clan } from "apiroyale";
import { Colors } from "discord.js";
import { env } from "node:process";
import type { EventOptions } from "../../util";
import Constants, {
	CustomClient,
	EventType,
	locationToLocale,
	translate,
} from "../../util";

const constructClanUpdateEmbed = (
	newClan: Clan,
	oldClan: Clan,
	lng?: string
) => {
	const embed = new Embed()
		.setTitle(translate("events.clanUpdate.title", { lng }))
		.setURL(Constants.clanLink(newClan.tag))
		.setAuthor({ name: newClan.name })
		.setThumbnail(newClan.badgeUrl)
		.setColor(Colors.Blurple);

	if (oldClan.name !== newClan.name)
		embed.addField(
			translate("events.clanUpdate.fields.name", {
				lng,
				old: oldClan.name,
				new: newClan.name,
			})
		);
	if (oldClan.description !== newClan.description)
		embed.addField(
			translate("events.clanUpdate.fields.description", {
				lng,
				new: newClan.description,
				old: oldClan.description,
			})
		);
	if (oldClan.badgeId !== newClan.badgeId)
		embed.addField(
			translate("events.clanUpdate.fields.badgeId", {
				lng,
				old: oldClan.badgeId,
				new: newClan.badgeId,
			})
		);
	if (oldClan.locationName !== newClan.locationName)
		embed.addField(
			translate("events.clanUpdate.fields.location", {
				lng,
				old: oldClan.locationName,
				new: newClan.locationName,
			})
		);
	if (oldClan.requiredTrophies !== newClan.requiredTrophies)
		embed.addField(
			translate("events.clanUpdate.fields.requiredTrophies", {
				lng,
				old: oldClan.requiredTrophies,
				new: newClan.requiredTrophies,
			})
		);
	if (oldClan.type !== newClan.type)
		embed.addField(
			translate("events.clanUpdate.fields.type", {
				lng,
				old: oldClan.type,
				new: newClan.type,
			})
		);
	for (const [tag, member] of oldClan.members)
		if (!newClan.members.has(tag))
			embed.addField(
				translate("events.clanUpdate.fields.memberLeft", {
					lng,
					member,
				})
			);
	for (const [tag, member] of newClan.members)
		if (!oldClan.members.has(tag))
			embed.addField(
				translate("events.clanUpdate.fields.memberJoined", {
					lng,
					member,
				})
			);
	return embed;
};

export const event: EventOptions<EventType.APIRoyale, "clanUpdate"> = {
	name: "clanUpdate",
	type: EventType.APIRoyale,
	on(oldClan, newClan) {
		// Prepare the embed only if it's the main clan
		if (newClan.tag !== Constants.mainClanTag()) return;
		/**
		 * The channel to send the embed to
		 */
		const channel = this.client.bot.channels.cache.get(env.CLAN_LOG_CHANNEL!);

		if (channel === undefined || !channel.isText() || !("guild" in channel)) {
			void CustomClient.printToStderr(
				`Clan log channel with id ${env.CLAN_LOG_CHANNEL!} not found`
			);
			return;
		}

		/**
		 * The embed to send
		 */
		const embed = constructClanUpdateEmbed(
			newClan,
			oldClan,
			locationToLocale(newClan.location) ?? channel.guild.preferredLocale
		);

		// Send the embed only if we have at least one field
		if (embed.fields.length)
			channel.send({ embeds: [embed] }).catch(CustomClient.printToStderr);
	},
};
