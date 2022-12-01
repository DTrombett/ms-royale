import type {
	APIButtonComponentWithCustomId,
	APIMessageComponentEmoji,
} from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { ButtonStyle } from "discord.js";
import { createActionId } from "./customId";
import type { ButtonActions } from "./types";
import { CustomEmojis, Emojis } from "./types";

/**
 * Emojis used for the buttons
 */
export const ButtonEmojis: Record<keyof ButtonActions, CustomEmojis | Emojis> =
	{
		rl: Emojis.Log,
		cr: CustomEmojis.ClanWar,
		ci: Emojis.CrossedSwords,
		pi: CustomEmojis.User,
		ai: CustomEmojis.Achievement,
		uc: CustomEmojis.Chest,
		cm: CustomEmojis.ClanMembers,
		sc: CustomEmojis.Search,
		pb: CustomEmojis.Badges,
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
export const createActionButton = <T extends keyof ButtonActions>(
	action: T,
	{
		emoji,
		style,
		label,
		disabled,
	}: {
		emoji?: CustomEmojis | Emojis;
		style?: APIButtonComponentWithCustomId["style"];
		label: string;
		disabled?: boolean;
	},
	...args: ButtonActions[T]
): APIButtonComponentWithCustomId => ({
	type: ComponentType.Button,
	custom_id: createActionId(action, ...args),
	emoji: resolveEmojiIdentifier(emoji ?? ButtonEmojis[action]),
	style: style ?? ButtonStyle.Primary,
	label,
	disabled: disabled ?? false,
});

export default createActionButton;
