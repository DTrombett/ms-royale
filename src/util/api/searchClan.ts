import type { ClientRoyale, SearchClanOptions } from "apiroyale";
import { ClanSearchResults } from "apiroyale";
import { ComponentType } from "discord-api-types/v10";
import type { Snowflake } from "discord.js";
import { Util } from "discord.js";
import type { APIMethod } from "..";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomMenuId } from "../customId";
import translate from "../translate";
import { ButtonActions, MenuActions } from "../types";

/**
 * Search a clan.
 * @param client - The client
 * @param tag - The options for the search
 * @param options - Additional options
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

	if (!(results instanceof ClanSearchResults)) return results;
	if (!results.size)
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
						options: results.map((clan) => ({
							...translate("commands.clan.search.menu.options", {
								lng,
								clan,
							}),
							value: clan.tag,
						})),
						placeholder: translate("commands.clan.search.menu.placeholder", {
							lng,
						}),
						custom_id: buildCustomMenuId(MenuActions.ClanInfo),
					},
				],
			},
			{
				type: ComponentType.ActionRow,
				components: [
					createActionButton(
						ButtonActions.PreviousPage,
						{
							label: translate("common.back", { lng }),
							disabled: results.paging.cursors.before == null,
						},
						results.paging.cursors.before ?? ""
					),
					createActionButton(
						ButtonActions.NextPage,
						{
							label: translate("common.next", { lng }),
							disabled: results.paging.cursors.after == null,
						},
						results.paging.cursors.after ?? ""
					),
				],
			},
		],
		content: ` Risultati per la seguente ricerca richiesta da <@${id}>:\n\n**Nome**: ${
			options.name != null ? Util.escapeMarkdown(options.name) : "-"
		}\n**Id posizione**: ${
			options.location?.toString() ?? "-"
		}\n**Minimo membri**: ${options.minMembers ?? "-"}\n**Massimo membri**: ${
			options.maxMembers ?? "-"
		}\n**Punteggio minimo**: ${options.minScore ?? "-"}`,
		ephemeral,
	};
};
