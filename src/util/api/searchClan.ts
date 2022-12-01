import type { ClientRoyale, SearchClanOptions } from "apiroyale";
import type { Snowflake } from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { Util } from "discord.js";
import type { APIMethod } from "..";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { createActionId } from "../customId";
import translate from "../translate";
import { Emojis } from "../types";

/**
 * Search a clan.
 * @param client - The client
 * @param options - The options for the search
 * @param otherOptions - Additional options
 * @returns A promise that resolves with the message options
 */
export const searchClan: APIMethod<
	SearchClanOptions,
	{ id: Snowflake }
> = async (
	client: ClientRoyale,
	options: SearchClanOptions,
	{ ephemeral, lng, id }: { lng?: string; ephemeral?: boolean; id: Snowflake }
) => {
	const results = await client.clans.search(options).catch((error: Error) => {
		void CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!("items" in results)) return results;
	if (!results.items.length)
		return {
			content: translate("commands.clan.search.notFound", { lng }),
			ephemeral: true,
		};

	return {
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.SelectMenu,
						options: results.items.map((clan) => ({
							...translate("commands.clan.search.menu.options", {
								lng,
								members: clan.members,
								name: clan.name,
								tag: clan.tag,
								score: clan.clanScore,
								donations: clan.donationsPerWeek,
								requiredTrophies: clan.requiredTrophies,
								location: clan.location.name,
							}),
							value: clan.tag,
						})),
						placeholder: translate("commands.clan.search.menu.placeholder", {
							lng,
						}),
						custom_id: createActionId("clan"),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						"sc",
						{
							label: translate("common.back", { lng }),
							disabled: results.paging?.cursors.before === undefined,
							emoji: Emojis.BackArrow,
						},
						undefined,
						results.paging?.cursors.before ?? ""
					),
					createActionButton(
						"sc",
						{
							label: translate("common.next", { lng }),
							disabled: results.paging?.cursors.after === undefined,
							emoji: Emojis.ForwardArrow,
						},
						results.paging?.cursors.after ?? ""
					),
				],
			},
		],
		content: `Risultati per la seguente ricerca richiesta da <@${id}>:\n\n**Nome**: ${
			options.name != null ? Util.escapeMarkdown(options.name) : "-"
		}\n**Id posizione**: ${
			options.location?.toString() ?? "-"
		}\n**Minimo membri**: ${options.minMembers ?? "-"}\n**Massimo membri**: ${
			options.maxMembers ?? "-"
		}\n**Punteggio minimo**: ${options.minScore ?? "-"}`,
		ephemeral,
	};
};
