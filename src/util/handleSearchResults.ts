import type { ClanSearchResults } from "apiroyale";
import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import Constants, { LocaleConstants } from "./Constants";
import { buildCustomButtonId, buildCustomMenuId } from "./customId";
import { ButtonActions, Emojis, MenuActions, SupportedLocales } from "./types";

export const handleSearchResults = (
	results: ClanSearchResults,
	locale: SupportedLocales
) => {
	const constants = LocaleConstants[locale];
	const row1 = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(buildCustomMenuId(MenuActions.ClanInfo))
			.addOptions(
				results.map((clan) => ({
					label: clan.name,
					value: clan.tag,
					description: Constants.clanInfo(clan),
				}))
			)
			.setPlaceholder(constants.CLAN_CHOOSE)
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
			.setLabel(constants.BACK)
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
			.setLabel(constants.AFTER)
			.setDisabled(results.paging.cursors.after == null)
			.setStyle(MessageButtonStyles.PRIMARY)
	);

	return {
		components: [row1, row2],
	};
};
