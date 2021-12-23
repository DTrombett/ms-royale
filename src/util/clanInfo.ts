import { Embed } from "@discordjs/builders";
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
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import Constants, { TIME } from "./Constants";
import { buildCustomButtonId, buildCustomMenuId } from "./customId";
import { getLocaleConstants } from "./locales";
import normalizeTag from "./normalizeTag";
import { ButtonActions, CustomEmojis, Emojis, MenuActions } from "./types";
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
	const constants = getLocaleConstants(interaction);

	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return interaction
			.reply({
				content: constants.INVALID_TAG,
				ephemeral: true,
			})
			.catch(console.error);

	const clan = await client.clans
		.fetch(tag, {
			maxAge: TIME.millisecondsPerMinute * 5,
		})
		.catch((error: Error) => {
			console.error(error);
			return interaction.reply({ content: error.message, ephemeral: true });
		})
		.catch(console.error);

	if (!clan) return undefined;
	const embed = new Embed()
		.setTitle(Constants.clanInfoEmbedTitle(clan))
		.setDescription(clan.description)
		.setColor(DiscordCostants.Colors.BLUE)
		.setFooter({ text: constants.LAST_UPDATED })
		.setTimestamp(clan.lastUpdate)
		.setThumbnail(clan.badgeUrl)
		.setURL(Constants.clanInfoUrl(clan));

	embed
		.addField({
			name: constants.CLAN_INFO_WAR_TROPHIES,
			value: Constants.clanInfoWarTrophiesFieldValue(clan.warTrophies),
		})
		.addField({
			name: constants.CLAN_INFO_LOCATION,
			value: Constants.clanInfoLocationFieldValue(clan.location),
			inline: true,
		})
		.addField({
			name: constants.CLAN_INFO_REQUIRED_TROPHIES,
			value: Constants.clanInfoRequiredTrophiesFieldValue(
				clan.requiredTrophies
			),
			inline: true,
		})
		.addField({
			name: constants.CLAN_INFO_WEEKLY_DONATIONS,
			value: Constants.clanInfoDonationsPerWeekFieldValue(
				clan.donationsPerWeek
			),
			inline: true,
		})
		.addField({
			name: constants.CLAN_INFO_SCORE,
			value: Constants.clanInfoScoreFieldValue(clan.score),
			inline: true,
		})
		.addField({
			name: constants.CLAN_INFO_TYPE,
			value: Constants.clanInfoTypeFieldValue(clan.type),
			inline: true,
		})
		.addField({
			name: constants.CLAN_INFO_MEMBER_COUNT,
			value: Constants.clanInfoMemberCountFieldValue(clan.memberCount),
		});

	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.addOptions(
				clan.members.first(25).map((member) => ({
					description: Constants.clanMemberDescription(member),
					emoji: CustomEmojis.user,
					label: Constants.clanMemberLabel(member),
					value: member.tag,
				}))
			)
			.setPlaceholder(constants.CLAN_MEMBERS)
			.setCustomId(buildCustomMenuId(MenuActions.PlayerInfo))
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.RiverRaceLog, tag))
			.setEmoji(Emojis.Log)
			.setLabel(constants.RIVER_RACE_LOG)
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
