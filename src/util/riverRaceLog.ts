import { bold, Embed, time, TimestampStyles } from "@discordjs/builders";
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
import Constants, { ButtonActions, MenuActions } from "./Constants";
import { buildCustomButtonId } from "./customId";
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
				content: "Nessuna guerra trovata.",
				ephemeral: true,
			})
			.catch(console.error);
	const embed = new Embed()
		.setTitle(`Stagione ${race.seasonId} - Settimana ${race.weekNumber}`)
		.setColor(DiscordCostants.Colors.BLURPLE)
		.setFooter({
			text: "Guerra terminata il",
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
				values.set(
					"Partecipanti",
					`${CustomEmojis.clanMembers} ${
						standing.clan.participants.filter((p) => Boolean(p.medals)).size
					}`
				);

				return {
					name: `${standing.rank}. ${standing.clan.name} (${standing.clan.tag})`,
					value: values.map((v, k) => `${bold(k)}: ${v}`).join("\n"),
				};
			})
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
						description: `${Emojis.medal} ${p.medals} - ${Emojis.Boat}${Emojis.Dagger} ${p.boatAttacks} - ${Emojis.Deck} ${p.decksUsed}`,
						label: `#${i + 1} ${p.name} (${p.tag})`,
						value: p.tag,
					}))
			)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.Info)
			.setLabel("Info clan")
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
			.setLabel(Constants.backButtonLabel())
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(last),
		new MessageButton()
			.setCustomId(
				`${ButtonActions.RiverRaceLog}-${tag}-${
					index !== undefined ? index - 1 : 0
				}-${interaction.user.id}`
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(Constants.afterButtonLabel())
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(index === undefined || index === 0)
	);

	return {
		embeds: [embed.toJSON()],
		components: [row1, row2, row3],
		ephemeral,
	};
};

export default riverRaceLog;
