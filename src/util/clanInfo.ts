import type ClientRoyale from "apiroyale";
import type { ClanMember } from "apiroyale";
import { ClanMemberRole, ClanType } from "apiroyale";
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction,
} from "discord.js";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import capitalize from "./capitalize";
import Constants, { ButtonActions, MenuActions, time } from "./Constants";
import normalizeTag from "./normalizeTag";
import { CustomEmojis, Emojis } from "./types";
import validateTag from "./validateTag";

const getMaxNameLength = (member: ClanMember) =>
	100 - `#${member.rank}  (${member.tag})`.length;

/**
 * Displays information about a clan.
 * @param client - The client
 * @param interaction - The interaction
 * @param tag - The tag of the clan
 * @param ephemeral - Whether the message should be ephemeral
 */
export const clanInfo = async (
	client: ClientRoyale,
	interaction:
		| ButtonInteraction
		| CommandInteraction
		| ContextMenuInteraction
		| SelectMenuInteraction,
	tag: string,
	ephemeral?: boolean
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return interaction
			.reply({
				content: Constants.invalidTag(),
				ephemeral: true,
			})
			.catch(console.error);

	const clan = await client.clans
		.fetch(tag, {
			maxAge: time.millisecondsPerMinute * 5,
		})
		.catch((error: Error) =>
			interaction.reply({ content: error.message, ephemeral: true })
		)
		.catch(console.error);

	if (!clan) return undefined;
	const embed = new MessageEmbed()
		.setTitle(clan.name)
		.setDescription(clan.description)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter("Ultimo aggiornamento")
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(`https://royaleapi.com/clan/${clan.tag.slice(1)}`)
		.addField(
			"Trofei guerra tra clan",
			`${CustomEmojis.warTrophy} ${clan.warTrophies}`
		)
		.addField("Posizione", `${Emojis.Location} ${clan.locationName}`, true)
		.addField(
			"Trofei richiesti",
			`${Emojis.Trophy} ${clan.requiredTrophies}`,
			true
		)
		.addField(
			"Donazioni a settimana",
			`${CustomEmojis.donations} ${clan.donationsPerWeek}`,
			true
		)
		.addField("Punteggio del clan", `${Emojis.Score} ${clan.score}`, true)
		.addField("Tipo", capitalize(ClanType[clan.type]), true)
		.addField("Tag del clan", clan.tag, true)
		.addField("Membri", `${CustomEmojis.clanMembers} ${clan.memberCount}/50`);
	const menu = new MessageSelectMenu().addOptions(
		clan.members.first(25).map((member) => {
			const maxLength = getMaxNameLength(member);

			return {
				description: `${capitalize(ClanMemberRole[member.role])} - ${
					Emojis.MoneyWithWings
				}${member.donationsPerWeek} - ${Emojis.Trophy}${member.trophies}`,
				emoji: CustomEmojis.user,
				label: `#${member.rank} ${
					member.name.length <= maxLength
						? member.name
						: `${member.name.slice(0, maxLength - 3)}...`
				} (${member.tag})`,
				value: member.tag,
			};
		})
	);
	const row1 = new MessageActionRow().addComponents(
		menu
			.setPlaceholder("Membri del clan")
			.setCustomId(`${MenuActions.PlayerInfo}-${clan.tag}`)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`${ButtonActions.RiverRaceLog}-${clan.tag}`)
			.setEmoji(Emojis.Log)
			.setLabel("Guerre passate")
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return interaction
		.reply({
			embeds: [embed],
			components: [row1, row2],
			ephemeral,
		})
		.catch(console.error);
};
