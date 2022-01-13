import { ClanSearchResults, ClientRoyale, SearchClanOptions } from "apiroyale";
import {
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	Snowflake,
} from "discord.js";
import Constants from "../Constants";
import createActionButton from "../createActionButton";
import CustomClient from "../CustomClient";
import { buildCustomButtonId, buildCustomMenuId } from "../customId";
import translate from "../translate";
import { ButtonActions, Emojis, MenuActions } from "../types";

/**
 * Search a clan.
 * @param client - The client
 * @param tag - The options for the search
 * @param options - Additional options
 * @returns A promise that resolves with the message options
 */
export const searchClan = async (
	client: ClientRoyale,
	options: SearchClanOptions,
	{ ephemeral, lng, id }: { lng?: string; ephemeral?: boolean; id: Snowflake }
) => {
	const results = await client.clans.search(options).catch((error: Error) => {
		CustomClient.printToStderr(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(results instanceof ClanSearchResults)) return results;
	if (!results.size)
		return {
			content: translate("commands.clan.search.notFound", { lng }),
			ephemeral: true,
		};
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(buildCustomMenuId(MenuActions.ClanInfo))
			.addOptions(
				results.map((clan) => ({
					...translate("commands.clan.search.menu.options", {
						lng,

						clan,
					}),
					value: clan.tag,
				}))
			)
			.setPlaceholder(
				translate("commands.clan.search.menu.placeholder", { lng })
			)
	);
	const row2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.PreviousPage,
					results.paging.cursors.before ?? ""
				)
			)
			.setEmoji(Emojis.BackArrow)
			.setLabel(translate("common.back", { lng }))
			.setDisabled(results.paging.cursors.before == null)
			.setStyle(1),
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.NextPage,
					results.paging.cursors.after ?? ""
				)
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(translate("common.next", { lng }))
			.setDisabled(results.paging.cursors.after == null)
			.setStyle(1),
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
		)
	);

	return {
		components: [row1, row2],
		content: Constants.clanSearchResults(id, options),
		ephemeral,
	};
};
