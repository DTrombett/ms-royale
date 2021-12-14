import type ClientRoyale from "apiroyale";
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
import Constants, { ButtonActions, MenuActions, time } from "./Constants";
import { buildCustomButtonId, buildCustomMenuId } from "./customId";
import normalizeTag from "./normalizeTag";
import { CustomEmojis, Emojis } from "./types";
import validateTag from "./validateTag";

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
		.catch((error: Error) => {
			console.error(error);
			return interaction.reply({ content: error.message, ephemeral: true });
		})
		.catch(console.error);

	if (!clan) return undefined;
	const embed = new MessageEmbed()
		.setTitle(Constants.clanInfoEmbedTitle(clan))
		.setDescription(clan.description)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter(Constants.clanInfoFooter())
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(Constants.clanInfoUrl(clan));

	embed
		.addField(
			Constants.clanInfoWarTrophiesFieldName(),
			Constants.clanInfoWarTrophiesFieldValue(clan.warTrophies)
		)
		.addField(
			Constants.clanInfoLocationFieldName(),
			Constants.clanInfoLocationFieldValue(clan.location),
			true
		)
		.addField(
			Constants.clanInfoRequiredTrophiesFieldName(),
			Constants.clanInfoRequiredTrophiesFieldValue(clan.requiredTrophies),
			true
		)
		.addField(
			Constants.clanInfoDonationsPerWeekFieldName(),
			Constants.clanInfoDonationsPerWeekFieldValue(clan.donationsPerWeek),
			true
		)
		.addField(
			Constants.clanInfoScoreFieldName(),
			Constants.clanInfoScoreFieldValue(clan.score),
			true
		)
		.addField(
			Constants.clanInfoTypeFieldName(),
			Constants.clanInfoTypeFieldValue(clan.type),
			true
		)
		.addField(
			Constants.clanInfoMemberCountFieldName(),
			Constants.clanInfoMemberCountFieldValue(clan.memberCount)
		);
	const menu = new MessageSelectMenu().addOptions(
		clan.members.first(25).map((member) => ({
			description: Constants.clanMemberDescription(member),
			emoji: CustomEmojis.user,
			label: Constants.clanMemberLabel(member),
			value: member.tag,
		}))
	);
	const row1 = new MessageActionRow().addComponents(
		menu
			.setPlaceholder(Constants.clanMembersPlaceholder())
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.RiverRaceLog, tag))
			.setEmoji(Emojis.Log)
			.setLabel(Constants.riverRaceLogLabel())
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
