import { ClanSearchResults, ClientRoyale, SearchClanOptions } from "apiroyale";
import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { t } from "i18next";
import { buildCustomButtonId, buildCustomMenuId } from "./customId";
import { ButtonActions, Emojis, MenuActions } from "./types";

export const searchClan = async (
	client: ClientRoyale,
	options: SearchClanOptions,
	{ ephemeral, lng }: { lng?: string; ephemeral?: boolean }
) => {
	const results = await client.clans.search(options).catch((error: Error) => {
		console.error(error);
		return { content: error.message, ephemeral: true };
	});

	if (!(results instanceof ClanSearchResults)) return results;
	if (!results.size)
		return {
			content: t("commands.clan.search.notFound", { lng }),
			ephemeral: true,
		};
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(buildCustomMenuId(MenuActions.ClanInfo))
			.addOptions(
				results.map((clan) => ({
					...t("commands.clan.search.menu.options", {
						lng,
						returnObjects: true,
						clan,
					}),
					value: clan.tag,
				}))
			)
			.setPlaceholder(t("commands.clan.search.menu.placeholder", { lng }))
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
			.setLabel(t("common.back", { lng }))
			.setDisabled(results.paging.cursors.before == null)
			.setStyle(MessageButtonStyles.PRIMARY),
		new MessageButton()
			.setCustomId(
				buildCustomButtonId(
					ButtonActions.NextPage,
					results.paging.cursors.after ?? ""
				)
			)
			.setEmoji(Emojis.ForwardArrow)
			.setLabel(t("common.next", { lng }))
			.setDisabled(results.paging.cursors.after == null)
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return {
		components: [row1, row2],
		ephemeral,
	};
};
