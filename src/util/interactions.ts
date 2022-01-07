import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { getInteractionLocale } from "./locales";

/**
 * Get the command string from an interaction.
 * @param interaction - The interaction to stringify
 */
export const interactionCommand = (
	interaction: AutocompleteInteraction | CommandInteraction
) => {
	let result = `/${interaction.commandName}`;

	interaction.options.data.forEach((option) => {
		result += ` ${option.name}`;
		if (option.value !== undefined)
			try {
				result += `:${option.value.toLocaleString(
					getInteractionLocale(interaction)
				)}`;
			} catch (error) {
				result += `:${option.value.toString()}`;
			}
	});
	return result as `/${string}`;
};
