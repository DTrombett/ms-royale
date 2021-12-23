import { Embed } from "@discordjs/builders";
import Collection from "@discordjs/collection";
import type ClientRoyale from "apiroyale";
import type { APITag, FinishedRiverRace } from "apiroyale";
import type { APIEmbedField } from "discord-api-types/v9";
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
import Constants from "./Constants";
import { buildCustomButtonId } from "./customId";
import { getLocaleConstants } from "./locales";
import normalizeTag from "./normalizeTag";
import { ButtonActions, Emojis, MenuActions } from "./types";
import validateTag from "./validateTag";

const cache = new Collection<
	APITag,
	Collection<FinishedRiverRace["id"], FinishedRiverRace>
>();

export const riverRaceLog = async (
	client: ClientRoyale,
	interaction:
		| ButtonInteraction
		| CommandInteraction
		| ContextMenuInteraction
		| SelectMenuInteraction,
	tag: string,
	index?: number,
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

	let last: boolean, race;
	if (index !== undefined) race = cache.get(tag)?.at(index);
	if (!race) {
		const log = await client
			.fetchRiverRaceLog({ tag })
			.catch((error: Error) => {
				console.error(error);
				return interaction.reply({ content: error.message, ephemeral: true });
			})
			.catch(console.error);

		if (!log) return undefined;
		race = index !== undefined ? log.at(index) : log.first();
		last = index === log.size - 1;
		for (const [key, value] of log)
			(cache.get(tag) ?? cache.set(tag, new Collection()).get(tag))!.set(
				key,
				value
			);
	}
	last ??= index === (cache.get(tag)?.size ?? 0) - 1;

	if (race === undefined)
		return interaction
			.reply({
				content: constants.RIVER_RACE_NOT_FOUND,
				ephemeral: true,
			})
			.catch(console.error);
	const embed = new Embed()
		.setTitle(Constants.riverRaceInfoTitle(race))
		.setColor(DiscordCostants.Colors.BLURPLE)
		.setFooter({
			text: constants.RIVER_RACE_FINISHED_AT,
		})
		.setTimestamp(race.finishTime)
		.addFields(
			...race.leaderboard.map<APIEmbedField>(
				Constants.riverRaceInfoStandingField
			)
		);
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(MenuActions.PlayerInfo)
			.setPlaceholder("Lista partecipanti")
			.addOptions(
				[...race.leaderboard.get(tag)!.clan.participants.values()]
					.filter((p) => p.medals)
					.sort((a, b) => b.medals - a.medals)
					.slice(0, 25)
					.map((p, i) => ({
						description: Constants.riverRaceParticipantDescription(p),
						label: Constants.riverRaceParticipantLabel(p, i + 1),
						value: p.tag,
					}))
			)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(constants.CLAN)
			.setStyle(MessageButtonStyles.PRIMARY)
	);
	const row3 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					index !== undefined ? index + 1 : 1,
					interaction.user.id
				)
			)
			.setEmoji(Emojis.BackArrow)
			.setLabel(constants.BACK)
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(last),
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					index !== undefined ? index - 1 : 0,
					interaction.user.id
				)
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(constants.AFTER)
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(index === undefined || index === 0)
	);

	return {
		embeds: [embed],
		components: [row1, row2, row3],
		ephemeral,
	};
};

export default riverRaceLog;
