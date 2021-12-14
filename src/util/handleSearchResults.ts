import type { ClanSearchResults } from "apiroyale";
import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import Constants, { ButtonActions, MenuActions } from "./Constants";
import { buildCustomButtonId, buildCustomMenuId } from "./customId";
import { Emojis } from "./types";

export const handleSearchResults = (results: ClanSearchResults) => ({
	components: [
		new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId(buildCustomMenuId(MenuActions.ClanInfo))
				.addOptions(
					results.map((clan) => ({
						label: clan.name,
						value: clan.tag,
						description: Constants.clanInfo(clan),
					}))
				)
				.setPlaceholder(Constants.clanInfoPlaceholder())
		),
		new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId(
					buildCustomButtonId(
						ButtonActions.PreviousPage,
						results.paging.cursors.before ?? ""
					)
				)
				.setEmoji(Emojis.BackArrow)
				.setLabel(Constants.backButtonLabel())
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
				.setLabel(Constants.afterButtonLabel())
				.setDisabled(results.paging.cursors.after == null)
				.setStyle(MessageButtonStyles.PRIMARY)
		),
	],
});
