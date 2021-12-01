import type { ClanSearchResults } from "apiroyale";
import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ButtonActions } from ".";
import { Emojis } from "../types";
import Constants, { MenuActions } from "./Constants";

export const handleSearchResults = (results: ClanSearchResults) => ({
	components: [
		new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId(MenuActions.ClanInfo)
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
					`${ButtonActions.PreviousPage}-${results.paging.cursors.before ?? ""}`
				)
				.setEmoji(Emojis.BackArrow)
				.setLabel(Constants.backButtonLabel())
				.setDisabled(results.paging.cursors.before == null)
				.setStyle(MessageButtonStyles.PRIMARY),
			new MessageButton()
				.setCustomId(
					`${ButtonActions.NextPage}-${results.paging.cursors.after ?? ""}`
				)
				.setEmoji(Emojis.ForwardArrow)
				.setLabel(Constants.afterButtonLabel())
				.setDisabled(results.paging.cursors.after == null)
				.setStyle(MessageButtonStyles.PRIMARY)
		),
	],
});
