import type ClientRoyale from "apiroyale";
import type { ClanMember } from "apiroyale";
import { ClanType, ClanMemberRole } from "apiroyale";
import Constants, { MenuActions, time } from "./Constants";
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction,
} from "discord.js";
import {
	MessageEmbed,
	MessageActionRow,
	MessageSelectMenu,
	Constants as DiscordCostants,
} from "discord.js";
import { CustomEmojis, Emojis } from "../types";
import { validateTag } from "./validateTag";
import capitalize from "./capitalize";

const getMaxNameLength = (member: ClanMember) =>
	100 - `#${member.rank}  (${member.tag})`.length;

export const clanInfo = (
	client: ClientRoyale,
	interaction:
		| ButtonInteraction
		| CommandInteraction
		| ContextMenuInteraction
		| SelectMenuInteraction,
	tag: string,
	ephemeral?: boolean
) => {
	tag = tag.toUpperCase();
	if (!tag.startsWith("#")) tag = `#${tag}`;
	if (!validateTag(tag))
		return interaction
			.reply({
				content: Constants.invalidTag(),
				ephemeral: true,
			})
			.catch(console.error);
	return client.clans
		.fetch(tag, { maxAge: time.millisecondsPerMinute * 5 })
		.then((clan) =>
			interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle(clan.name)
						.setDescription(clan.description)
						.addField(
							"Trofei guerra tra clan",
							`${CustomEmojis.warTrophy}${clan.warTrophies}`
						)
						.addField("Posizione", clan.location.name, true)
						.addField(
							"Trofei richiesti",
							clan.requiredTrophies.toString(),
							true
						)
						.addField(
							"Donazioni a settimana",
							clan.donationsPerWeek.toString(),
							true
						)
						.addField("Punteggio del clan", clan.score.toString(), true)
						.addField("Tipo", capitalize(ClanType[clan.type]), true)
						.addField("Tag del clan", clan.tag, true)
						.addField("Membri", `${clan.memberCount.toString()}/50`)
						.setColor(DiscordCostants.Colors.BLUE)
						.setFooter("Ultimo aggiornamento")
						.setTimestamp(clan.lastUpdate)
						.setURL(`https://royaleapi.com/clan/${clan.tag.slice(1)}`),
				],
				components: [
					new MessageActionRow().addComponents(
						new MessageSelectMenu()
							.addOptions(
								clan.members.first(25).map((member) => {
									const maxLength = getMaxNameLength(member);

									return {
										description: `${capitalize(
											ClanMemberRole[member.role]
										)} - ${Emojis.MoneyWithWings}${member.donationsPerWeek} - ${
											Emojis.Trophy
										}${member.trophies}`,
										emoji: CustomEmojis.clanMember,
										label: `#${member.rank} ${
											member.name.length <= maxLength
												? member.name
												: `${member.name.slice(0, maxLength - 3)}...`
										} (${member.tag})`,
										value: member.tag,
									};
								})
							)
							.setPlaceholder("Membri del clan")
							.setCustomId(`${MenuActions.MemberInfo}-${clan.tag}`)
					),
				],
				ephemeral,
			})
		)
		.catch((error: Error) => interaction.reply(error.message))
		.catch(console.error);
};
