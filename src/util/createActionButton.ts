import type { APIMessageComponentEmoji } from "discord-api-types/v9";
import type { ButtonStyle } from "discord.js";
import { ButtonComponent } from "discord.js";
import { buildCustomButtonId } from "./customId";
import type {
	ButtonActionsTypes} from "./types";
import {
	ButtonActions,
	CustomEmojis,
	Emojis,
} from "./types";

/**
 * Emojis used for the buttons
 */
export const ButtonEmojis: Record<ButtonActions, CustomEmojis | Emojis> = {
	[ButtonActions.NextPage]: Emojis.ForwardArrow,
	[ButtonActions.PreviousPage]: Emojis.BackArrow,
	[ButtonActions.RiverRaceLog]: Emojis.Log,
	[ButtonActions.CurrentRiverRace]: CustomEmojis.clanWar,
	[ButtonActions.ClanInfo]: Emojis.CrossedSwords,
	[ButtonActions.PlayerInfo]: CustomEmojis.user,
	[ButtonActions.PlayerAchievements]: CustomEmojis.achievement,
	[ButtonActions.PlayerUpcomingChests]: CustomEmojis.chest,
	[ButtonActions.ClanMembers]: CustomEmojis.clanMembers,
};

/**
 * Resolve an emoji identifier to a component emoji object.
 * @param emoji - The identifier of the emoji to use
 * @returns An emoji object
 */
export const resolveEmojiIdentifier = (
	emoji: CustomEmojis | Emojis
): APIMessageComponentEmoji => {
	const [start, name, id] = emoji.split(":") as (string | undefined)[];

	return {
		animated: start === "<a",
		name: name ?? emoji,
		id: id?.slice(0, -1),
	};
};

/**
 * Creates a button for an action
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
		emoji?: CustomEmojis | Emojis;
		style?: ButtonStyle;
		label: string;
		disabled?: boolean;
	},
	...args: ButtonActionsTypes[T]
) =>
	new ButtonComponent()
		.setCustomId(buildCustomButtonId(action, ...args))
		.setEmoji(resolveEmojiIdentifier(emoji ?? ButtonEmojis[action]))
		.setStyle(style ?? 1)
		.setLabel(label)
		.setDisabled(disabled ?? false);

export default createActionButton;
