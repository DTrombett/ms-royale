import { SlashCommandBuilder } from "@discordjs/builders";
import type { ClanMember, SearchClanOptions } from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import {
	Constants as DiscordContants,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import type { CommandOptions } from "../types";
import { Emojis, CustomEmojis } from "../types";
import { capitalize, SelectMenuActions, time, validateTag } from "../util";

const getMaxNameLength = (member: ClanMember) =>
	100 - `#${member.rank}  (${member.tag})`.length;

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("clan")
		.setDescription("Get the info about a clan")
		.addSubcommand((info) =>
			info
				.setName("info")
				.setDescription("Get the info about a clan using its tag")
				.addStringOption((tag) =>
					tag
						.setName("tag")
						.setDescription(
							"The tag of the clan. This is case insensitive and the # is optional"
						)
						.setRequired(true)
				)
		)
		.addSubcommand((search) =>
			search
				.setName("search")
				.setDescription("Search for a clan")
				.addStringOption((name) =>
					name
						.setName("name")
						.setDescription(
							"Il nome del clan. Deve essere lungo almeno 3 caratteri."
						)
				)
				.addStringOption((location) =>
					location
						.setName("location")
						.setDescription("La sede del clan. Puoi fornire il suo id o nome.")
				)
				.addIntegerOption((minMembers) =>
					minMembers
						.setName("min-members")
						.setDescription("Numero minimo di membri nel clan.")
				)
				.addIntegerOption((maxMembers) =>
					maxMembers
						.setName("max-members")
						.setDescription("Numero massimo di membri nel clan.")
				)
				.addIntegerOption((minScore) =>
					minScore.setName("min-score").setDescription("Punti clan minimi.")
				)
		),
	run(interaction) {
		if (interaction.options.getSubcommand() === "search") {
			const location = interaction.options.getString("location")?.toLowerCase();
			const options: SearchClanOptions = {
				limit: 25,
				location:
					location != null
						? this.client.locations.get(location) ??
						  this.client.locations.find(
								(l) => l.id === location || l.name.toLowerCase() === location
						  )
						: undefined,
				maxMembers: interaction.options.getInteger("max-members") ?? undefined,
				minMembers: interaction.options.getInteger("min-members") ?? undefined,
				minScore: interaction.options.getInteger("min-score") ?? undefined,
				name: interaction.options.getString("name") ?? undefined,
			};

			return this.client.clans
				.search(options)
				.then((results) => {
					if (!results.size)
						return interaction.reply(
							"Non ho trovato nessun clan con queste caratteristiche!"
						);

					return interaction.reply({
						components: [
							new MessageActionRow().addComponents(
								new MessageSelectMenu()
									.setCustomId("clanInfo")
									.addOptions(
										results.map((clan) => ({
											label: clan.name,
											value: clan.tag,
											description: `${Emojis.People}${clan.memberCount}/50 - ${Emojis.Score}${clan.score} - ${Emojis.MoneyWithWings}${clan.donationsPerWeek} - ${Emojis.Trophy}${clan.requiredTrophies} - ${Emojis.Location}${clan.location.name}`,
										}))
									)
									.setPlaceholder(
										`${
											results.paging.cursors.after !== undefined ||
											results.paging.cursors.before !== undefined
												? "25+"
												: results.size
										} risultati trovati...`
									)
							),
							new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(results.paging.cursors.before ?? "before")
									.setEmoji(Emojis.BackArrow)
									.setLabel("Precedente")
									.setDisabled(results.paging.cursors.before === undefined)
									.setStyle(MessageButtonStyles.PRIMARY),
								new MessageButton()
									.setCustomId(results.paging.cursors.after ?? "after")
									.setEmoji(Emojis.ForwardArrow)
									.setLabel("Successivo")
									.setDisabled(results.paging.cursors.after === undefined)
									.setStyle(MessageButtonStyles.PRIMARY)
							),
						],
						content:
							"Scegli un clan dall'elenco qui sotto per vederne le info.",
					});
				})
				.catch((error: Error) => interaction.reply(error.message));
		}
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
							.setColor(DiscordContants.Colors.BLUE)
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
