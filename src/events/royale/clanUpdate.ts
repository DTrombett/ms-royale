import type { Clan } from "apiroyale";
import type { APIEmbed } from "discord-api-types/v10";
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
	const embed: APIEmbed = {
		title: translate("events.clanUpdate.title", { lng }),
		url: Constants.clanLink(newClan.tag),
		author: { name: newClan.name },
		thumbnail: { url: newClan.badgeUrl },
		color: Colors.Blurple,
		fields: [],
	};

	if (oldClan.name !== newClan.name)
		embed.fields!.push(
			translate("events.clanUpdate.fields.name", {
				lng,
				old: oldClan.name,
				new: newClan.name,
			})
		);
	if (oldClan.description !== newClan.description)
		embed.fields!.push(
			translate("events.clanUpdate.fields.description", {
				lng,
				new: newClan.description,
				old: oldClan.description,
			})
		);
	if (oldClan.badgeId !== newClan.badgeId)
		embed.fields!.push(
			translate("events.clanUpdate.fields.badgeId", {
				lng,
				old: oldClan.badgeId,
				new: newClan.badgeId,
			})
		);
	if (oldClan.locationName !== newClan.locationName)
		embed.fields!.push(
			translate("events.clanUpdate.fields.location", {
				lng,
				old: oldClan.locationName,
				new: newClan.locationName,
			})
		);
	if (oldClan.requiredTrophies !== newClan.requiredTrophies)
		embed.fields!.push(
			translate("events.clanUpdate.fields.requiredTrophies", {
				lng,
				old: oldClan.requiredTrophies,
				new: newClan.requiredTrophies,
			})
		);
	if (oldClan.type !== newClan.type)
		embed.fields!.push(
			translate("events.clanUpdate.fields.type", {
				lng,
				old: oldClan.type,
				new: newClan.type,
			})
		);
	embed.fields!.push(
		...oldClan.members
			.filter(({ tag }) => !newClan.members.has(tag))
			.map((member) =>
				translate("events.clanUpdate.fields.memberLeft", {
					lng,
					member,
				})
			),
		...newClan.members
			.filter(({ tag }) => !oldClan.members.has(tag))
			.map((member) =>
				translate("events.clanUpdate.fields.memberJoined", {
					lng,
					member,
				})
			)
	);
	embed.fields = embed.fields!.slice(0, 25);
	return embed;
};

export const event: EventOptions<EventType.APIRoyale, "clanUpdate"> = {
	name: "clanUpdate",
	type: EventType.APIRoyale,
	on(oldClan, newClan) {
		// Prepare the embed only if it's the main clan
		if (newClan.tag !== Constants.mainClanTag) return;
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
		if (embed.fields!.length)
			channel.send({ embeds: [embed] }).catch(CustomClient.printToStderr);
	},
};
