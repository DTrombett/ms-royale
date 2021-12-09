import { bold, Embed, time, TimestampStyles } from "@discordjs/builders";
import Collection from "@discordjs/collection";
import type ClientRoyale from "apiroyale";
import type { APITag, FinishedRiverRace } from "apiroyale";
import type { APIEmbedField } from "discord-api-types/v9";
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	SelectMenuInteraction
} from "discord.js";
import {
	Constants as DiscordCostants, MessageActionRow,
	MessageButton
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ButtonActions } from ".";
import Constants from "./Constants";
import normalizeTag from "./normalizeTag";
import { CustomEmojis, Emojis } from "./types";
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
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return interaction
			.reply({
				content: Constants.invalidTag(),
				ephemeral: true,
			})
			.catch(console.error);

	let race;
	if (index !== undefined) race = cache.get(tag)?.at(index);
	if (!race) {
		const log = await client
			.fetchRiverRaceLog({ tag })
			.catch((error: Error) => interaction.reply(error.message))
			.catch(console.error);

		if (!log) return undefined;
		race = index !== undefined ? log.at(index) : log.first();
		for (const [key, value] of log)
			(cache.get(tag) ?? cache.set(tag, new Collection()).get(tag))!.set(
				key,
				value
			);
	}

	if (race === undefined)
		return interaction
			.reply({
				content: "Nessuna guerra trovata.",
				ephemeral: true,
			})
			.catch(console.error);
	const embed = new Embed()
		.setTitle(`Sett. ${race.weekNumber}`)
		.setColor(DiscordCostants.Colors.BLURPLE)
		.setFooter({
			text: "Terminata",
		})
		.setTimestamp(race.finishTime)
		.addFields(
			...race.leaderboard.map<APIEmbedField>((standing) => {
				const values = new Collection<string, string>()
					.set("Punti", `${CustomEmojis.warPoint} ${standing.clan.points}`)
					.set(
						"Trofei guadagnati/persi",
						`${CustomEmojis.warTrophy} ${standing.trophyChange}`
					);

				if (standing.pointsToOvertake != null)
					values.set(
						"Punti necessari per superare il clan in classifica",
						`${CustomEmojis.warPoint} ${standing.pointsToOvertake}`
					);
				if (standing.clan.finishedAt != null)
					values.set(
						"Corsa terminata",
						`${time(
							standing.clan.finishedAt,
							TimestampStyles.LongDateTime
						)} (${time(
							standing.clan.finishedAt,
							TimestampStyles.RelativeTime
						)})`
					);
				values.set(
					"Punteggio del clan",
					`${Emojis.Score} ${standing.clan.score}`
				);
				return {
					name: `${standing.rank}. ${standing.clan.name} (${standing.clan.tag})`,
					value: values.map((v, k) => `${bold(k)}: ${v}`).join("\n"),
				};
			})
		);

	return interaction
		.reply({
			embeds: [embed.toJSON()],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId(
							`${ButtonActions.RiverRaceLog}-${tag}-${
								index !== undefined ? index - 1 : 0
							}`
						)
						.setEmoji(Emojis.BackArrow)
						.setLabel(Constants.backButtonLabel())
						.setStyle(MessageButtonStyles.PRIMARY)
						.setDisabled(index === undefined || index === 0),
					new MessageButton()
						.setCustomId(
							`${ButtonActions.RiverRaceLog}-${tag}-${
								index !== undefined ? index + 1 : 1
							}`
						)
						.setEmoji(Emojis.ForwardArrow)
						.setLabel(Constants.afterButtonLabel())
						.setStyle(MessageButtonStyles.PRIMARY)
				),
			],
			ephemeral,
		})
		.catch(console.error);
};

export default riverRaceLog;
