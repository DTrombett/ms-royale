import {
	EmojiIdentifierResolvable,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { buildCustomButtonId } from "./customId";
import {
	ButtonActions,
	ButtonActionsTypes,
	CustomEmojis,
	Emojis,
} from "./types";

/**
 * Emojis used for the buttons
 */
export const ButtonEmojis = {
	[ButtonActions.NextPage]: Emojis.ForwardArrow,
	[ButtonActions.PreviousPage]: Emojis.BackArrow,
	[ButtonActions.RiverRaceLog]: Emojis.Log,
	[ButtonActions.CurrentRiverRace]: CustomEmojis.clanWar,
	[ButtonActions.ClanInfo]: Emojis.CrossedSwords,
	[ButtonActions.PlayerInfo]: CustomEmojis.user,
	[ButtonActions.PlayerAchievements]: CustomEmojis.achievement,
	[ButtonActions.PlayerUpcomingChests]: CustomEmojis.chest,
	[ButtonActions.ClanMembers]: CustomEmojis.clanMembers,
} as const;

/**
 * Creates a buttom for an action
 * @param action - The action to be performed
 * @param args - The arguments to be passed to the action
 * @returns A MessageButton with the given action and arguments
 */
export const createActionButton = <T extends ButtonActions>(
	action: T,
	{
		emoji,
		style,
		label,
		disabled,
	}: {
		emoji?: EmojiIdentifierResolvable;
		style?: MessageButtonStyleResolvable;
		label: string;
		disabled?: boolean;
	},
	...args: ButtonActionsTypes[T]
) =>
	new MessageButton()
		.setCustomId(buildCustomButtonId(action, ...args))
		.setEmoji(emoji ?? ButtonEmojis[action])
		.setStyle(style ?? 1)
		.setLabel(label)
		.setDisabled(disabled ?? false);

export default createActionButton;
