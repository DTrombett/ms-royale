import { Embed } from "@discordjs/builders";
import Collection from "@discordjs/collection";
import type ClientRoyale from "apiroyale";
import { APITag, FinishedRiverRace, RiverRaceLogResults } from "apiroyale";
import type { APIEmbedField, Snowflake } from "discord-api-types/v9";
import {
	Constants as DiscordCostants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { t } from "i18next";
import { buildCustomButtonId } from "./customId";
import normalizeTag from "./normalizeTag";
import { ButtonActions, Emojis, MenuActions } from "./types";
import validateTag from "./validateTag";

const cache = new Collection<
	APITag,
	Collection<FinishedRiverRace["id"], FinishedRiverRace>
>();

export const riverRaceLog = async (
	client: ClientRoyale,
	tag: string,
	{
		ephemeral,
		lng,
		index,
		id,
	}: { lng?: string; ephemeral?: boolean; index?: number; id: Snowflake }
) => {
	tag = normalizeTag(tag);
	if (!validateTag(tag))
		return {
			content: t("common.invalidTag", { lng }),
			ephemeral: true,
		};

	let last: boolean, race;
	if (index !== undefined) race = cache.get(tag)?.at(index);
	if (!race) {
		const log = await client
			.fetchRiverRaceLog({ tag })
			.catch((error: Error) => {
				console.error(error);
				return { content: error.message, ephemeral: true };
			});

		if (!(log instanceof RiverRaceLogResults)) return log;
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
		return {
			content: t("commands.clan.riverRaceLog.notFound", { lng }),
			ephemeral: true,
		};
	const embed = new Embed()
		.setTitle(t("commands.clan.riverRaceLog.title", { lng, race }))
		.setColor(DiscordCostants.Colors.BLURPLE)
		.setFooter({
			text: t("commands.clan.riverRaceLog.footer", { lng }),
		})
		.setTimestamp(race.finishTime)
		.addFields(
			...race.leaderboard.map<APIEmbedField>((standing) =>
				t("commands.clan.riverRaceLog.field", {
					lng,
					returnObjects: true,
					standing,
					finishedAt: standing.clan.finishedAt
						? Math.round(standing.clan.finishedAt.getTime() / 1000)
						: "",
					finished: (standing.clan.finishedAt !== null).toString(),
					participants: standing.clan.participants.filter(
						(p) => p.decksUsed > 0
					).size,
				})
			)
		);
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(MenuActions.PlayerInfo)
			.setPlaceholder(t("commands.clan.riverRaceLog.menu.placeholder", { lng }))
			.addOptions(
				[...race.leaderboard.get(tag)!.clan.participants.values()]
					.filter((p) => p.medals)
					.sort((a, b) => b.medals - a.medals)
					.slice(0, 25)
					.map((participant, i) => ({
						...t("commands.clan.riverRaceLog.menu.options", {
							lng,
							returnObjects: true,
							participant,
							rank: i + 1,
						}),
						value: participant.tag,
					}))
			)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(buildCustomButtonId(ButtonActions.ClanInfo, tag))
			.setEmoji(Emojis.CrossedSwords)
			.setLabel(t("commands.clan.riverRaceLog.button.label", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
	);
	const row3 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					`${index !== undefined ? index + 1 : 1}`,
					id
				)
			)
			.setEmoji(Emojis.BackArrow)
			.setLabel(t("common.back", { lng }))
			.setStyle(MessageButtonStyles.PRIMARY)
			.setDisabled(last),
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.RiverRaceLog,
					tag,
					`${index !== undefined ? index - 1 : 0}`,
					id
				)
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(t("common.next", { lng }))
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
