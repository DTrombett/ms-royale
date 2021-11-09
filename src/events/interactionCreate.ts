import type { ConstantsEvents } from "discord.js";
import type { EventOptions } from "../types";

export const event: EventOptions<ConstantsEvents["INTERACTION_CREATE"]> = {
	name: "interactionCreate",
	on(interaction) {
		if (interaction.isCommand())
			this.client.commands.get(interaction.commandName)?.run(interaction);
	},
};
