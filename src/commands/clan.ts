import { SlashCommandBuilder } from "@discordjs/builders";
import type { Clan, ClanMember } from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import {
	Constants,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
} from "discord.js";
import type { CommandOptions } from "../types";
import { Emojis, CustomEmojis } from "../types";
import { capitalize, SelectMenuActions, time, validateTag } from "../util";

const getMaxNameLength = (member: ClanMember) =>
	100 - `#${member.rank}  (${member.tag})`.length;

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("clan")
		.setDescription("Get the info about a clan")
		.addStringOption((input) =>
			input
				.setRequired(true)
				.setName("tag")
				.setDescription(
					"The tag of the clan. This is case insensitive and the # is optional"
				)
		),
	run(interaction) {
		let tag = interaction.options.getString("tag", true).toUpperCase();

		if (!tag.startsWith("#")) tag = `#${tag}`;
		if (!validateTag(tag))
			return interaction.reply({
				content:
					"Hai inserito un tag non valido!\nI caratteri validi nei tag sono: 0, 2, 8, 9, P, Y, L, Q, G, R, J, C, U, V",
				ephemeral: true,
			});
		this.client.clans
			.fetch(tag, { maxAge: time.millisecondsPerMinute * 5 })
			.then((clan: Clan) =>
				interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(clan.name)
							.setDescription(clan.description)
							.addField(
								"Trofei guerra tra clan",
								`${CustomEmojis.warTrophy}${clan.warTrophies}`
							)
							.addField("Posizione", clan.locationName, true)
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
							.setColor(Constants.Colors.BLUE)
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
											)} - ${Emojis.MoneyWithWings}${
												member.donationsPerWeek
											} - ${Emojis.Trophy}${member.trophies}`,
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
								.setCustomId(`${SelectMenuActions.MemberInfo}-${clan.tag}`)
						),
					],
				})
			)
			.catch((error: Error) => interaction.reply(error.message));
		return undefined;
	},
};
